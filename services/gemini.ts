
import { supabase } from "./supabase";
import { PROJECT_GENERATION_PROMPT } from "./prompts/project-gen-prompt";

export class GeminiService {
  async generateInspirationImage(prompt: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'generateImage', payload: { prompt } }
      });

      if (error) {
        console.error('Error in gemini-proxy invocation:', error);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('Error generating image via proxy:', error);
      return null;
    }
  }

  async searchInsights(query: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'searchInsights', payload: { query } }
      });

      if (error) {
        console.error('Error in gemini-proxy invocation:', error);
        return "Continue criando coisas incríveis!";
      }

      return data?.text || "Continue criando coisas incríveis!";
    } catch (error) {
      console.error('Error searching insights via proxy:', error);
      return "Sua criatividade não tem limites.";
    }
  }

  async chat(message: string, history: { role: string, content: string }[] = []): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'chat', payload: { message, history } }
      });

      if (error) {
        console.error('Error in gemini-proxy chat:', error);
        return null;
      }

      return data?.text || null;
    } catch (error) {
      console.error('Error chatting via proxy:', error);
      return null;
    }
  }

  async analyzeBriefing(description: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'analyzeBriefing', payload: { description } }
      });

      if (error) {
        console.error('Error in gemini-proxy analyzeBriefing:', error);
        return null;
      }

      return data?.text || null;
    } catch (error) {
      console.error('Error analyzing briefing via proxy:', error);
      return null;
    }
  }

  async generateProjectStructure(description: string, contextProjects: any[] = []): Promise<any | null> {
    try {
      const contextStr = contextProjects.map(p => `Project: ${p.title} - Description: ${p.description}`).join('\n');

      console.log('Invoking gemini-proxy with action: generateProjectStructure');
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          action: 'generateProjectStructure',
          payload: {
            description,
            prompt: PROJECT_GENERATION_PROMPT,
            context: contextStr
          }
        }
      });

      if (error) {
        console.error('HTTP Error in gemini-proxy:', error);
        return null;
      }

      if (!data.success) {
        console.error('Function returned error:', data.error);
        console.error('Error stack:', data.stack);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('Error generating project structure via proxy:', error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
