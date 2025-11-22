import { getDb } from "./db";
import { notificacoes, missoes, multas } from "../drizzle/schema";
import { and, eq, lte, gte, isNull } from "drizzle-orm";
import { sendMissaoNotification, sendMultaNotification } from "./emailService";
import { sendMissaoWhatsApp, sendMultaWhatsApp } from "./whatsappService";

/**
 * Sistema de notificações automáticas
 * Verifica missões e multas que precisam de notificação e agenda/envia
 */

/**
 * Verifica missões que precisam de notificação (24h antes)
 */
export async function verificarNotificacoesMissoes() {
  const db = await getDb();
  if (!db) return { agendadas: 0, erro: "Database not available" };

  try {
    // Data de amanhã (24h a partir de agora)
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);

    const depoisDeAmanha = new Date(amanha);
    depoisDeAmanha.setDate(depoisDeAmanha.getDate() + 1);

    // Buscar missões agendadas para amanhã
    const missoesAmanha = await db
      .select()
      .from(missoes)
      .where(
        and(
          eq(missoes.status, "Agendada"),
          gte(missoes.data, amanha),
          lte(missoes.data, depoisDeAmanha)
        )
      );

    let agendadas = 0;

    for (const missao of missoesAmanha) {
      // Verificar se já existe notificação agendada para esta missão
      const notificacaoExistente = await db
        .select()
        .from(notificacoes)
        .where(
          and(
            eq(notificacoes.tipo, "Missão"),
            eq(notificacoes.referenciaId, missao.id),
            eq(notificacoes.status, "Agendada")
          )
        )
        .limit(1);

      if (notificacaoExistente.length > 0) continue;

      // Criar notificação
      const mensagem = `🚗 Lembrete: Você tem uma missão agendada para amanhã!

📅 Data: ${missao.data.toLocaleDateString("pt-BR")}
${missao.horaInicio ? `🕐 Horário: ${missao.horaInicio}` : ""}
${missao.cliente ? `👤 Cliente: ${missao.cliente}` : ""}
${missao.origem ? `📍 Origem: ${missao.origem}` : ""}
${missao.destino ? `📍 Destino: ${missao.destino}` : ""}
${missao.veiculo ? `🚙 Veículo: ${missao.veiculo}` : ""}

Boa sorte na missão!`;

      await db.insert(notificacoes).values({
        tipo: "Missão",
        referenciaId: missao.id,
        canal: "Email", // Por enquanto apenas email
        destinatario: missao.motorista || "admin@transblindados.com",
        assunto: `Lembrete: Missão agendada para ${missao.data.toLocaleDateString("pt-BR")}`,
        mensagem,
        dataAgendamento: new Date(), // Enviar imediatamente
        status: "Agendada",
      });

      agendadas++;
    }

    return { agendadas, total: missoesAmanha.length };
  } catch (error) {
    console.error("Erro ao verificar notificações de missões:", error);
    return { agendadas: 0, erro: String(error) };
  }
}

/**
 * Verifica multas que estão próximas do vencimento (3 dias antes)
 */
export async function verificarNotificacoesMultas() {
  const db = await getDb();
  if (!db) return { agendadas: 0, erro: "Database not available" };

  try {
    // Data daqui a 3 dias
    const tresDias = new Date();
    tresDias.setDate(tresDias.getDate() + 3);
    tresDias.setHours(0, 0, 0, 0);

    const quatroDias = new Date(tresDias);
    quatroDias.setDate(quatroDias.getDate() + 1);

    // Buscar multas pendentes que vencem em 3 dias
    const multasVencendo = await db
      .select()
      .from(multas)
      .where(
        and(
          eq(multas.status, "Pendente"),
          gte(multas.dataVencimento, tresDias),
          lte(multas.dataVencimento, quatroDias)
        )
      );

    let agendadas = 0;

    for (const multa of multasVencendo) {
      // Verificar se já existe notificação agendada para esta multa
      const notificacaoExistente = await db
        .select()
        .from(notificacoes)
        .where(
          and(
            eq(notificacoes.tipo, "Multa"),
            eq(notificacoes.referenciaId, multa.id),
            eq(notificacoes.status, "Agendada")
          )
        )
        .limit(1);

      if (notificacaoExistente.length > 0) continue;

      // Criar notificação
      const valorFormatado = multa.valor ? `R$ ${(multa.valor / 100).toFixed(2).replace(".", ",")}` : "R$ 0,00";
      const dataVencimento = multa.dataVencimento ? multa.dataVencimento.toLocaleDateString("pt-BR") : "Não informada";
      const mensagem = `⚠️ Atenção: Multa vencendo em 3 dias!

📅 Data de Vencimento: ${dataVencimento}
💰 Valor: ${valorFormatado}
${multa.veiculoPlaca ? `🚙 Veículo: ${multa.veiculoPlaca}` : ""}
${multa.localInfracao ? `📍 Local: ${multa.localInfracao}` : ""}
${multa.numeroAuto ? `📄 Auto: ${multa.numeroAuto}` : ""}

Não esqueça de realizar o pagamento para evitar juros e multas adicionais.`;

      await db.insert(notificacoes).values({
        tipo: "Multa",
        referenciaId: multa.id,
        canal: "Email",
        destinatario: "admin@transblindados.com",
        assunto: `Alerta: Multa vencendo em 3 dias - ${valorFormatado}`,
        mensagem,
        dataAgendamento: new Date(),
        status: "Agendada",
      });

      agendadas++;
    }

    return { agendadas, total: multasVencendo.length };
  } catch (error) {
    console.error("Erro ao verificar notificações de multas:", error);
    return { agendadas: 0, erro: String(error) };
  }
}

