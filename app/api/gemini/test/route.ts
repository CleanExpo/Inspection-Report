import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function GET(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Test prompt for inspection report
    const testPrompt = {
      contents: [{
        parts: [{
          text: `Create a brief inspection report for water damage:
          - Location: Master bedroom
          - Damage type: Water damage from ceiling leak
          - Affected areas: Ceiling, walls, carpet
          Please include:
          1. Initial observations
          2. Extent of damage
          3. Recommended actions`
        }]
      }]
    };

    const response = await fetch(
      `${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPrompt)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Test content generated successfully'
    });

  } catch (error) {
    console.error('Gemini API test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate test content'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const body = await req.json();
    const { contents } = body;

    if (!contents) {
      throw new Error('No content provided');
    }

    const response = await fetch(
      `${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to process content');
    }

    const data = await response.json();

    // Extract and format the response
    const processedText = data.candidates[0]?.content?.parts[0]?.text || '';
    
    // Analyze the content for severity
    const severityIndicators = {
      high: ['severe', 'critical', 'immediate', 'dangerous', 'hazardous'],
      medium: ['moderate', 'attention', 'monitor', 'potential'],
      low: ['minor', 'minimal', 'slight', 'small']
    };

    let severity = 'medium';
    const lowerText = processedText.toLowerCase();
    
    if (severityIndicators.high.some(indicator => lowerText.includes(indicator))) {
      severity = 'high';
    } else if (severityIndicators.low.some(indicator => lowerText.includes(indicator))) {
      severity = 'low';
    }

    // Extract location mentions
    const locationMatch = processedText.match(/Location:?\s*([^\.|\n]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : undefined;

    return NextResponse.json({
      success: true,
      data: {
        text: processedText,
        metadata: {
          severity,
          location,
          aiProcessed: true
        }
      },
      message: 'Content processed successfully'
    });

  } catch (error) {
    console.error('Content processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process content'
      },
      { status: 500 }
    );
  }
}
