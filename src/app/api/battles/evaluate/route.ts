import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';

// Simple LLM judge evaluation using OpenRouter
async function evaluateWithLLM(
  judgeModelId: string,
  question: string,
  responseA: string,
  responseB: string
): Promise<'A' | 'B' | 'Tie'> {
  try {
    // Check if OpenRouter API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OpenRouter API key is not configured');
      return 'Tie'; // Default to Tie if API key is missing
    }

    // Call OpenRouter API to use an LLM as judge
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: judgeModelId,
        messages: [
          {
            role: 'system',
            content: 'You are an expert judge evaluating two AI responses to a question. You must determine which response is better, or if they are equal. Respond with only "A", "B", or "Tie".',
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nResponse A: ${responseA}\n\nResponse B: ${responseB}\n\nWhich response is better? Respond with only "A", "B", or "Tie".`,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent judging
        max_tokens: 100, // Limit tokens for judge responses (just need A, B, or Tie)
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim().toUpperCase() || 'Tie';
    
    if (result.includes('A') && !result.includes('B')) {
      return 'A';
    } else if (result.includes('B') && !result.includes('A')) {
      return 'B';
    } else {
      return 'Tie';
    }
  } catch (error) {
    console.error('Error evaluating with LLM judge:', error);
    // Default to Tie if evaluation fails
    return 'Tie';
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      question,
      modelAId,
      modelBId,
      responseA,
      responseB,
      judgeModelId,
    } = body;

    if (!question || !modelAId || !modelBId || !responseA || !responseB || !judgeModelId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Evaluate using LLM judge
    const winner = await evaluateWithLLM(judgeModelId, question, responseA, responseB);

    return NextResponse.json({
      success: true,
      winner,
      judgeModelId,
    });
  } catch (error: any) {
    console.error('Error in LLM judge evaluation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to evaluate battle' },
      { status: 500 }
    );
  }
}

