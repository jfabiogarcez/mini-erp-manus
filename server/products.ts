/**
 * Catálogo de serviços da Transblindados
 * Preços em centavos (ex: 10000 = R$ 100,00)
 */

export const SERVICOS_TRANSBLINDADOS = [
  {
    id: "transporte-executivo",
    nome: "Transporte Executivo",
    descricao: "Serviço de transporte executivo com veículo blindado e motorista especializado",
    preco: 50000, // R$ 500,00
  },
  {
    id: "seguranca-pessoal",
    nome: "Segurança Pessoal",
    descricao: "Segurança pessoal profissional para eventos e deslocamentos",
    preco: 80000, // R$ 800,00
  },
  {
    id: "receptivo-aeroporto",
    nome: "Receptivo de Aeroporto",
    descricao: "Serviço de receptivo em aeroportos com transfer em veículo blindado",
    preco: 35000, // R$ 350,00
  },
  {
    id: "escolta-armada",
    nome: "Escolta Armada",
    descricao: "Serviço de escolta armada para transporte de valores ou pessoas de alto risco",
    preco: 120000, // R$ 1.200,00
  },
  {
    id: "transporte-eventos",
    nome: "Transporte para Eventos",
    descricao: "Transporte especializado para eventos corporativos e sociais",
    preco: 60000, // R$ 600,00
  },
  {
    id: "consultoria-seguranca",
    nome: "Consultoria de Segurança",
    descricao: "Análise de riscos e consultoria em segurança pessoal e patrimonial",
    preco: 100000, // R$ 1.000,00
  },
];

/**
 * Formata valor em centavos para moeda brasileira
 */
export function formatarMoeda(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

/**
 * Calcula desconto
 */
export function calcularDesconto(valor: number, descontoPercentual: number): number {
  return Math.round(valor * (descontoPercentual / 100));
}

/**
 * Calcula valor final com desconto
 */
export function calcularValorFinal(valor: number, descontoPercentual: number): number {
  const desconto = calcularDesconto(valor, descontoPercentual);
  return valor - desconto;
}
