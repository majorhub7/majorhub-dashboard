// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@latest"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { action, payload } = await req.json()
        const apiKey = Deno.env.get('GEMINI_API_KEY')

        if (!apiKey) {
            return new Response(
                JSON.stringify({ success: false, error: 'API Key missing' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        console.log(`Action: ${action} | Key: ${apiKey.substring(0, 10)}...`);

        const genAI = new GoogleGenerativeAI(apiKey)

        if (action === 'listModels') {
            const result = await genAI.listModels();
            const models = [];
            for await (const model of result) {
                models.push({ name: model.name, methods: model.supportedGenerationMethods });
            }
            return new Response(
                JSON.stringify({ success: true, models }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        if (action === 'chat') {
            const { message, history = [] } = payload;
            // Updated model names based on current availability (Jan 2026)
            const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"];
            let lastError = null;

            for (const modelName of modelsToTry) {
                try {
                    console.log(`Trying: ${modelName}`);
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        systemInstruction: "You are the Major Hub Creative Assistant. Respond in Portuguese (PT-BR)."
                    })

                    const chat = model.startChat({
                        history: history.map((msg: any) => ({
                            role: msg.role === 'user' ? 'user' : 'model',
                            parts: [{ text: msg.content }]
                        }))
                    });

                    const result = await chat.sendMessage(message);
                    console.log(`Success: ${modelName}`);

                    return new Response(
                        JSON.stringify({ success: true, text: result.response.text(), modelUsed: modelName }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
                    )
                } catch (err: any) {
                    console.error(`Failed ${modelName}:`, err.message);
                    lastError = err;

                    const isRetryable = err.status === 429 || err.status === 404 ||
                        err.message?.includes('429') || err.message?.includes('404') ||
                        err.message?.includes('quota') || err.message?.includes('not found');

                    if (isRetryable) continue;
                    break;
                }
            }

            return new Response(
                JSON.stringify({ success: false, error: lastError?.message || 'All models failed' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        return new Response(JSON.stringify({ success: false, error: 'Invalid action' }), { headers: corsHeaders, status: 200 });

    } catch (error: any) {
        console.error('Global Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
