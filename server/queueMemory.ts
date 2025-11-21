/**
 * Fila em memória para processamento de mensagens WhatsApp
 * Use em desenvolvimento. Para produção, use Redis + Bull
 */

import { processarMensagemWhatsapp, processarSelecaoMenu, ehSelecaoMenu } from "./whatsappWebhook";
import { enviarMensagemTwilio } from "./whatsappTwilio";
import { emitMensagemStatusUpdate } from "./websocket";

export interface MensagemJob {
  numeroCliente: string;
  mensagem: string;
  nomeCliente?: string;
  twilioMessageSid?: string;
}

interface JobInternal extends MensagemJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  tentativas: number;
  erro?: string;
  resultado?: any;
}

class FilaMemoria {
  private jobs: Map<string, JobInternal> = new Map();
  private processando = false;
  private processadores: Array<(job: JobInternal) => Promise<void>> = [];

  async adicionar(job: MensagemJob): Promise<string> {
    const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const jobInternal: JobInternal = {
      ...job,
      id,
      status: "pending",
      tentativas: 0,
    };

    this.jobs.set(id, jobInternal);
    console.log(`[FilaMemoria] Job adicionado: ${id}`);

    // Iniciar processamento
    this.processar();

    return id;
  }

  private async processar() {
    if (this.processando) return;
    this.processando = true;

    try {
      while (true) {
        const job = Array.from(this.jobs.values()).find(
          (j) => j.status === "pending"
        );

        if (!job) break;

        job.status = "processing";
        job.tentativas++;

        try {
          console.log(`[FilaMemoria] Processando: ${job.id}`);

          let resposta = "";

          // Verificar se é seleção do menu
          if (ehSelecaoMenu(job.mensagem)) {
            resposta = await processarSelecaoMenu(job.mensagem);
          } else {
            // Processar como mensagem normal com IA
            const resultado = await processarMensagemWhatsapp(
              job.numeroCliente,
              job.mensagem,
              job.nomeCliente
            );
            resposta = resultado.resposta;
          }

          // Enviar resposta via Twilio
          const sucesso = await enviarMensagemTwilio(
            job.numeroCliente,
            resposta
          );

          if (sucesso) {
            job.status = "completed";
            job.resultado = { resposta };
            console.log(`[FilaMemoria] Job completado: ${job.id}`);
          } else {
            throw new Error("Falha ao enviar via Twilio");
          }
        } catch (error) {
          job.erro = error instanceof Error ? error.message : String(error);

          if (job.tentativas < 3) {
            job.status = "pending";
            console.log(
              `[FilaMemoria] Job falhou, tentando novamente: ${job.id}`
            );
            // Aguardar antes de tentar novamente
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            job.status = "failed";
            console.error(`[FilaMemoria] Job falhou permanentemente: ${job.id}`);
          }
        }
      }
    } finally {
      this.processando = false;
    }
  }

  obterStatus(id: string) {
    return this.jobs.get(id);
  }

  obterEstatisticas() {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pendente: jobs.filter((j) => j.status === "pending").length,
      processando: jobs.filter((j) => j.status === "processing").length,
      completado: jobs.filter((j) => j.status === "completed").length,
      falho: jobs.filter((j) => j.status === "failed").length,
    };
  }

  limpar() {
    this.jobs.clear();
    console.log("[FilaMemoria] Fila limpa");
  }
}

export const fila = new FilaMemoria();

export async function adicionarMensagemAFila(job: MensagemJob) {
  return fila.adicionar(job);
}

export async function obterStatusFila() {
  return fila.obterEstatisticas();
}

export async function iniciarProcessadorFila() {
  console.log("[FilaMemoria] Processador de fila iniciado (em memória)");
}

export async function pararProcessadorFila() {
  console.log("[FilaMemoria] Processador de fila parado");
}
