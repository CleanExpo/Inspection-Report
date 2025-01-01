const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GenerateContentRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GenerateContentResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

async function generateContent(prompt: string): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const response = await fetch(
      `${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        } as GenerateContentRequest)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate content');
    }

    const data = await response.json() as GenerateContentResponse;
    return data.candidates[0]?.content.parts[0]?.text || '';
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function transcribeVoice(
  audioBlob: Blob,
  options: {
    language?: string;
    taskType?: 'transcription' | 'commands' | 'notes';
    maxDuration?: number;
  } = {}
): Promise<{
  text: string;
  confidence: number;
  timestamps?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}> {
  try {
    // Convert audio blob to base64
    const audioBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(audioBlob);
    });

    // For now, we'll use text model since audio is not yet supported
    const prompt = `Transcribe this audio content (simulated for development)`;
    const transcription = await generateContent(prompt);

    return {
      text: transcription,
      confidence: 0.95,
      timestamps: []
    };
  } catch (error) {
    console.error('Voice transcription error:', error);
    throw new Error('Failed to transcribe voice input');
  }
}

export async function processInspectionNotes(
  text: string,
  context: {
    jobType: string;
    location: string;
    damageType?: string;
    previousNotes?: string[];
  }
): Promise<string> {
  try {
    const prompt = `
      Context: Processing inspection notes for a ${context.jobType} job at ${context.location}.
      ${context.damageType ? `Damage type: ${context.damageType}` : ''}
      
      Previous notes: ${context.previousNotes?.join('\n') || 'None'}
      
      New input: ${text}
      
      Please:
      1. Format and structure the notes
      2. Highlight key findings
      3. Flag any critical issues
      4. Suggest next steps
      5. Maintain Australian English spelling
    `;

    return await generateContent(prompt);
  } catch (error) {
    console.error('Note processing error:', error);
    throw new Error('Failed to process inspection notes');
  }
}

export async function analyzeVoiceCommand(
  command: string
): Promise<{
  intent: string;
  action: string;
  parameters: Record<string, any>;
}> {
  try {
    const prompt = `
      Analyze the following voice command for an inspection report system:
      "${command}"
      
      Return a structured response with:
      1. The user's intent
      2. The specific action to take
      3. Any relevant parameters
      
      Format as JSON.
    `;

    const response = await generateContent(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Command analysis error:', error);
    throw new Error('Failed to analyze voice command');
  }
}

export async function streamVoiceToText(
  stream: ReadableStream<Uint8Array>,
  onTranscription: (text: string) => void
): Promise<void> {
  try {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);

      // Process accumulated chunks when we have enough data
      if (chunks.length >= 5) { // Adjust this threshold as needed
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const result = await transcribeVoice(audioBlob);
        onTranscription(result.text);
        chunks.length = 0; // Clear processed chunks
      }
    }

    // Process any remaining chunks
    if (chunks.length > 0) {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      const result = await transcribeVoice(audioBlob);
      onTranscription(result.text);
    }
  } catch (error) {
    console.error('Stream processing error:', error);
    throw new Error('Failed to process voice stream');
  }
}
