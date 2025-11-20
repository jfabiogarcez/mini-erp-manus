import { storagePut } from "./storage";
import { createArquivoMissao } from "./db";
import { invokeLLM } from "./_core/llm";

/**
 * Interface para dados extraídos de arquivos
 */
export interface DadosExtraidos {
  tipo: "Excel" | "Word" | "Imagem" | "PDF" | "Outro";
  nomeArquivo: string;
  urlArquivo: string;
  tamanhoBytes: number;
  dados?: any; // Dados estruturados extraídos
  texto?: string; // Texto extraído
  metadata?: Record<string, any>;
}

/**
 * Processa um arquivo e extrai dados relevantes
 */
export async function processarArquivo(
  arquivo: Buffer,
  nomeArquivo: string,
  missaoId: number
): Promise<DadosExtraidos> {
  const tipoArquivo = identificarTipoArquivo(nomeArquivo);
  const tamanhoBytes = arquivo.length;

  // Upload para S3
  const chaveArquivo = `missoes/${missaoId}/${Date.now()}-${nomeArquivo}`;
  const { url: urlArquivo } = await storagePut(chaveArquivo, arquivo, obterMimeType(nomeArquivo));

  let dadosExtraidos: DadosExtraidos = {
    tipo: tipoArquivo,
    nomeArquivo,
    urlArquivo,
    tamanhoBytes,
  };

  // Processar conforme o tipo
  switch (tipoArquivo) {
    case "Excel":
      dadosExtraidos = await processarExcel(arquivo, dadosExtraidos);
      break;
    case "Word":
      dadosExtraidos = await processarWord(arquivo, dadosExtraidos);
      break;
    case "Imagem":
      dadosExtraidos = await processarImagem(arquivo, dadosExtraidos, urlArquivo);
      break;
    default:
      break;
  }

  // Salvar no banco de dados
  await createArquivoMissao({
    missaoId,
    tipoArquivo,
    nomeArquivo,
    urlArquivo,
    tamanhoBytes,
    metadados: JSON.stringify(dadosExtraidos.metadata || {}),
  });

  return dadosExtraidos;
}

/**
 * Identifica o tipo de arquivo pela extensão
 */
function identificarTipoArquivo(nomeArquivo: string): "Excel" | "Word" | "Imagem" | "PDF" | "Outro" {
  const extensao = nomeArquivo.toLowerCase().split(".").pop();
  
  if (["xlsx", "xls", "csv"].includes(extensao || "")) return "Excel";
  if (["docx", "doc"].includes(extensao || "")) return "Word";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extensao || "")) return "Imagem";
  if (extensao === "pdf") return "PDF";
  
  return "Outro";
}

/**
 * Obtém o MIME type do arquivo
 */
function obterMimeType(nomeArquivo: string): string {
  const extensao = nomeArquivo.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  
  return mimeTypes[extensao || ""] || "application/octet-stream";
}

/**
 * Processa arquivo Excel e extrai dados tabulares
 */
async function processarExcel(arquivo: Buffer, dadosBase: DadosExtraidos): Promise<DadosExtraidos> {
  try {
    // Importar biblioteca de Excel dinamicamente
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(arquivo, { type: "buffer" });
    
    const dados: any = {};
    
    // Processar cada aba
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      if (worksheet) {
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        dados[sheetName] = jsonData;
      }
    }
    
    return {
      ...dadosBase,
      dados,
      metadata: {
        numeroAbas: workbook.SheetNames.length,
        abas: workbook.SheetNames,
      },
    };
  } catch (error) {
    console.error("[FileProcessor] Erro ao processar Excel:", error);
    return dadosBase;
  }
}

/**
 * Processa arquivo Word e extrai texto
 */
async function processarWord(arquivo: Buffer, dadosBase: DadosExtraidos): Promise<DadosExtraidos> {
  try {
    // Importar biblioteca de Word dinamicamente
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: arquivo });
    
    return {
      ...dadosBase,
      texto: result.value,
      metadata: {
        tamanhoTexto: result.value.length,
      },
    };
  } catch (error) {
    console.error("[FileProcessor] Erro ao processar Word:", error);
    return dadosBase;
  }
}

/**
 * Processa imagem e extrai metadata usando LLM para análise
 */
async function processarImagem(
  arquivo: Buffer,
  dadosBase: DadosExtraidos,
  urlArquivo: string
): Promise<DadosExtraidos> {
  try {
    // Usar LLM para analisar a imagem e extrair informações
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um assistente que analisa imagens de documentos e extrai informações relevantes.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analise esta imagem e extraia todas as informações relevantes, como datas, valores, nomes, locais, etc. Retorne em formato JSON.",
            },
            {
              type: "image_url",
              image_url: {
                url: urlArquivo,
              },
            },
          ],
        },
      ],
    });
    
    const messageContent = response.choices[0]?.message?.content;
    const analise = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent);
    
    return {
      ...dadosBase,
      texto: analise,
      metadata: {
        analiseIA: analise,
      },
    };
  } catch (error) {
    console.error("[FileProcessor] Erro ao processar imagem:", error);
    return dadosBase;
  }
}

/**
 * Processa múltiplos arquivos de uma vez
 */
export async function processarMultiplosArquivos(
  arquivos: Array<{ buffer: Buffer; nome: string }>,
  missaoId: number
): Promise<DadosExtraidos[]> {
  const resultados: DadosExtraidos[] = [];
  
  for (const arquivo of arquivos) {
    const resultado = await processarArquivo(arquivo.buffer, arquivo.nome, missaoId);
    resultados.push(resultado);
  }
  
  return resultados;
}
