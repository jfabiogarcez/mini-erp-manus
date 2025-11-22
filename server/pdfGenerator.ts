import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Formata valor em centavos para string em reais
 */
function formatarMoeda(centavos: number): string {
  return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`;
}

/**
 * Formata data para string DD/MM/YYYY
 */
function formatarData(data: Date): string {
  return new Date(data).toLocaleDateString('pt-BR');
}

/**
 * Adiciona cabeçalho padrão ao PDF
 */
function adicionarCabecalho(doc: jsPDF, titulo: string, periodo: { mes: number, ano: number }) {
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  // Logo e título da empresa
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Transblindados', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gerenciamento', 105, 28, { align: 'center' });
  
  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);
  
  // Título do relatório
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 105, 45, { align: 'center' });
  
  // Período
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${meses[periodo.mes - 1]} de ${periodo.ano}`, 105, 53, { align: 'center' });
  
  // Data de geração
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${formatarData(new Date())}`, 105, 60, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  return 70; // Retorna posição Y para começar o conteúdo
}

/**
 * Adiciona rodapé com número de página
 */
function adicionarRodape(doc: jsPDF, numeroPagina: number) {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Página ${numeroPagina}`, 105, pageHeight - 10, { align: 'center' });
  doc.setTextColor(0, 0, 0);
}

/**
 * Gera relatório de missões em PDF
 */
