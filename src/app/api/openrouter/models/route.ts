import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch models from OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform OpenRouter models to our format
    const models = (data.data || []).map((model: any) => {
      // Extract provider from model ID (format: "provider/model-name")
      const modelIdParts = model.id.split('/');
      const provider = modelIdParts.length > 1 ? modelIdParts[0] : 'OpenRouter';
      
      return {
        id: model.id,
        name: model.name || model.id,
        description: model.description || '',
        provider: provider,
        pricing: model.pricing ? {
          prompt: model.pricing.prompt || '0',
          completion: model.pricing.completion || '0',
        } : undefined,
        contextLength: model.context_length || 0,
        architecture: model.architecture || {},
        topProvider: model.top_provider || {},
      };
    });

    return NextResponse.json({ 
      data: models,
      success: true 
    });
  } catch (error: any) {
    console.error('Error fetching OpenRouter models:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch models from OpenRouter',
        success: false 
      },
      { status: 500 }
    );
  }
}

