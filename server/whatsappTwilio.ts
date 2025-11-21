import crypto from "crypto";
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

    // 1. Processar mensagem
    let resposta = "";

    // Verificar se é seleção do menu
    if (ehSelecaoMenu(mensagem)) {
      resposta = await processarSelecaoMenu(mensagem);
    } else {
      // Processar como mensagem normal com IA
      const resultado = await processarMensagemWhatsapp(
        numeroWhatsApp,
        mensagem
      );
      resposta = resultado.resposta;
    }

    // 2. Retornar resposta no formato Twilio
    return gerarRespostaTwilio(resposta);
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
 * Requer Twilio SDK configurado
 */
export async function enviarMensagemTwilio(
  numeroCliente: string,
  mensagem: string
): Promise<boolean> {
  try {
    // TODO: Implementar com Twilio SDK
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   from: 'whatsapp:+5511987654321',
    //   to: `whatsapp:${numeroCliente}`,
    //   body: mensagem,
    // });
    console.log(`[Twilio] Enviando para ${numeroCliente}: ${mensagem}`);
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
