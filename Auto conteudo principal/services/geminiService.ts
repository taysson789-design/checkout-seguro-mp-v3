
import { UserAnswers, DocumentTemplate } from "../types";
import { GoogleGenAI } from "@google/genai";

// Tenta obter a chave do ambiente (Suporte a VITE_)
const GOOGLE_API_KEY = process.env.API_KEY || (import.meta as any).env?.VITE_GOOGLE_API_KEY || "";

/**
 * Função auxiliar para converter Blob em Base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * GERAÇÃO DE TEXTO/CÓDIGO VIA GOOGLE GEMINI 2.5 FLASH (PREFERENCIAL)
 */
async function generateTextGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  // Se não tiver chave, vai direto para o fallback sem tentar e causar erro
  if (!GOOGLE_API_KEY) {
    console.warn("Google API Key não encontrada. Usando Pollinations (Gratuito).");
    return generateTextPollinations(systemPrompt, userPrompt);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nUSER REQUEST: ${userPrompt}` }] }
      ],
      config: {
        temperature: 0.7, 
        topK: 40,
        topP: 0.95,
      }
    });

    if (!response.text) throw new Error("Resposta vazia do Gemini");
    return response.text;
  } catch (error) {
    console.error("Erro na API Gemini (Tentando Fallback):", error);
    return generateTextPollinations(systemPrompt, userPrompt);
  }
}

/**
 * FALLBACK ROBUSTO: GERAÇÃO DE TEXTO VIA POLLINATIONS
 */
async function generateTextPollinations(systemPrompt: string, userPrompt: string): Promise<string> {
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    // TENTATIVA 1: POST request (Melhor para textos longos)
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt }, 
          { role: 'user', content: userPrompt }
        ],
        model: 'openai', // Tenta modelo padrão
        seed: Math.floor(Math.random() * 1000),
      }),
    });

    if (response.ok) {
        const text = await response.text();
        if (text && text.length > 5) return text;
    }
    
    throw new Error("Falha no POST, tentando GET...");

  } catch (error) {
    console.warn("Erro no Pollinations POST, tentando método GET simplificado...", error);
    
    // TENTATIVA 2: GET request (Mais simples, URL encoded)
    // Limita o tamanho para evitar erro de URI too long
    const safePrompt = encodeURIComponent(fullPrompt.substring(0, 1500)); 
    try {
        const url = `https://text.pollinations.ai/${safePrompt}?model=openai`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Erro no Pollinations GET");
        return await res.text();
    } catch (finalError) {
        console.error("Erro fatal na geração de texto:", finalError);
        return "Desculpe, os serviços de IA estão instáveis no momento. Por favor, verifique sua conexão ou tente novamente em alguns segundos.";
    }
  }
}

/**
 * GERAÇÃO DE IMAGEM VIA POLLINATIONS (FLUX)
 */