export async function gerarRelatorioMissoesPDF(dados: any): Promise<Buffer> {
  const doc = new jsPDF();
  
  let yPos = adicionarCabecalho(doc, 'Relatório Mensal de Missões', dados.periodo);
  
  // Resumo geral
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Geral', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Missões: ${dados.total}`, 25, yPos);
  yPos += 7;
  doc.text(`Receita Total: ${formatarMoeda(dados.receitaTotal)}`, 25, yPos);
  yPos += 7;
  doc.text(`Receita Média por Missão: ${formatarMoeda(dados.receitaMedia)}`, 25, yPos);
  yPos += 15;
  
  // Missões por status
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Missões por Status', 20, yPos);
  yPos += 10;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Status', 'Quantidade', 'Percentual']],
    body: Object.entries(dados.porStatus).map(([status, qtd]: [string, any]) => [
      status,
      qtd,
      `${((qtd / dados.total) * 100).toFixed(1)}%`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Ranking de motoristas
  if (dados.rankingMotoristas && dados.rankingMotoristas.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 10 Motoristas', 20, yPos);
    yPos += 10;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Posição', 'Motorista', 'Missões Realizadas']],
      body: dados.rankingMotoristas.map((item: any, index: number) => [
        `${index + 1}º`,
        item.motorista,
        item.total
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Serviços mais solicitados
  if (dados.servicosMaisSolicitados && dados.servicosMaisSolicitados.length > 0) {
    // Verificar se precisa de nova página
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Serviços Mais Solicitados', 20, yPos);
    yPos += 10;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Serviço', 'Quantidade', 'Percentual']],
      body: dados.servicosMaisSolicitados.map((item: any) => [
        item.servico,
        item.total,
        `${((item.total / dados.total) * 100).toFixed(1)}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 },
    });
  }
  
  // Adicionar rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    adicionarRodape(doc, i);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Gera relatório de multas em PDF
 */
export async function gerarRelatorioMultasPDF(dados: any): Promise<Buffer> {
  const doc = new jsPDF();
  
  let yPos = adicionarCabecalho(doc, 'Relatório Mensal de Multas', dados.periodo);
  
  // Resumo geral
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Geral', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Multas: ${dados.total}`, 25, yPos);
  yPos += 7;
  doc.text(`Valor Total: ${formatarMoeda(dados.valorTotal)}`, 25, yPos);
  yPos += 7;
  doc.text(`Valor Pago: ${formatarMoeda(dados.valorPago)}`, 25, yPos);
  yPos += 7;
  doc.text(`Valor Pendente: ${formatarMoeda(dados.valorPendente)}`, 25, yPos);
  yPos += 7;
  doc.text(`Valor Médio por Multa: ${formatarMoeda(dados.valorMedio)}`, 25, yPos);
  yPos += 15;
  
  // Multas por status
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Multas por Status', 20, yPos);
  yPos += 10;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Status', 'Quantidade', 'Percentual']],
    body: Object.entries(dados.porStatus).map(([status, qtd]: [string, any]) => [
      status,
      qtd,
      `${((qtd / dados.total) * 100).toFixed(1)}%`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [231, 76, 60], textColor: 255 },
    styles: { fontSize: 10 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Ranking de veículos
  if (dados.rankingVeiculos && dados.rankingVeiculos.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Veículos com Mais Multas', 20, yPos);
    yPos += 10;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Posição', 'Veículo', 'Multas', 'Valor Total']],
      body: dados.rankingVeiculos.map((item: any, index: number) => [
        `${index + 1}º`,
        item.veiculo,
        item.total,
        formatarMoeda(item.valor)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60], textColor: 255 },
      styles: { fontSize: 10 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Tipos de infração mais comuns
  if (dados.tiposMaisComuns && dados.tiposMaisComuns.length > 0) {
    // Verificar se precisa de nova página
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Infrações Mais Comuns', 20, yPos);
    yPos += 10;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Tipo de Infração', 'Quantidade', 'Percentual']],
      body: dados.tiposMaisComuns.map((item: any) => [
        item.tipo,
        item.total,
        `${((item.total / dados.total) * 100).toFixed(1)}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60], textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 100 }
      }
    });
  }
  
  // Adicionar rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    adicionarRodape(doc, i);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Gera relatório consolidado em PDF
 */
export async function gerarRelatorioConsolidadoPDF(
  dadosMissoes: any,
  dadosMultas: any
): Promise<Buffer> {
  const doc = new jsPDF();
  
  let yPos = adicionarCabecalho(doc, 'Relatório Consolidado', dadosMissoes.periodo);
  
  // Resumo financeiro
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', 20, yPos);
  yPos += 10;
  
  const receitaMissoes = dadosMissoes.receitaTotal;
  const despesasMultas = dadosMultas.valorTotal;
  const saldoLiquido = receitaMissoes - despesasMultas;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receita de Missões: ${formatarMoeda(receitaMissoes)}`, 25, yPos);
  yPos += 7;
  doc.text(`Despesas com Multas: ${formatarMoeda(despesasMultas)}`, 25, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text(`Saldo Líquido: ${formatarMoeda(saldoLiquido)}`, 25, yPos);
  yPos += 15;
  
  // Resumo de operações
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo de Operações', 20, yPos);
  yPos += 10;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Indicador', 'Valor']],
    body: [
      ['Total de Missões', dadosMissoes.total],
      ['Missões Concluídas', dadosMissoes.porStatus.Concluída || 0],
      ['Total de Multas', dadosMultas.total],
      ['Multas Pagas', dadosMultas.porStatus.Pago || 0],
      ['Multas Pendentes', dadosMultas.porStatus.Pendente || 0],
    ],
    theme: 'grid',
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    styles: { fontSize: 10 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Análise de desempenho
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise de Desempenho', 20, yPos);
  yPos += 10;
  
  const taxaConclusao = dadosMissoes.total > 0 
    ? ((dadosMissoes.porStatus.Concluída || 0) / dadosMissoes.total * 100).toFixed(1)
    : '0.0';
  
  const taxaPagamentoMultas = dadosMultas.total > 0
    ? ((dadosMultas.porStatus.Pago || 0) / dadosMultas.total * 100).toFixed(1)
    : '0.0';
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Taxa de Conclusão de Missões: ${taxaConclusao}%`, 25, yPos);
  yPos += 7;
  doc.text(`Taxa de Pagamento de Multas: ${taxaPagamentoMultas}%`, 25, yPos);
  yPos += 7;
  doc.text(`Receita Média por Missão: ${formatarMoeda(dadosMissoes.receitaMedia)}`, 25, yPos);
  yPos += 7;
  doc.text(`Valor Médio de Multa: ${formatarMoeda(dadosMultas.valorMedio)}`, 25, yPos);
  
  // Adicionar rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    adicionarRodape(doc, i);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}
