import twilio from "twilio";
import { ENV } from "./_core/env";

// Inicializar cliente Twilio
const twilioClient = twilio(
  ENV.twilioAccountSid,
  ENV.twilioAuthToken
);

/**
 * Enviar mensagem WhatsApp via Twilio
 */
export async function enviarMensagemWhatsApp(
  telefoneDestino: string,
  mensagem: string
): Promise<{ sucesso: boolean; idMensagem?: string; erro?: string }> {
  try {
    if (!ENV.twilioWhatsappNumber) {
      throw new Error("Número WhatsApp do Twilio não configurado");
    }

    const resultado = await twilioClient.messages.create({
      from: `whatsapp:${ENV.twilioWhatsappNumber}`,
      to: `whatsapp:${telefoneDestino}`,
      body: mensagem,
    });

    return {
      sucesso: true,
      idMensagem: resultado.sid,
    };
  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : String(erro);
    console.error("[Twilio] Erro ao enviar mensagem:", mensagemErro);
    return {
      sucesso: false,
      erro: mensagemErro,
    };
  }
}

/**
 * Enviar mensagem com mídia (imagem, documento, etc)
 */
export async function enviarMensagemComMidia(
  telefoneDestino: string,
  mensagem: string,
  urlMidia: string,
  tipoMidia: "image" | "document" | "audio" | "video" = "image"
): Promise<{ sucesso: boolean; idMensagem?: string; erro?: string }> {
  try {
    if (!ENV.twilioWhatsappNumber) {
      throw new Error("Número WhatsApp do Twilio não configurado");
    }

    const resultado = await twilioClient.messages.create({
      from: `whatsapp:${ENV.twilioWhatsappNumber}`,
      to: `whatsapp:${telefoneDestino}`,
      body: mensagem,
      mediaUrl: [urlMidia],
    });

    return {
      sucesso: true,
      idMensagem: resultado.sid,
    };
  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : String(erro);
    console.error("[Twilio] Erro ao enviar mensagem com mídia:", mensagemErro);
    return {
      sucesso: false,
      erro: mensagemErro,
    };
  }
}

/**
 * Enviar mensagem de template (para notificações)
 */
export async function enviarTemplateWhatsApp(
  telefoneDestino: string,
  nomeTemplate: string,
  parametros: string[]
): Promise<{ sucesso: boolean; idMensagem?: string; erro?: string }> {
  try {
    if (!ENV.twilioWhatsappNumber) {
      throw new Error("Número WhatsApp do Twilio não configurado");
    }

    // Nota: Twilio não suporta templates diretamente via API simples
    // Para usar templates, seria necessário usar a API de Content Templates
    // Por enquanto, vamos enviar mensagem formatada manualmente

    let mensagem = nomeTemplate;
    parametros.forEach((param, index) => {
      mensagem = mensagem.replace(`{{${index + 1}}}`, param);
    });

    return enviarMensagemWhatsApp(telefoneDestino, mensagem);
  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : String(erro);
    console.error("[Twilio] Erro ao enviar template:", mensagemErro);
    return {
      sucesso: false,
      erro: mensagemErro,
    };
  }
}

/**
 * Validar número de telefone
 */
export function validarTelefoneWhatsApp(telefone: string): boolean {
  // Remover caracteres especiais
  const telefoneLimpo = telefone.replace(/\D/g, "");

  // Verificar se tem pelo menos 10 dígitos (formato brasileiro)
  if (telefoneLimpo.length < 10) {
    return false;
  }

  // Se não tiver código de país, adicionar 55 (Brasil)
  if (!telefone.includes("+")) {
    return true; // Assumir que é válido se tiver 10+ dígitos
  }

  return true;
}

/**
 * Formatar número para WhatsApp
 */
export function formatarTelefoneWhatsApp(telefone: string): string {
  // Remover caracteres especiais
  let telefoneLimpo = telefone.replace(/\D/g, "");

  // Se não tiver código de país, adicionar 55 (Brasil)
  if (telefoneLimpo.length === 10 || telefoneLimpo.length === 11) {
    telefoneLimpo = "55" + telefoneLimpo;
  }

  return "+" + telefoneLimpo;
}

export default twilioClient;
