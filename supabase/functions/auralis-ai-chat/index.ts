import { corsHeaders } from '../_shared/cors.ts';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  systemPrompt: string;
  agentName: string;
  agentCategory: string;
  agentPersonality: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!apiKey || !baseUrl) {
      return new Response(
        JSON.stringify({ error: 'OnSpace AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const { messages, systemPrompt, agentName, agentCategory, agentPersonality } = body;

    const systemContent = `You are ${agentName}, an intelligent AI voice agent specializing in ${agentCategory.replace(/-/g, ' ')}.

${systemPrompt ? `Your instructions: ${systemPrompt}` : ''}

Personality: ${agentPersonality || 'Professional, helpful, and conversational.'}

IMPORTANT RULES:
- Keep responses concise and natural for voice conversations (2-4 sentences max unless complex topic)
- Speak in first person as ${agentName}
- Be warm, engaging, and genuinely helpful
- Avoid bullet points or markdown - speak naturally
- End with a follow-up question or helpful offer when appropriate`;

    const aiMessages = [
      { role: 'system', content: systemContent },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    console.log(`[auralis-ai-chat] Sending ${aiMessages.length} messages for agent: ${agentName}`);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: aiMessages,
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[auralis-ai-chat] OnSpace AI error: ${errorText}`);
      return new Response(
        JSON.stringify({ error: `OnSpace AI error: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    console.log(`[auralis-ai-chat] Response generated: ${content.slice(0, 80)}...`);

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[auralis-ai-chat] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
