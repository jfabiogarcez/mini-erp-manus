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

/**
 * Schema para extração de missões de PDF
 */
export const missaoSchema = {
  type: 'object',
  properties: {
    missoes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          data: { type: 'string', description: 'Data da missão no formato YYYY-MM-DD' },
          cliente: { type: 'string', description: 'Nome do cliente' },
          servico: { type: 'string', description: 'Tipo de serviço prestado' },
          origem: { type: 'string', description: 'Local de origem' },
          destino: { type: 'string', description: 'Local de destino' },
          motorista: { type: 'string', description: 'Nome do motorista' },
          veiculo: { type: 'string', description: 'Modelo do veículo' },
          veiculoPlaca: { type: 'string', description: 'Placa do veículo' },
          valor: { type: 'number', description: 'Valor em reais' },
          horaInicio: { type: 'string', description: 'Hora de início no formato HH:MM' },
          horaFim: { type: 'string', description: 'Hora de fim no formato HH:MM' },
          observacoes: { type: 'string', description: 'Observações adicionais' }
        },
        required: ['data'],
        additionalProperties: false
      }
    }
  },
  required: ['missoes'],
  additionalProperties: false
};

/**
 * Schema para extração de membros da equipe
 */
export const equipeSchema = {
  type: 'object',
  properties: {
    membros: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nome: { type: 'string', description: 'Nome completo' },
          cargo: { type: 'string', description: 'Cargo ou função' },
          telefone: { type: 'string', description: 'Telefone de contato' },
          email: { type: 'string', description: 'E-mail' },
          cpf: { type: 'string', description: 'CPF' },
          rg: { type: 'string', description: 'RG' },
          dataAdmissao: { type: 'string', description: 'Data de admissão no formato YYYY-MM-DD' },
          salario: { type: 'number', description: 'Salário em reais' },
          status: { type: 'string', enum: ['Ativo', 'Inativo', 'Férias', 'Afastado'], description: 'Status do membro' }
        },
        required: ['nome'],
        additionalProperties: false
      }
    }
  },
  required: ['membros'],
  additionalProperties: false
};

/**
 * Extrai missões de PDF usando IA
 */
export async function extrairMissoesDePDF(pdfUrl: string): Promise<any[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em extrair informações de documentos PDF sobre missões e serviços de transporte.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extraia todas as missões/serviços deste documento PDF e retorne no formato JSON especificado.'
            },
            {
              type: 'file_url',
              file_url: {
                url: pdfUrl,
                mime_type: 'application/pdf'
              }
            }
          ]
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'missoes_extraction',
          strict: true,
          schema: missaoSchema
        }
      }
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error('Nenhum conteúdo retornado pela IA');
    }

    const content = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
    const resultado = JSON.parse(content);
    return resultado.missoes || [];
  } catch (error) {
    console.error('Erro ao extrair missões de PDF:', error);
    throw new Error('Falha ao extrair missões do PDF');
  }
}

/**
 * Extrai membros da equipe de PDF usando IA
 */
export async function extrairEquipeDePDF(pdfUrl: string): Promise<any[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em extrair informações de documentos PDF sobre membros de equipe e funcionários.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extraia todos os membros da equipe/funcionários deste documento PDF e retorne no formato JSON especificado.'
            },
            {
              type: 'file_url',
              file_url: {
                url: pdfUrl,
                mime_type: 'application/pdf'
              }
            }
          ]
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'equipe_extraction',
          strict: true,
          schema: equipeSchema
        }
      }
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error('Nenhum conteúdo retornado pela IA');
    }

    const content = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
    const resultado = JSON.parse(content);
    return resultado.membros || [];
  } catch (error) {
    console.error('Erro ao extrair equipe de PDF:', error);
    throw new Error('Falha ao extrair equipe do PDF');
  }
}

/**
 * Normaliza dados de Excel para o formato esperado de missões
 */
export function normalizeMissoesFromExcel(data: any[]): any[] {
  return data.map(row => {
    // Tentar diferentes variações de nomes de colunas
    const getData = () => {
      const possiveisNomes = ['Data', 'data', 'DATE', 'date', 'Data da Missão', 'Data Missão'];
      for (const nome of possiveisNomes) {
        if (row[nome]) return row[nome];
      }
      return null;
    };

    return {
      data: getData(),
      cliente: row.Cliente || row.cliente || row.CLIENTE || row.client || null,
      servico: row.Servico || row.servico || row.SERVICO || row['Serviço'] || null,
      origem: row.Origem || row.origem || row.ORIGEM || row.origin || null,
      destino: row.Destino || row.destino || row.DESTINO || row.destination || null,
      motorista: row.Motorista || row.motorista || row.MOTORISTA || row.driver || null,
      veiculo: row.Veiculo || row.veiculo || row.VEICULO || row['Veículo'] || row.vehicle || null,
      veiculoPlaca: row.Placa || row.placa || row.PLACA || row.plate || null,
      valor: parseFloat(row.Valor || row.valor || row.VALOR || row.value || 0) * 100, // Converter para centavos
      horaInicio: row['Hora Início'] || row.horaInicio || row['HORA INÍCIO'] || row.startTime || null,
      horaFim: row['Hora Fim'] || row.horaFim || row['HORA FIM'] || row.endTime || null,
      observacoes: row.Observacoes || row.observacoes || row.OBSERVACOES || row['Observações'] || row.notes || null,
      status: 'Agendada'
    };
  }).filter(missao => missao.data); // Filtrar apenas linhas com data
}

/**
 * Normaliza dados de Excel para o formato esperado de equipe
 */
export function normalizeEquipeFromExcel(data: any[]): any[] {
  return data.map(row => ({
    nome: row.Nome || row.nome || row.NOME || row.name || null,
    cargo: row.Cargo || row.cargo || row.CARGO || row.position || null,
    telefone: row.Telefone || row.telefone || row.TELEFONE || row.phone || null,
    email: row.Email || row.email || row.EMAIL || row['E-mail'] || null,
    cpf: row.CPF || row.cpf || null,
    rg: row.RG || row.rg || null,
    dataAdmissao: row['Data Admissão'] || row.dataAdmissao || row['DATA ADMISSÃO'] || row.admissionDate || null,
    salario: parseFloat(row.Salario || row.salario || row.SALARIO || row['Salário'] || row.salary || 0) * 100, // Converter para centavos
    status: row.Status || row.status || row.STATUS || 'Ativo'
  })).filter(membro => membro.nome); // Filtrar apenas linhas com nome
}
