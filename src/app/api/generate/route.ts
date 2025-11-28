import { NextRequest, NextResponse } from 'next/server';

// Retry function with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    
    // If rate limited (429), retry with exponential backoff
    if (response.status === 429) {
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;
        
        console.log(`Rate limited. Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      } else {
        // Last attempt failed
        return response;
      }
    }
    
    // For other errors or success, return immediately
    return response;
  }
  
  // Should never reach here, but TypeScript needs it
  throw new Error('Max retries exceeded');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, prompt } = body;

    if (!modelId || !prompt) {
      return NextResponse.json(
        { error: 'Missing modelId or prompt' },
        { status: 400 }
      );
    }

    // Check if OpenRouter API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in Azure App Service environment variables.',
          success: false 
        },
        { status: 500 }
      );
    }

    // Call OpenRouter API with retry logic
    // Limit max_tokens to stay within free tier limits (default: 1000 tokens)
    const maxTokens = Math.min(1000, parseInt(process.env.OPENROUTER_MAX_TOKENS || '1000'));
    
    const response = await fetchWithRetry(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
        }),
      },
      3, // max retries
      2000 // base delay 2 seconds
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || response.statusText;
      
      // Handle payment/credit errors more gracefully
      if (response.status === 402) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits. Please upgrade your OpenRouter account or reduce max_tokens.',
            details: errorMessage,
            success: false 
          },
          { status: 402 }
        );
      }
      
      // Handle rate limiting errors
      if (response.status === 429) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded. Please wait a moment and try again.',
            details: errorMessage || 'Too many requests to OpenRouter API. Please try again in a few seconds.',
            success: false 
          },
          { status: 429 }
        );
      }
      
      // Handle forbidden errors (403) - usually means model access denied or API key issue
      if (response.status === 403) {
        return NextResponse.json(
          { 
            error: 'Access denied. The model may not be available or your API key may not have permission.',
            details: errorMessage || 'Forbidden - Provider returned error',
            success: false 
          },
          { status: 403 }
        );
      }
      
      throw new Error(`OpenRouter API error: ${response.statusText} - ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error: any) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate response',
        success: false 
      },
      { status: 500 }
    );
  }
}

