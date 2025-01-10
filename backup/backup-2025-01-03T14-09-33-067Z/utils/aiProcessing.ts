interface AIProcessingOptions {
  context?: {
    jobType?: string;
    location?: string;
    damageType?: string;
  };
  previousNotes?: string[];
}

interface ProcessedNote {
  text: string;
  type: 'note' | 'damage' | 'measurement' | 'equipment' | 'validation';
  metadata: {
    location?: string;
    severity?: string;
    value?: string;
    equipment?: string;
    status?: string;
    aiProcessed: boolean;
  };
  keyFindings?: string[];
  criticalIssues?: string[];
  nextSteps?: string[];
}

export async function processNoteWithAI(
  text: string,
  options: AIProcessingOptions = {}
): Promise<ProcessedNote> {
  const prompt = `
    Process this inspection note with the following context:
    - Job Type: ${options.context?.jobType || 'General Inspection'}
    - Location: ${options.context?.location || 'Unknown'}
    - Damage Type: ${options.context?.damageType || 'Not specified'}
    ${options.previousNotes?.length ? `\nPrevious Notes:\n${options.previousNotes.join('\n')}` : ''}
    
    Note: ${text}
    
    Analyze the note and provide:
    1. A structured and formatted version of the note
    2. The type of note (damage, measurement, equipment, validation, or general note)
    3. Key metadata (location, severity, measurements, etc.)
    4. Key findings
    5. Critical issues that need immediate attention
    6. Recommended next steps
    
    Format the response as JSON with the following structure:
    {
      "text": "formatted note text",
      "type": "note type",
      "metadata": {
        "location": "specific location",
        "severity": "high/medium/low",
        "value": "measurement value if applicable",
        "equipment": "equipment details if applicable",
        "status": "validation status if applicable",
        "aiProcessed": true
      },
      "keyFindings": ["finding 1", "finding 2"],
      "criticalIssues": ["critical issue 1"],
      "nextSteps": ["step 1", "step 2"]
    }
  `;

  try {
    const response = await fetch('/api/gemini/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to process note with AI');
    }

    const data = await response.json();
    const processedData = JSON.parse(data.data.text);

    // Ensure the response matches our expected structure
    return {
      text: processedData.text || text,
      type: processedData.type || 'note',
      metadata: {
        ...processedData.metadata,
        location: processedData.metadata?.location || options.context?.location,
        aiProcessed: true
      },
      keyFindings: processedData.keyFindings || [],
      criticalIssues: processedData.criticalIssues || [],
      nextSteps: processedData.nextSteps || []
    };
  } catch (error) {
    console.error('AI processing error:', error);
    // Fallback to basic processing if AI fails
    return {
      text,
      type: 'note',
      metadata: {
        location: options.context?.location,
        aiProcessed: false
      }
    };
  }
}
