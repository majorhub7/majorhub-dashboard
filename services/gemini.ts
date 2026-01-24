
import { supabase } from "./supabase";
import { PROJECT_GENERATION_PROMPT } from "./prompts/project-gen-prompt";

export class GeminiService {
  async generateInspirationImage(prompt: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'generateImage', payload: { prompt } }
      });

      if (error) {
        return null;
      }

      return data?.data || null;
    } catch (error) {
      return null;
    }
  }

  async searchInsights(query: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'searchInsights', payload: { query } }
      });

      if (error) {
        return "Continue criando coisas incríveis!";
      }

      return data?.text || "Continue criando coisas incríveis!";
    } catch (error) {
      return "Sua criatividade não tem limites.";
    }
  }

  async chat(message: string, history: { role: string, content: string }[] = []): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'chat', payload: { message, history } }
      });

      if (error) {
        return null;
      }

      return data?.text || null;
    } catch (error) {
      return null;
    }
  }

  async analyzeBriefing(description: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'analyzeBriefing', payload: { description } }
      });

      if (error) {
        return null;
      }

      return data?.text || null;
    } catch (error) {
      return null;
    }
  }

  async generateProjectStructure(description: string, contextProjects: any[] = []): Promise<any | null> {
    try {
      const contextStr = contextProjects.map(p => `Project: ${p.title} - Description: ${p.description}`).join('\n');

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
        return null;
      }

      if (!data.success) {
        return null;
      }

      return data?.data || null;
    } catch (error) {
      return null;
    }
  }
}

export const geminiService = new GeminiService();