async function generateImagePollinations(prompt: string, width: number = 1024, height: number = 1024): Promise<string> {
  const safetyFilter = "safe content, no nsfw, no nudity, no violence, high quality";
  // Simplifica o prompt para URL
  const cleanPrompt = prompt.substring(0, 300).replace(/[^a-zA-Z0-9, ]/g, "");
  const finalPrompt = `${cleanPrompt}, ${safetyFilter}`;
  
  const encodedPrompt = encodeURIComponent(finalPrompt);
  const seed = Math.floor(Math.random() * 1000000);
  
  // URL Flux Otimizada
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux&enhance=true`;

  try {
    // Tenta fazer um fetch apenas para validar se a imagem carrega (opcional, mas bom pra UX)
    // Se falhar, retornamos a URL mesmo assim para o navegador tentar carregar no <img>
    return url;
  } catch (error) {
    return url;
  }
}

/**
 * FUNÇÃO DE REFINAMENTO (CHAT DE EDIÇÃO)
 */
export const refineDocumentContent = async (
  currentContent: string, 
  instruction: string, 
  template: DocumentTemplate
): Promise<string> => {
  
  const isSite = template.outputType === 'SITE';
  const isImage = template.outputType === 'IMAGE';

  // --- REFINAMENTO DE IMAGEM ---
  if (isImage) {
      const promptSystem = `
        You are an expert AI Art Prompt Engineer.
        The user wants to CHANGE or EDIT an existing image.
        USER INSTRUCTION: "${instruction}"
        Create a NEW, complete prompt that incorporates the user's change request.
        Output ONLY the raw prompt text.
      `;
      const newPrompt = await generateTextGemini(promptSystem, "Create refined prompt");
      
      let w = 1024;
      let h = 1024;
      if (instruction.toLowerCase().includes('banner') || instruction.toLowerCase().includes('capa')) {
          w = 1280; h = 720;
      }
      
      return await generateImagePollinations(newPrompt, w, h);
  }
  
  // --- REFINAMENTO DE TEXTO / SITE ---
  const systemPrompt = isSite 
    ? `Você é um Desenvolvedor Frontend Sênior.
       EDITAR código HTML.
       REGRAS: Retorne APENAS o código HTML corrigido. Mantenha bibliotecas (Tailwind).
       INSTRUÇÃO: "${instruction}"`
    : `Você é um Editor Chefe.
       REESCREVER texto.
       INSTRUÇÃO: "${instruction}"`;

  const userPrompt = `
    CONTEÚDO ATUAL:
    ${currentContent.substring(0, 4000)} 
    
    (Texto truncado para caber no limite, mantenha o resto ou reescreva a parte solicitada)

    SOLICITAÇÃO DE ALTERAÇÃO: "${instruction}"
  `;

  let text = await generateTextGemini(systemPrompt, userPrompt);

  // Limpeza de código para sites
  if (isSite) {
    text = text.replace(/```html/g, '').replace(/```/g, '');
    const docTypeIndex = text.indexOf('<!DOCTYPE html>');
    if (docTypeIndex !== -1) text = text.substring(docTypeIndex);
    if (!text.includes('<!DOCTYPE html>') && text.includes('<html')) text = '<!DOCTYPE html>\n' + text;
    text = text.trim();
  }

  return text;
};

/**
 * FUNÇÃO PRINCIPAL DE GERAÇÃO
 */
export const generateDocumentContent = async (
  template: DocumentTemplate,
  answers: UserAnswers,
  isPro: boolean = false 
): Promise<string> => {
  
  // --- 1. IMAGEM (FLUX) ---
  if (template.outputType === 'IMAGE') {
    let rawUserInputs = "";
    let width = 1024;
    let height = 1024;
    let style = "Photorealistic";

    // Detecta Aspect Ratio do template Banner ou Geral
    const ratioAnswer = answers['aspect_ratio'] || answers['platform_format'];

    if (typeof ratioAnswer === 'string') {
        if (ratioAnswer === '16:9') { width = 1280; height = 720; }
        else if (ratioAnswer === '9:16') { width = 720; height = 1280; }
        else if (ratioAnswer === '3:4') { width = 768; height = 1024; }
        else if (ratioAnswer === '1:1') { width = 1024; height = 1024; }
        else if (ratioAnswer === '4:1') { width = 1500; height = 375; }
        else if (ratioAnswer === '3:1') { width = 1500; height = 500; }
    }

    for (const [stepId, answer] of Object.entries(answers)) {
      if (stepId === 'image_style' || stepId === 'visual_style') {
        style = answer as string;
      } else if (stepId !== 'aspect_ratio' && stepId !== 'platform_format') {
        const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
        rawUserInputs += `${answerText}, `;
      }
    }

    // Simplifica a chamada para o prompt engineer para evitar falhas
    const promptEngineeringSystem = `Create a detailed English image prompt based on: ${rawUserInputs}. Style: ${style}. Output ONLY the prompt.`;
    const enhancedPrompt = await generateTextGemini(promptEngineeringSystem, "Optimize prompt");
    
    return await generateImagePollinations(enhancedPrompt, width, height);
  }

  // --- 2. TEXTO / SITE ---
  let answersContext = "";
  let userImageBase64: string | null = null;
  let instagramImageUrl = "";

  if (template.id === 'instagram-post') {
      const topic = answers['post_topic'] || 'lifestyle';
      const promptSystem = `Create image prompt for Instagram: ${topic}`;
      try {
        const imgPrompt = await generateTextGemini(promptSystem, "Generate prompt");
        instagramImageUrl = await generateImagePollinations(imgPrompt, 1024, 1024);
      } catch (e) { console.warn("Erro img insta", e); }
  }

  for (const [stepId, answer] of Object.entries(answers)) {
    const step = template.steps.find(s => s.id === stepId);
    if (typeof answer === 'string' && answer.startsWith('data:image')) {
        userImageBase64 = answer;
        answersContext += `- ${step?.question || 'Imagem'}: [IMAGEM_USUARIO_FORNECIDA]\n`;
    } else if (step) {
      const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
      answersContext += `- ${step.question}: "${answerText}"\n`;
    }
  }

  const isSite = template.outputType === 'SITE';
  const fullPromptText = `
    DADOS DO USUÁRIO:
    ${answersContext}
    
    INSTRUÇÕES:
    ${isSite 
      ? 'Gere um site SINGLE-FILE HTML moderno. Use <script src="https://cdn.tailwindcss.com"></script>. Design Clean, Responsivo, Profissional. Use [[USER_IMAGE_SRC]] para imagens principais.' 
      : 'Gere conteúdo rico, persuasivo e bem formatado em Markdown.'}
  `;

  let text = await generateTextGemini(template.systemPrompt, fullPromptText);

  // Pós-Processamento
  if (isSite) {
    text = text.replace(/```html/g, '').replace(/```/g, '');
    const docTypeIndex = text.indexOf('<!DOCTYPE html>');
    if (docTypeIndex !== -1) text = text.substring(docTypeIndex);
    if (!text.includes('<!DOCTYPE html>') && text.includes('<html')) text = '<!DOCTYPE html>\n' + text;
    text = text.trim();

    if (userImageBase64) {
        text = text.replace(/\[\[USER_IMAGE_SRC\]\]/g, userImageBase64);
        if (!text.includes(userImageBase64)) text = text.replace(/src="https:\/\/via\.placeholder\.com\/.*?"/g, `src="${userImageBase64}"`);
    } else {
        text = text.replace(/\[\[USER_IMAGE_SRC\]\]/g, "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1080&q=80");
    }
  }

  if (template.id === 'instagram-post' && instagramImageUrl) {
      text += `\n\n[[GENERATED_IMAGE_URL:${instagramImageUrl}]]`;
  }

  return text;
};
