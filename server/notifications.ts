import { getAllTarefas } from "./db";
import { notifyOwner } from "./_core/notification";

/**
 * Verifica tarefas próximas do vencimento e envia notificações por e-mail.
 * @param diasAntecedencia - Número de dias de antecedência para o alerta (padrão: 3)
 * @returns Objeto com o resultado da verificação e envio de notificações
 */
export async function verificarTarefasProximasVencimento(diasAntecedencia: number = 3) {
  try {
    // 1. Buscar todas as tarefas pendentes
    const todasTarefas = await getAllTarefas();
    const tarefasPendentes = todasTarefas.filter((t) => t.status === "Pendente");

    // 2. Calcular a data limite (hoje + diasAntecedencia)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const dataLimite = new Date(hoje);
    dataLimite.setDate(dataLimite.getDate() + diasAntecedencia);

    // 3. Filtrar tarefas que vencem nos próximos N dias
    const tarefasProximas = tarefasPendentes.filter((tarefa) => {
      const dataVencimento = new Date(tarefa.dataVencimento);
      dataVencimento.setHours(0, 0, 0, 0);
      return dataVencimento >= hoje && dataVencimento <= dataLimite;
    });

    // 4. Se não houver tarefas próximas, retornar
    if (tarefasProximas.length === 0) {
      return {
        success: true,
        totalVerificadas: tarefasPendentes.length,
        tarefasProximas: 0,
        notificacoesEnviadas: 0,
        mensagem: "Nenhuma tarefa próxima do vencimento.",
      };
    }

    // 5. Gerar conteúdo do e-mail
    const conteudo = gerarConteudoEmail(tarefasProximas, diasAntecedencia);

    // 6. Enviar notificação ao proprietário
    const enviado = await notifyOwner({
      title: `⚠️ ${tarefasProximas.length} Tarefa(s) Próxima(s) do Vencimento`,
      content: conteudo,
    });

    return {
      success: enviado,
      totalVerificadas: tarefasPendentes.length,
      tarefasProximas: tarefasProximas.length,
      notificacoesEnviadas: enviado ? 1 : 0,
      mensagem: enviado
        ? `Notificação enviada com sucesso para ${tarefasProximas.length} tarefa(s).`
        : "Falha ao enviar notificação.",
    };
  } catch (error) {
    console.error("Erro ao verificar tarefas próximas do vencimento:", error);
    return {
      success: false,
      totalVerificadas: 0,
      tarefasProximas: 0,
      notificacoesEnviadas: 0,
      mensagem: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Gera o conteúdo do e-mail de notificação.
 */
function gerarConteudoEmail(tarefas: any[], diasAntecedencia: number): string {
  const linhas = [
    `Você tem ${tarefas.length} tarefa(s) que vencem nos próximos ${diasAntecedencia} dias:\n`,
  ];

  tarefas.forEach((tarefa, index) => {
    const dataVencimento = new Date(tarefa.dataVencimento);
    const diasRestantes = Math.ceil(
      (dataVencimento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    linhas.push(`${index + 1}. **${tarefa.titulo}**`);
    linhas.push(`   - Vencimento: ${dataVencimento.toLocaleDateString("pt-BR")}`);
    linhas.push(`   - Dias restantes: ${diasRestantes}`);
    linhas.push(`   - Descrição: ${tarefa.descricao || "Sem descrição"}`);
    linhas.push("");
  });

  linhas.push("Acesse o dashboard do Mini-ERP para gerenciar suas tarefas.");

  return linhas.join("\n");
}
