import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domainSlug = searchParams.get('domain');
    const count = parseInt(searchParams.get('count') || '10');

    // For now, we'll generate mock questions or fetch from a test dataset
    // In a real implementation, you might:
    // 1. Fetch from OpenRouter's prompt library if available
    // 2. Use a curated dataset
    // 3. Generate questions based on domain
    
    // Mock questions for different domains
    const questionTemplates: Record<string, string[]> = {
      'code-generation': [
        'Write a Python function to reverse a linked list',
        'Implement a binary search algorithm in JavaScript',
        'Create a REST API endpoint for user authentication',
        'Write a SQL query to find duplicate records',
        'Implement a caching mechanism using Redis',
        'Create a function to validate email addresses using regex',
        'Write code to handle file uploads with size limits',
        'Implement pagination for a list of items',
        'Create a function to parse and validate JSON',
        'Write code to handle concurrent requests safely',
      ],
      'medical': [
        'What are the symptoms of diabetes?',
        'Explain the difference between Type 1 and Type 2 diabetes',
        'What are the side effects of common blood pressure medications?',
        'How does the immune system respond to viral infections?',
        'What are the risk factors for heart disease?',
        'Explain the process of blood clotting',
        'What is the recommended treatment for migraines?',
        'How do antibiotics work?',
        'What are the symptoms of a stroke?',
        'Explain the role of insulin in the body',
      ],
      'legal': [
        'What are the key elements of a valid contract?',
        'Explain the difference between civil and criminal law',
        'What is intellectual property and how is it protected?',
        'What are the requirements for a valid will?',
        'Explain the concept of negligence in tort law',
        'What is the difference between a misdemeanor and a felony?',
        'What are the rights of tenants in a rental agreement?',
        'Explain the process of filing for bankruptcy',
        'What constitutes workplace discrimination?',
        'What are the elements of a valid employment contract?',
      ],
      'default': [
        'Explain the concept in detail',
        'What are the key considerations?',
        'How would you approach this problem?',
        'What are the best practices?',
        'What are the potential challenges?',
        'How does this work?',
        'What are the important factors?',
        'What would you recommend?',
        'How can this be improved?',
        'What are the implications?',
      ],
    };

    // Get questions for the domain or use default
    const domainKey = domainSlug || 'default';
    const allQuestions = questionTemplates[domainKey] || questionTemplates['default'];
    
    // Select random questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(count, allQuestions.length));

    return NextResponse.json({ 
      data: selectedQuestions.map((q, idx) => ({
        id: `question-${idx + 1}`,
        text: q,
        domain: domainSlug || 'general',
      })),
      success: true 
    });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch questions',
        success: false 
      },
      { status: 500 }
    );
  }
}

