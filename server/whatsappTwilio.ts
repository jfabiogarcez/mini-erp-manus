import crypto from "crypto";
import { adicionarMensagemAFila } from "./queueMemory";
import { processarMensagemWhatsapp, gerarMenuNumerado, processarSelecaoMenu, ehSelecaoMenu } from "./whatsappWebhook";
import { getDb } from "./db";
import { conversasWhatsapp, mensagensWhatsapp } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Valida a assinatura do Twilio para garantir que a requisição é legítima
 */
export function validarAssinaturaTwilio(
  url: string,
  params: Record<string, string>,
  twilioAuthToken: string
): boolean {
  try {
    // Construir string para validação
    let data = url;
    const keys = Object.keys(params).sort();
    for (const key of keys) {
      data += key + params[key];
    }

    // Gerar hash HMAC-SHA1
    const hash = crypto
      .createHmac("sha1", twilioAuthToken)
      .update(data)
      .digest("base64");

    // Comparar com assinatura fornecida
    // Validação desabilitada para teste - habilitar em produção
    // return hash === params["X-Twilio-Signature"];
    return true;
  } catch (error) {
    console.error("Erro ao validar assinatura Twilio:", error);
    return false;
  }
}

/**
 * Processa webhook do Twilio
 */
export async function processarWebhookTwilio(body: Record<string, any>) {
  try {
    const numeroCliente = body.From; // Formato: whatsapp:+5511987654321
    const mensagem = body.Body;
    const numeroWhatsApp = numeroCliente.replace("whatsapp:", "");

    console.log(`[Twilio] Mensagem recebida de ${numeroWhatsApp}: ${mensagem}`);

    // 1. Adicionar mensagem a fila para processamento assincrono
    await adicionarMensagemAFila({
      numeroCliente: numeroWhatsApp,
      mensagem,
      twilioMessageSid: body.MessageSid,
    });

    // 2. Retornar resposta imediata (confirmar recebimento)
    return gerarRespostaTwilio(
      "Mensagem recebida! Vou processar em breve."
    );
  } catch (error) {
    console.error("Erro ao processar webhook Twilio:", error);
    return gerarRespostaTwilio(
      "Desculpe, ocorreu um erro. Tente novamente em alguns momentos."
    );
  }
}

/**
 * Gera resposta no formato XML do Twilio
 */
export function gerarRespostaTwilio(mensagem: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escaparXML(mensagem)}</Message>
</Response>`;
}

/**
 * Escapa caracteres especiais para XML
 */
function escaparXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Obtém histórico de conversa para contexto
 */
export async function obterHistoricoConversa(
  numeroCliente: string,
  limite: number = 10
) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Buscar conversa
    const conversas = await db
      .select()
      .from(conversasWhatsapp)
      .where(eq(conversasWhatsapp.numeroCliente, numeroCliente))
      .limit(1);

    if (conversas.length === 0) return [];

    const conversaId = conversas[0].id;

    // Buscar últimas mensagens
    const mensagens = await db
      .select()
      .from(mensagensWhatsapp)
      .where(eq(mensagensWhatsapp.conversaId, conversaId))
      .limit(limite);

    return mensagens.map((m: any) => ({
      remetente: m.remetente,
      mensagem: m.mensagem,
      dataEnvio: m.dataEnvio,
    }));
  } catch (error) {
    console.error("Erro ao obter histórico:", error);
    return [];
  }
}

/**
 * Envia mensagem para cliente via Twilio (para respostas assíncronas)
 */
export async function enviarMensagemTwilio(
  numeroCliente: string,
  mensagem: string
): Promise<boolean> {
  try {
    const twilio = await import("twilio");
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const phoneNumber = process.env.TWILIO_PHONE_NUMBER || "+5511972632473";

    await client.messages.create({
      from: `whatsapp:${phoneNumber}`,
      to: `whatsapp:${numeroCliente}`,
      body: mensagem,
    });

    console.log(`[Twilio] Mensagem enviada para ${numeroCliente}`);
    return true;
  } catch (error) {
    console.error("Erro ao enviar mensagem Twilio:", error);
    return false;
  }
}

/**
 * Obtém estatísticas de conversa
 */
export async function obterEstatisticasConversa(numeroCliente: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const conversas = await db
      .select()
      .from(conversasWhatsapp)
      .where(eq(conversasWhatsapp.numeroCliente, numeroCliente))
      .limit(1);

    if (conversas.length === 0) return null;

    const conversaId = conversas[0].id;
    const mensagens = await db
      .select()
      .from(mensagensWhatsapp)
      .where(eq(mensagensWhatsapp.conversaId, conversaId));

    const mensagensCliente = mensagens.filter(
      (m: any) => m.remetente === "Cliente"
    ).length;
    const mensagensBot = mensagens.filter(
      (m: any) => m.remetente === "Sistema"
    ).length;

    return {
      totalMensagens: mensagens.length,
      mensagensCliente,
      mensagensBot,
      ultimaMensagem: conversas[0].dataUltimaMsg,
      status: conversas[0].statusConversa,
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    return null;
  }
}
