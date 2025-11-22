import nodemailer from "nodemailer";

/**
 * Serviço de envio de e-mails
 * Usa SMTP configurado via variáveis de ambiente
 */

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Cria transporter do nodemailer com configurações do ambiente
 */
function createTransporter() {
  // Configurações SMTP via variáveis de ambiente
  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true para 465, false para outros
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // Se não houver credenciais, retorna null (modo de teste)
  if (!config.auth.user || !config.auth.pass) {
    console.warn("[Email] SMTP credentials not configured, emails will not be sent");
    return null;
  }

  return nodemailer.createTransport(config);
}

/**
 * Envia um e-mail
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    // Se não houver transporter configurado, apenas loga e retorna sucesso (modo de teste)
    if (!transporter) {
      console.log("[Email] Would send email to:", options.to);
      console.log("[Email] Subject:", options.subject);
      console.log("[Email] Text:", options.text.substring(0, 100) + "...");
      return true;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text.replace(/\n/g, "<br>"),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[Email] Message sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}

/**
 * Envia um e-mail de notificação de missão
 */
export async function sendMissaoNotification(
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
  const subject = `Lembrete: Missão agendada para ${missao.data.toLocaleDateString("pt-BR")}`;
  
  const text = `🚗 Lembrete: Você tem uma missão agendada para amanhã!

📅 Data: ${missao.data.toLocaleDateString("pt-BR")}
${missao.horaInicio ? `🕐 Horário: ${missao.horaInicio}` : ""}
${missao.cliente ? `👤 Cliente: ${missao.cliente}` : ""}
${missao.origem ? `📍 Origem: ${missao.origem}` : ""}
${missao.destino ? `📍 Destino: ${missao.destino}` : ""}
${missao.veiculo ? `🚙 Veículo: ${missao.veiculo}` : ""}

Boa sorte na missão!

---
Transblindados - Sistema de Gerenciamento`;

  return sendEmail({ to, subject, text });
}

/**
 * Envia um e-mail de notificação de multa
 */
export async function sendMultaNotification(
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
  
  const subject = `Alerta: Multa vencendo em 3 dias - ${valorFormatado}`;
  
  const text = `⚠️ Atenção: Multa vencendo em 3 dias!

📅 Data de Vencimento: ${dataVencimento}
💰 Valor: ${valorFormatado}
${multa.veiculoPlaca ? `🚙 Veículo: ${multa.veiculoPlaca}` : ""}
${multa.localInfracao ? `📍 Local: ${multa.localInfracao}` : ""}
${multa.numeroAuto ? `📄 Auto: ${multa.numeroAuto}` : ""}

Não esqueça de realizar o pagamento para evitar juros e multas adicionais.

---
Transblindados - Sistema de Gerenciamento`;

  return sendEmail({ to, subject, text });
}
