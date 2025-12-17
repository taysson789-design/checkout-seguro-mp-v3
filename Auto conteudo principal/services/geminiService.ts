
import { UserAnswers, DocumentTemplate } from "../types";

// Função auxiliar para limpar código markdown
const cleanCode = (text: string) => {
  return text.replace(/```html/g, '').replace(/```/g, '').trim();
};

/**
 * GERAÇÃO DE TEXTO/CÓDIGO VIA POLLINATIONS (GRÁTIS & ALTA QUALIDADE)
 * Usa modelos como OpenAI/Claude via proxy gratuito.
 */
async function generateTextPollinations(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const fullPrompt = `${systemPrompt}\n\nCONTEXTO DO USUÁRIO:\n${userPrompt}`;
    const encodedPrompt = encodeURIComponent(fullPrompt);
    
    // model=openai garante alta qualidade (GPT-4o ou similar no backend deles)
    const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=openai&seed=${Math.floor(Math.random() * 1000)}`);
    
    if (!response.ok) throw new Error('Falha na Pollinations AI');
    
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Erro Pollinations:", error);
    return "Ocorreu um erro ao conectar com a Inteligência Artificial. Por favor, tente novamente.";
  }
}

/**
 * GERAÇÃO DE IMAGEM VIA POLLINATIONS (FLUX/SDXL)
 */
async function generateImagePollinations(prompt: string): Promise<string> {
  // Gera uma URL direta. O seed aleatório garante que a imagem mude a cada geração.
  const encodedPrompt = encodeURIComponent(prompt);
  // nologo=true remove marcas d'agua se possível
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}&model=flux`;
  return imageUrl; 
}

export const generateDocumentContent = async (template: DocumentTemplate, answers: UserAnswers, isPro: boolean = false): Promise<string> => {
  
  // 1. Construir Contexto
  let context = "DADOS FORNECIDOS PELO USUÁRIO:\n";
  let userPhotoBase64: string | null = null;

  for (const [id, val] of Object.entries(answers)) {
      // Se for a foto do usuário (CV), guardamos a base64 mas NÃO enviamos pro prompt de texto pra não estourar limite de URL
      if (id === 'user_photo' && Array.isArray(val) && val.length > 0) {
          userPhotoBase64 = val[0];
          context += `[FOTO DO PERFIL]: O usuário forneceu uma foto. Use a string '{{USER_PHOTO}}' no atributo src da tag img.\n`;
      } else {
          const step = template.steps.find(s => s.id === id);
          if (step) context += `[${step.question}]: ${Array.isArray(val) ? val.join(', ') : val}\n`;
      }
  }

  // 2. Roteamento por Tipo de Saída
  if (template.outputType === 'IMAGE') {
     // Para imagem, o prompt deve ser descritivo visualmente
     const prompt = `Best quality, masterpiece, ultra realistic, 8k. ${template.systemPrompt}. Context: ${context}`;
     return await generateImagePollinations(prompt);
  }

  // 3. Geração de Texto/Site
  let systemInstruction = `${template.systemPrompt}\n\nREGRAS ESTRUTURAIS (100% POWER):\n- Se for solicitado código ou site, use HTML5 + Tailwind CSS (via CDN) em um único arquivo.\n- Design deve ser EXTREMAMENTE moderno, profissional e de alto nível (Estilo Awwwards/Silicon Valley).\n- Use sombras (shadow-xl), bordas arredondadas (rounded-2xl), gradientes e tipografia premium.\n- Responda APENAS com o conteúdo final (o texto ou o código), sem introduções.`;
  
  let result = await generateTextPollinations(systemInstruction, context);
  
  if (template.outputType === 'SITE') {
      let code = cleanCode(result);
      // INJEÇÃO PÓS-PROCESSAMENTO: Substitui o placeholder pela foto real
      if (userPhotoBase64) {
          // Tenta substituir variações comuns que a IA pode gerar
          code = code.replace(/{{USER_PHOTO}}/g, userPhotoBase64)
                     .replace(/%7B%7BUSER_PHOTO%7D%7D/g, userPhotoBase64)
                     .replace(/src="[^"]*user_photo[^"]*"/gi, `src="${userPhotoBase64}"`);
      }
      return code;
  }

  return result;
};

export const refineDocumentContent = async (current: string, instruction: string, template: DocumentTemplate): Promise<string> => {
  const system = "Você é um editor sênior de classe mundial. Refine o conteúdo abaixo seguindo estritamente a instrução do usuário. Mantenha a formatação original (se for código HTML, mantenha a estrutura e melhore o design/conteúdo).";
  const prompt = `CONTEÚDO ORIGINAL:\n${current}\n\nO QUE MUDAR (INSTRUÇÃO DO USUÁRIO):\n${instruction}`;
  
  const result = await generateTextPollinations(system, prompt);
  
  if (template.outputType === 'SITE') {
    return cleanCode(result);
  }
  return result;
};

/**
 * NÚCLEO OMNI
 */
export const omniCoreGenerate = async (prompt: string, images: string[], mode: 'creative' | 'analytical' | 'executive'): Promise<string> => {
  
  let systemPrompt = "";
  if (mode === 'creative') {
    systemPrompt = "Modo Visionário: Respostas inspiradoras, artísticas, metafóricas e inovadoras.";
  } else if (mode === 'analytical') {
    systemPrompt = "Modo Analítico: Lógica pura, dados, precisão, listas e comparações.";
  } else {
    systemPrompt = "Modo Executivo: Estratégia de negócios, liderança, tom profissional, direto e focado em ROI.";
  }

  const context = images.length > 0 
    ? `[O usuário enviou imagens, mas neste modo texto, foque na descrição que ele deu]. Pergunta: ${prompt}` 
    : prompt;

  return await generateTextPollinations(systemPrompt, context);
};