/**
 * Envia notificações agendadas
 * Por enquanto apenas marca como enviada, mas pode ser expandido para enviar emails reais
 */
export async function enviarNotificacoesAgendadas() {
  const db = await getDb();
  if (!db) return { enviadas: 0, erro: "Database not available" };

  try {
    // Buscar notificações agendadas que devem ser enviadas
    const agora = new Date();
    const notificacoesParaEnviar = await db
      .select()
      .from(notificacoes)
      .where(
        and(
          eq(notificacoes.status, "Agendada"),
          lte(notificacoes.dataAgendamento, agora)
        )
      )
      .limit(50); // Processar no máximo 50 por vez

    let enviadas = 0;

    for (const notificacao of notificacoesParaEnviar) {
      try {
        let sucesso = false;

        // Buscar dados completos da missão ou multa
        if (notificacao.tipo === "Missão") {
          const missaoData = await db
            .select()
            .from(missoes)
            .where(eq(missoes.id, notificacao.referenciaId))
            .limit(1);

          if (missaoData.length > 0) {
            const missao = missaoData[0]!;
            
            if (notificacao.canal === "Email" || notificacao.canal === "Ambos") {
              sucesso = await sendMissaoNotification(notificacao.destinatario, missao);
            }
            
            if (notificacao.canal === "WhatsApp" || notificacao.canal === "Ambos") {
              const whatsappSuccess = await sendMissaoWhatsApp(notificacao.destinatario, missao);
              sucesso = sucesso || whatsappSuccess;
            }
          }
        } else if (notificacao.tipo === "Multa") {
          const multaData = await db
            .select()
            .from(multas)
            .where(eq(multas.id, notificacao.referenciaId))
            .limit(1);

          if (multaData.length > 0) {
            const multa = multaData[0]!;
            
            if (notificacao.canal === "Email" || notificacao.canal === "Ambos") {
              sucesso = await sendMultaNotification(notificacao.destinatario, multa);
            }
            
            if (notificacao.canal === "WhatsApp" || notificacao.canal === "Ambos") {
              const whatsappSuccess = await sendMultaWhatsApp(notificacao.destinatario, multa);
              sucesso = sucesso || whatsappSuccess;
            }
          }
        }

        if (sucesso) {
          await db
            .update(notificacoes)
            .set({
              status: "Enviada",
              dataEnvio: new Date(),
            })
            .where(eq(notificacoes.id, notificacao.id));

          enviadas++;
        } else {
          throw new Error("Failed to send notification");
        }
      } catch (error) {
        // Marcar como erro
        await db
          .update(notificacoes)
          .set({
            status: "Erro",
            erroMensagem: String(error),
          })
          .where(eq(notificacoes.id, notificacao.id));
      }
    }

    return { enviadas, total: notificacoesParaEnviar.length };
  } catch (error) {
    console.error("Erro ao enviar notificações:", error);
    return { enviadas: 0, erro: String(error) };
  }
}

/**
 * Executa verificação completa de notificações
 */
export async function executarVerificacaoNotificacoes() {
  const resultadoMissoes = await verificarNotificacoesMissoes();
  const resultadoMultas = await verificarNotificacoesMultas();
  const resultadoEnvio = await enviarNotificacoesAgendadas();

  return {
    missoes: resultadoMissoes,
    multas: resultadoMultas,
    envio: resultadoEnvio,
  };
}
