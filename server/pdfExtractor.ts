import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

/**
 * Extrai dados de um PDF de multa usando IA
 * @param pdfBuffer Buffer do arquivo PDF
 * @param pdfUrl URL pública do PDF (se já estiver no S3)
 * @returns Dados extraídos da multa
 */
export async function extractMultaFromPDF(
  pdfBuffer?: Buffer,
  pdfUrl?: string
): Promise<{
  numeroAuto: string;
  dataInfracao: string;
  horaInfracao: string;
  localInfracao: string;
  codigoInfracao: string;
  descricaoInfracao: string;
  valor: number;
  pontos: number;
  veiculoPlaca: string;
  dataVencimento: string;
}> {
  try {
    // Se não tiver URL, faz upload do buffer para o S3
    let url = pdfUrl;
    if (!url && pdfBuffer) {
      const fileName = `multas/multa-${Date.now()}.pdf`;
      const uploadResult = await storagePut(fileName, pdfBuffer, "application/pdf");
      url = uploadResult.url;
    }

    if (!url) {
      throw new Error("PDF URL ou buffer é necessário");
    }

    // Usar LLM para extrair dados do PDF
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente especializado em extrair informações de multas de trânsito brasileiras.
Analise o PDF fornecido e extraia as seguintes informações:
- Número do Auto de Infração
- Data da Infração (formato YYYY-MM-DD)
- Hora da Infração (formato HH:MM)
- Local da Infração (endereço completo)
- Código da Infração
- Descrição da Infração
- Valor da Multa (em centavos, ex: 29390 para R$ 293,90)
- Pontos na CNH
- Placa do Veículo
- Data de Vencimento (formato YYYY-MM-DD)

Retorne APENAS um JSON válido com essas informações.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraia os dados desta multa de trânsito:",
            },
            {
              type: "file_url",
              file_url: {
                url,
                mime_type: "application/pdf",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "multa_data",
          strict: true,
          schema: {
            type: "object",
            properties: {
              numeroAuto: { type: "string", description: "Número do Auto de Infração" },
              dataInfracao: { type: "string", description: "Data da infração no formato YYYY-MM-DD" },
              horaInfracao: { type: "string", description: "Hora da infração no formato HH:MM" },
              localInfracao: { type: "string", description: "Local completo da infração" },
              codigoInfracao: { type: "string", description: "Código da infração" },
              descricaoInfracao: { type: "string", description: "Descrição da infração" },
              valor: { type: "number", description: "Valor da multa em centavos" },
              pontos: { type: "number", description: "Pontos na CNH" },
              veiculoPlaca: { type: "string", description: "Placa do veículo" },
              dataVencimento: { type: "string", description: "Data de vencimento no formato YYYY-MM-DD" },
            },
            required: [
              "numeroAuto",
              "dataInfracao",
              "horaInfracao",
              "localInfracao",
              "codigoInfracao",
              "descricaoInfracao",
              "valor",
              "pontos",
              "veiculoPlaca",
              "dataVencimento",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const message = response.choices[0]?.message;
    if (!message || !message.content) {
      throw new Error("Nenhuma resposta da IA");
    }

    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
    const data = JSON.parse(content);
    return data;
  } catch (error) {
    console.error("[PDF Extractor] Erro ao extrair dados:", error);
    throw new Error("Falha ao extrair dados do PDF de multa");
  }
}

/**
 * Processa múltiplos PDFs de multas em lote
 * @param pdfs Array de buffers de PDFs
 * @returns Array de dados extraídos
 */
export async function extractMultasFromPDFsBatch(
  pdfs: Array<{ buffer: Buffer; fileName: string }>
): Promise<
  Array<{
    fileName: string;
    data?: Awaited<ReturnType<typeof extractMultaFromPDF>>;
    error?: string;
  }>
> {
  const results = [];

  for (const pdf of pdfs) {
    try {
      const data = await extractMultaFromPDF(pdf.buffer);
      results.push({ fileName: pdf.fileName, data });
    } catch (error) {
      results.push({
        fileName: pdf.fileName,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  return results;
}
