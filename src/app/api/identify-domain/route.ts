import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import { getDomainByName } from '@/lib/db/services/domainService';
import connectDB from '@/lib/db/connect';

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  let lastResponse: Response | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      lastResponse = response;
      
      if (response.ok) {
        return response;
      }
      
      // Handle 429 Rate Limit errors specifically
      if (response.status === 429) {
        // Try to get Retry-After header (in seconds)
        const retryAfter = response.headers.get('Retry-After');
        let delay = baseDelay * Math.pow(2, attempt);
        
        if (retryAfter) {
          // Use Retry-After header value if available (convert to milliseconds)
          delay = parseInt(retryAfter) * 1000;
        } else {
          // Exponential backoff for rate limits: 5s, 10s, 20s
          delay = 5000 * Math.pow(2, attempt);
        }
        
        lastError = new Error(`HTTP 429: Too Many Requests. Please wait and try again.`);
        
        // Only retry if we have attempts left
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
    }
    
    // For non-429 errors, use standard exponential backoff
    if (attempt < maxRetries - 1 && lastResponse?.status !== 429) {
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Failed after retries');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const file = formData.get('file') as File | null;

    // Text is mandatory
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text description is required' },
        { status: 400 }
      );
    }

    // Check if OpenRouter API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'OpenRouter API key is not configured',
          success: false 
        },
        { status: 500 }
      );
    }

    // Use a free model from OpenRouter
    // Try to use a vision-capable model if image is provided, otherwise use text-only model
    const modelId = 'meta-llama/llama-3.2-3b-instruct:free'; // Free model
    
    // Validate file type - only allow images and PDFs
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      if (!isImage && !isPDF) {
        return NextResponse.json(
          { error: 'Only image files (JPG, PNG, GIF, etc.) and PDF files are allowed' },
          { status: 400 }
        );
      }
    }

    // If no file is provided, check database first for exact match (case-insensitive)
    if (!file) {
      await connectDB();
      const trimmedText = text.trim();
      const existingDomain = await getDomainByName(trimmedText);
      
      if (existingDomain) {
        // Domain found in database, return it directly without calling LLM
        return NextResponse.json({
          success: true,
          domainName: (existingDomain as any).name,
          fromDatabase: true, // Flag to indicate it came from DB
        });
      }
      // Domain not found in DB, continue to LLM identification
    }
    // If file is provided, always call LLM (can't search DB with file content)

    // If file is provided and it's a PDF, extract text content
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      // For PDF files, we need to extract text
      // Note: This is a simplified approach. For production, consider using a PDF parsing library
      try {
        const arrayBuffer = await file.arrayBuffer();
        // Try to extract text from PDF (basic approach - may not work for all PDFs)
        // For better PDF text extraction, consider using a library like pdf-parse
        const buffer = Buffer.from(arrayBuffer);
        // Simple text extraction - look for readable text in the buffer
        const textContent = buffer.toString('utf-8').substring(0, 10000); // Limit to first 10KB
        // Append file content to the text
        const fullText = text ? `${text}\n\nPDF content:\n${textContent}` : `PDF content:\n${textContent}`;
        
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
              messages: [
                {
                  role: 'user',
                  content: `Based on the following description, identify the most appropriate domain category for this use case. 

Description: ${fullText}

Respond with ONLY the domain name in a single word or short phrase (e.g., "Code Generation", "Medical Assistance", "Legal Document Analysis", "Customer Support", "Content Creation", etc.). Do not include any explanation, just the domain name.`
                }
              ],
              max_tokens: 50,
              temperature: 0.3,
            }),
          },
          3,
          2000
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        const domainName = data.choices?.[0]?.message?.content?.trim() || '';

        if (!domainName) {
          return NextResponse.json(
            { error: 'Failed to identify domain from LLM response' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          domainName: domainName,
        });
      } catch (error: any) {
        console.error('Error processing PDF:', error);
        return NextResponse.json(
          { error: 'Failed to process PDF file. Please try with an image or text description.' },
          { status: 500 }
        );
      }
    }
    
    // Prepare the prompt
    const prompt = `Based on the following description${file ? ' and any attached image' : ''}, identify the most appropriate domain category for this use case. 

Description: ${text || 'No text description provided'}

Respond with ONLY the domain name in a single word or short phrase (e.g., "Code Generation", "Medical Assistance", "Legal Document Analysis", "Customer Support", "Content Creation", etc.). Do not include any explanation, just the domain name.`;

    // Prepare messages for OpenRouter
    const messages: any[] = [
      {
        role: 'user',
        content: []
      }
    ];

    // Add text content
    if (text) {
      messages[0].content.push({
        type: 'text',
        text: prompt
      });
    } else {
      // If no text, use just the prompt without text type
      messages[0].content = prompt;
    }

    // Add image if provided (only for image files) - use OCR to extract text
    if (file && file.type.startsWith('image/')) {
      try {
        // Use OCR to extract text from image
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Create Tesseract worker for OCR
        const worker = await createWorker('eng');
        const { data: { text: extractedText } } = await worker.recognize(buffer);
        await worker.terminate();
        
        // Combine user text with extracted image text
        const fullText = extractedText.trim() 
          ? `${text}\n\nImage content:\n${extractedText.trim()}`
          : text;
        
        // Update prompt with extracted text
        const updatedPrompt = `Based on the following description${extractedText.trim() ? ' and text extracted from the attached image' : ''}, identify the most appropriate domain category for this use case. 

Description: ${fullText}

Respond with ONLY the domain name in a single word or short phrase (e.g., "Code Generation", "Medical Assistance", "Legal Document Analysis", "Customer Support", "Content Creation", etc.). Do not include any explanation, just the domain name.`;
        
        // Use text-only model with extracted text
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
              messages: [
                {
                  role: 'user',
                  content: updatedPrompt
                }
              ],
              max_tokens: 50,
              temperature: 0.3,
            }),
          },
          3,
          2000
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        const domainName = data.choices?.[0]?.message?.content?.trim() || '';

        if (!domainName) {
          return NextResponse.json(
            { error: 'Failed to identify domain from LLM response' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          domainName: domainName,
        });
      } catch (error: any) {
        console.error('Error processing image with OCR:', error);
        // Fallback: use text description only if OCR fails
        const fallbackPrompt = `Based on the following description, identify the most appropriate domain category for this use case. 

Description: ${text}

Note: An image was provided but could not be processed. Please identify the domain based on the text description only.

Respond with ONLY the domain name in a single word or short phrase (e.g., "Code Generation", "Medical Assistance", "Legal Document Analysis", "Customer Support", "Content Creation", etc.). Do not include any explanation, just the domain name.`;
        
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
              messages: [
                {
                  role: 'user',
                  content: fallbackPrompt
                }
              ],
              max_tokens: 50,
              temperature: 0.3,
            }),
          },
          3,
          2000
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return NextResponse.json(
            { error: errorData.error?.message || 'Failed to process image and identify domain' },
            { status: 500 }
          );
        }

        const data = await response.json();
        const domainName = data.choices?.[0]?.message?.content?.trim() || '';

        if (!domainName) {
          return NextResponse.json(
            { error: 'Failed to identify domain from LLM response' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          domainName: domainName,
        });
      }
    }

    // Call OpenRouter API
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
          messages: messages,
          max_tokens: 50, // Short response, just domain name
          temperature: 0.3, // Lower temperature for more consistent results
        }),
      },
      3,
      2000
    );

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      
      if (response.status === 402) {
        return NextResponse.json(
          { error: 'Insufficient credits. Please check your OpenRouter account.' },
          { status: 402 }
        );
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'API access forbidden. Please check your API key.' },
          { status: 403 }
        );
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const domainName = data.choices?.[0]?.message?.content?.trim() || '';

    if (!domainName) {
      return NextResponse.json(
        { error: 'Failed to identify domain from LLM response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      domainName: domainName,
    });
  } catch (error: any) {
    console.error('Error identifying domain:', error);
    
    // Check if it's a 429 rate limit error
    if (error.message && error.message.includes('429')) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          success: false 
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to identify domain',
        success: false 
      },
      { status: 500 }
    );
  }
}

