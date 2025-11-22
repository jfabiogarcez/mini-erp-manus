import * as XLSX from "xlsx";
import { getMissaoById, getArquivosByMissaoId } from "./db";
import { storagePut } from "./storage";

/**
 * Gera uma planilha Excel consolidada com todos os dados da missão
 */
export async function gerarRelatorioExcel(missaoId: number): Promise<{ url: string; buffer: Buffer }> {
  const missao = await getMissaoById(missaoId);
  if (!missao) throw new Error("Missão não encontrada");

  const arquivos = await getArquivosByMissaoId(missaoId);

  // Criar workbook
  const workbook = XLSX.utils.book_new();

  // Aba 1: Informações da Missão
  const dadosMissao = [
    ["RELATÓRIO DE MISSÃO"],
    [],
    ["Código da Missão", missao.codigoMissao],
    ["Cliente", missao.cliente || "-"],
    ["Motorista", missao.motorista || "-"],
    ["Status", missao.status],
    ["Data de Início", missao.dataInicio ? new Date(missao.dataInicio).toLocaleString("pt-BR") : "-"],
    ["Data de Fim", missao.dataFim ? new Date(missao.dataFim).toLocaleString("pt-BR") : "-"],
    ["Observações", missao.observacoes || "-"],
    [],
    ["ARQUIVOS ANEXADOS"],
    [],
    ["Tipo", "Nome do Arquivo", "Data de Upload", "Tamanho (KB)"],
  ];

  // Adicionar arquivos
  for (const arquivo of arquivos) {
    dadosMissao.push([
      arquivo.tipoArquivo,
      arquivo.nomeArquivo,
      new Date(arquivo.createdAt).toLocaleString("pt-BR"),
      arquivo.tamanhoBytes ? (arquivo.tamanhoBytes / 1024).toFixed(2) : "-",
    ]);
  }

  const wsMissao = XLSX.utils.aoa_to_sheet(dadosMissao);
  
  // Formatação
  wsMissao["!cols"] = [{ wch: 20 }, { wch: 40 }, { wch: 20 }, { wch: 15 }];
  
  XLSX.utils.book_append_sheet(workbook, wsMissao, "Informações da Missão");

  // Aba 2: Dados Extraídos (se houver arquivos Excel processados)
  const arquivosExcel = arquivos.filter((a) => a.tipoArquivo === "Excel");
  if (arquivosExcel.length > 0) {
    for (const arquivo of arquivosExcel) {
      try {
        const metadata = arquivo.metadados ? JSON.parse(arquivo.metadados) : {};
        if (metadata.abas && Array.isArray(metadata.abas)) {
          // Adicionar cada aba do arquivo Excel original
          for (const abaName of metadata.abas) {
            const dadosAba = [
              [`Dados de: ${arquivo.nomeArquivo} - Aba: ${abaName}`],
              [],
              ["Dados extraídos do arquivo original"],
            ];
            const wsAba = XLSX.utils.aoa_to_sheet(dadosAba);
            XLSX.utils.book_append_sheet(workbook, wsAba, `${abaName}`.substring(0, 31));
          }
        }
      } catch (error) {
        console.error("[ReportGenerator] Erro ao processar metadata:", error);
      }
    }
  }

  // Aba 3: Textos Extraídos (Word e Imagens)
  const arquivosTexto = arquivos.filter((a) => a.tipoArquivo === "Word" || a.tipoArquivo === "Imagem");
  if (arquivosTexto.length > 0) {
    const dadosTexto = [
      ["TEXTOS EXTRAÍDOS"],
      [],
      ["Arquivo", "Tipo", "Conteúdo"],
    ];

    for (const arquivo of arquivosTexto) {
      try {
        const metadata = arquivo.metadados ? JSON.parse(arquivo.metadados) : {};
        const conteudo = metadata.analiseIA || metadata.tamanhoTexto || "Sem conteúdo extraído";
        dadosTexto.push([arquivo.nomeArquivo, arquivo.tipoArquivo, conteudo]);
      } catch (error) {
        dadosTexto.push([arquivo.nomeArquivo, arquivo.tipoArquivo, "Erro ao extrair conteúdo"]);
      }
    }

    const wsTexto = XLSX.utils.aoa_to_sheet(dadosTexto);
    wsTexto["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(workbook, wsTexto, "Textos Extraídos");
  }

  // Gerar buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Upload para S3
  const chaveArquivo = `relatorios/${missao.codigoMissao}/relatorio-${Date.now()}.xlsx`;
  const { url } = await storagePut(chaveArquivo, buffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  return { url, buffer: Buffer.from(buffer) };
}

/**
 * Gera um relatório em PDF com as informações da missão e imagens
 * TODO: Implementar geração de PDF usando uma biblioteca adequada
 */
export async function gerarRelatorioPDF(missaoId: number): Promise<{ url: string; buffer: Buffer }> {
  const missao = await getMissaoById(missaoId);
  if (!missao) throw new Error("Missão não encontrada");

  // Por enquanto, retornar um placeholder
  const placeholder = Buffer.from("PDF generation not implemented yet");
  const chaveArquivo = `relatorios/${missao.codigoMissao}/relatorio-${Date.now()}.txt`;
  const { url } = await storagePut(chaveArquivo, placeholder, "text/plain");
  
  return { url, buffer: placeholder };
  
  /* TODO: Implementar geração de PDF
  const arquivos = await getArquivosByMissaoId(missaoId);
  const imagens = arquivos.filter((a) => a.tipoArquivo === "Imagem");

  // Criar HTML para o PDF
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #0433ff;
      border-bottom: 3px solid #0433ff;
      padding-bottom: 10px;
    }
    h2 {
      color: #0433ff;
      margin-top: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #0433ff;
      color: white;
    }
    .info-row {
      margin: 10px 0;
    }
    .info-label {
      font-weight: bold;
      display: inline-block;
      width: 150px;
    }
    .image-container {
      margin: 20px 0;
      page-break-inside: avoid;
    }
    .image-container img {
      max-width: 100%;
      height: auto;
      border: 1px solid #ddd;
      padding: 5px;
    }
    .image-caption {
      font-style: italic;
      color: #666;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <h1>RELATÓRIO DE MISSÃO</h1>
  
  <h2>Informações da Missão</h2>
  <div class="info-row">
    <span class="info-label">Código:</span> ${missao.codigoMissao}
  </div>
  <div class="info-row">
    <span class="info-label">Cliente:</span> ${missao.cliente || "-"}
  </div>
  <div class="info-row">
    <span class="info-label">Motorista:</span> ${missao.motorista || "-"}
  </div>
  <div class="info-row">
    <span class="info-label">Status:</span> ${missao.status}
  </div>
  <div class="info-row">
    <span class="info-label">Data de Início:</span> ${missao.dataInicio ? new Date(missao.dataInicio).toLocaleString("pt-BR") : "-"}
  </div>
  <div class="info-row">
    <span class="info-label">Data de Fim:</span> ${missao.dataFim ? new Date(missao.dataFim).toLocaleString("pt-BR") : "-"}
  </div>
  <div class="info-row">
    <span class="info-label">Observações:</span> ${missao.observacoes || "-"}
  </div>

  <h2>Arquivos Anexados</h2>
  <table>
    <thead>
      <tr>
        <th>Tipo</th>
        <th>Nome do Arquivo</th>
        <th>Data de Upload</th>
        <th>Tamanho</th>
      </tr>
    </thead>
    <tbody>
  `;

  for (const arquivo of arquivos) {
    html += `
      <tr>
        <td>${arquivo.tipoArquivo}</td>
        <td>${arquivo.nomeArquivo}</td>
        <td>${new Date(arquivo.createdAt).toLocaleString("pt-BR")}</td>
        <td>${arquivo.tamanhoBytes ? (arquivo.tamanhoBytes / 1024).toFixed(2) + " KB" : "-"}</td>
      </tr>
    `;
  }

  html += `
    </tbody>
  </table>
  `;

  // Adicionar imagens
  if (imagens.length > 0) {
    html += `<h2>Imagens Anexadas</h2>`;
    for (const imagem of imagens) {
      html += `
        <div class="image-container">
          <img src="${imagem.urlArquivo}" alt="${imagem.nomeArquivo}" />
          <div class="image-caption">${imagem.nomeArquivo}</div>
        </div>
      `;
    }
  }

  html += `
</body>
</html>
  `;

  // TODO: Converter HTML para PDF
  */
}

/**
 * Gera ambos os relatórios (Excel e PDF) de uma vez
 */
export async function gerarRelatoriosCompletos(missaoId: number): Promise<{
  excel: { url: string; buffer: Buffer };
  pdf: { url: string; buffer: Buffer };
}> {
  const [excel, pdf] = await Promise.all([
    gerarRelatorioExcel(missaoId),
    gerarRelatorioPDF(missaoId),
  ]);

  return { excel, pdf };
}
