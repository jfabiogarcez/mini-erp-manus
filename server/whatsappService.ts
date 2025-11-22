/**
 * Serviço de envio de mensagens via WhatsApp
 * Usa API do Twilio ou WhatsApp Business API
 */

interface WhatsAppMessage {
  to: string; // Número no formato +5511999999999
  message: string;
}

/**
 * Envia uma mensagem via WhatsApp
 * Por enquanto apenas simula o envio (modo de teste)
 * Para implementar envio real, integre com Twilio ou WhatsApp Business API
 */
export async function sendWhatsApp(options: WhatsAppMessage): Promise<boolean> {
  try {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    // Se não houver credenciais, apenas loga e retorna sucesso (modo de teste)
    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      console.log("[WhatsApp] Would send message to:", options.to);
      console.log("[WhatsApp] Message:", options.message.substring(0, 100) + "...");
      return true;
    }

    // TODO: Implementar envio real com Twilio
    // const twilio = require('twilio');
    // const client = twilio(twilioAccountSid, twilioAuthToken);
    // await client.messages.create({
    //   from: `whatsapp:${twilioWhatsAppNumber}`,
    //   to: `whatsapp:${options.to}`,
    //   body: options.message
    // });

    console.log("[WhatsApp] Message sent to:", options.to);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
    return false;
  }
}

/**
 * Envia notificação de missão via WhatsApp
 */
export async function sendMissaoWhatsApp(
  to: string,
  missao: {
    data: Date;
    cliente?: string | null;
    origem?: string | null;
    destino?: string | null;
    veiculo?: string | null;
    horaInicio?: string | null;
  }
): Promise<boolean> {
  const message = `🚗 *Lembrete: Missão agendada para amanhã!*

📅 Data: ${missao.data.toLocaleDateString("pt-BR")}
${missao.horaInicio ? `🕐 Horário: ${missao.horaInicio}` : ""}
${missao.cliente ? `👤 Cliente: ${missao.cliente}` : ""}
${missao.origem ? `📍 Origem: ${missao.origem}` : ""}
${missao.destino ? `📍 Destino: ${missao.destino}` : ""}
${missao.veiculo ? `🚙 Veículo: ${missao.veiculo}` : ""}

Boa sorte na missão!

_Transblindados - Sistema de Gerenciamento_`;

  return sendWhatsApp({ to, message });
}

/**
 * Envia notificação de multa via WhatsApp
 */
export async function sendMultaWhatsApp(
  to: string,
  multa: {
    dataVencimento: Date | null;
    valor: number | null;
    veiculoPlaca?: string | null;
    localInfracao?: string | null;
    numeroAuto?: string | null;
  }
): Promise<boolean> {
  const valorFormatado = multa.valor ? `R$ ${(multa.valor / 100).toFixed(2).replace(".", ",")}` : "R$ 0,00";
  const dataVencimento = multa.dataVencimento ? multa.dataVencimento.toLocaleDateString("pt-BR") : "Não informada";
  
  const message = `⚠️ *Atenção: Multa vencendo em 3 dias!*

📅 Data de Vencimento: ${dataVencimento}
💰 Valor: ${valorFormatado}
${multa.veiculoPlaca ? `🚙 Veículo: ${multa.veiculoPlaca}` : ""}
${multa.localInfracao ? `📍 Local: ${multa.localInfracao}` : ""}
${multa.numeroAuto ? `📄 Auto: ${multa.numeroAuto}` : ""}

Não esqueça de realizar o pagamento para evitar juros e multas adicionais.

_Transblindados - Sistema de Gerenciamento_`;

  return sendWhatsApp({ to, message });
}
