import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  registros: router({
    list: publicProcedure.query(async () => {
      const { getAllRegistros } = await import("./db");
      return getAllRegistros();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const { getRegistroById } = await import("./db");
      return getRegistroById(input.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          assunto: z.string(),
          categoria: z.string(),
          clienteFornecedor: z.string().optional(),
          nDocumentoPedido: z.string().optional(),
          dataDocumento: z.date().optional(),
          dataVencimento: z.date().optional(),
          valorTotal: z.number().default(0),
          status: z.string().default("Pendente"),
          origemArquivo: z.string().optional(),
          origemAba: z.string().optional(),
          observacoes: z.string().optional(),
          chaveAgrupamento: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createRegistro } = await import("./db");
        const id = await createRegistro(input);
        return { id };
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          assunto: z.string().optional(),
          categoria: z.string().optional(),
          clienteFornecedor: z.string().optional(),
          nDocumentoPedido: z.string().optional(),
          dataDocumento: z.date().optional(),
          dataVencimento: z.date().optional(),
          valorTotal: z.number().optional(),
          status: z.string().optional(),
          origemArquivo: z.string().optional(),
          origemAba: z.string().optional(),
          observacoes: z.string().optional(),
          chaveAgrupamento: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateRegistro } = await import("./db");
        const { id, ...data } = input;
        await updateRegistro(id, data);
        return { success: true };
      }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const { deleteRegistro } = await import("./db");
      await deleteRegistro(input.id);
      return { success: true };
    }),
  }),
  notificacoes: router({
    verificarTarefasProximas: publicProcedure
      .input(z.object({ diasAntecedencia: z.number().optional() }))
      .mutation(async ({ input }) => {
        const { verificarTarefasProximasVencimento } = await import("./notifications");
        return verificarTarefasProximasVencimento(input.diasAntecedencia);
      }),
  }),
  ia: router({
    getConfig: publicProcedure.query(async () => {
      const { getConfiguracaoIA } = await import("./aiSystem");
      return getConfiguracaoIA();
    }),
    toggle: publicProcedure.mutation(async () => {
      const { toggleIA } = await import("./aiSystem");
      return toggleIA();
    }),
    getPadroes: publicProcedure.query(async () => {
      const { getPadroesAprendidos } = await import("./aiSystem");
      return getPadroesAprendidos();
    }),
    getEstatisticas: publicProcedure.query(async () => {
      const { getEstatisticasIA } = await import("./aiSystem");
      return getEstatisticasIA();
    }),
    marcarCorreto: publicProcedure
      .input(z.object({ padraoId: z.number() }))
      .mutation(async ({ input }) => {
        const { marcarPadraoCorreto } = await import("./aiSystem");
        await marcarPadraoCorreto(input.padraoId);
        return { success: true };
      }),
  }),
  missoes: router({
    list: publicProcedure.query(async () => {
      const { getAllMissoes } = await import("./db");
      return getAllMissoes();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const { getMissaoById } = await import("./db");
      return getMissaoById(input.id);
    }),
    getByCodigo: publicProcedure.input(z.object({ codigoMissao: z.string() })).query(async ({ input }) => {
      const { getMissaoByCodigo } = await import("./db");
      return getMissaoByCodigo(input.codigoMissao);
    }),
    create: publicProcedure
      .input(
        z.object({
          cliente: z.string().optional(),
          motorista: z.string().optional(),
          dataInicio: z.date().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createMissao, getMissaoById } = await import("./db");
        const id = await createMissao(input);
        return await getMissaoById(id);
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          cliente: z.string().optional(),
          motorista: z.string().optional(),
          status: z.enum(["Pendente", "Em Andamento", "Concluída", "Cancelada"]).optional(),
          dataFim: z.date().optional(),
          observacoes: z.string().optional(),
          linkGoogleDrive: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateMissao } = await import("./db");
        const { id, ...data } = input;
        await updateMissao(id, data);
        return { success: true };
      }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const { deleteMissao } = await import("./db");
      await deleteMissao(input.id);
      return { success: true };
    }),
    getArquivos: publicProcedure.input(z.object({ missaoId: z.number() })).query(async ({ input }) => {
      const { getArquivosByMissaoId } = await import("./db");
      return getArquivosByMissaoId(input.missaoId);
    }),
  }),
  tarefas: router({
    list: publicProcedure.query(async () => {
      const { getAllTarefas } = await import("./db");
      return getAllTarefas();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const { getTarefaById } = await import("./db");
      return getTarefaById(input.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          titulo: z.string(),
          descricao: z.string().optional(),
          dataVencimento: z.date(),
          status: z.string().default("Pendente"),
          registroId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createTarefa } = await import("./db");
        const id = await createTarefa(input);
        return { id };
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          titulo: z.string().optional(),
          descricao: z.string().optional(),
          dataVencimento: z.date().optional(),
          status: z.string().optional(),
          registroId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateTarefa } = await import("./db");
        const { id, ...data } = input;
        await updateTarefa(id, data);
        return { success: true };
      }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const { deleteTarefa } = await import("./db");
      await deleteTarefa(input.id);
      return { success: true };
    }),
  }),
  equipe: router({
    uploadExcel: protectedProcedure
      .input(z.object({
        fileUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        // TODO: Implementar leitura do Excel e cadastro em massa
        // Por enquanto, retorna sucesso
        return { success: true, message: "Funcionalidade será implementada em breve" };
      }),
    listAll: protectedProcedure.query(async () => {
      const { getAllMembrosEquipe } = await import("./db");
      return getAllMembrosEquipe();
    }),
    listByTipo: protectedProcedure
      .input(z.enum(["Motorista", "Segurança", "Receptivo"]))
      .query(async ({ input }) => {
        const { getMembrosByTipo } = await import("./db");
        return getMembrosByTipo(input);
      }),
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        fotoUrl: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        cpf: z.string().optional(),
        tipo: z.enum(["Motorista", "Segurança", "Receptivo"]),
        dadosBancarios: z.string().optional(),
        chavePix: z.string().optional(),
        endereco: z.string().optional(),
        documentos: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createMembroEquipe } = await import("./db");
        const id = await createMembroEquipe(input);
        return { id, success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        fotoUrl: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        cpf: z.string().optional(),
        tipo: z.enum(["Motorista", "Segurança", "Receptivo"]).optional(),
        dadosBancarios: z.string().optional(),
        chavePix: z.string().optional(),
        endereco: z.string().optional(),
        documentos: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { updateMembroEquipe } = await import("./db");
        await updateMembroEquipe(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteMembroEquipe } = await import("./db");
        await deleteMembroEquipe(input.id);
        return { success: true };
      }),
  }),

  multas: router({
    listAll: protectedProcedure.query(async () => {
      const { getAllMultas } = await import("./db");
      return getAllMultas();
    }),
    create: protectedProcedure
      .input(z.object({
        numeroAuto: z.string().optional(),
        dataInfracao: z.date().optional(),
        horaInfracao: z.string().optional(),
        localInfracao: z.string().optional(),
        codigoInfracao: z.string().optional(),
        descricaoInfracao: z.string().optional(),
        valor: z.number().optional(),
        pontos: z.number().optional(),
        veiculoPlaca: z.string().optional(),
        motoristaId: z.number().optional(),
        dataVencimento: z.date().optional(),
        status: z.enum(["Pendente", "Pago", "Recorrido", "Cancelado"]).optional(),
        pdfUrl: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createMulta } = await import("./db");
        const id = await createMulta(input);
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        numeroAuto: z.string().optional(),
        dataInfracao: z.date().optional(),
        horaInfracao: z.string().optional(),
        localInfracao: z.string().optional(),
        codigoInfracao: z.string().optional(),
        descricaoInfracao: z.string().optional(),
        valor: z.number().optional(),
        pontos: z.number().optional(),
        veiculoPlaca: z.string().optional(),
        motoristaId: z.number().optional(),
        dataVencimento: z.date().optional(),
        status: z.enum(["Pendente", "Pago", "Recorrido", "Cancelado"]).optional(),
        pdfUrl: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { updateMulta } = await import("./db");
        await updateMulta(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteMulta } = await import("./db");
        await deleteMulta(input.id);
        return { success: true };
      }),
    extractFromPDF: protectedProcedure
      .input(z.object({ pdfUrl: z.string() }))
      .mutation(async ({ input }) => {
        const { extractMultaFromPDF } = await import("./pdfExtractor");
        const data = await extractMultaFromPDF(undefined, input.pdfUrl);
        return data;
      }),
  }),

  servicos: router({
    listAll: protectedProcedure.query(async () => {
      const { getAllServicos } = await import("./db");
      return getAllServicos();
    }),
    listAtivos: protectedProcedure.query(async () => {
      const { getServicosAtivos } = await import("./db");
      return getServicosAtivos();
    }),
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        preco: z.number(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createServico } = await import("./db");
        const id = await createServico(input);
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        preco: z.number().optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { updateServico } = await import("./db");
        await updateServico(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteServico } = await import("./db");
        await deleteServico(input.id);
        return { success: true };
      }),
  }),

  cobranca: router({
    listAll: protectedProcedure.query(async () => {
      const { getAllLinksCobranca } = await import("./db");
      return getAllLinksCobranca();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getLinkCobrancaById } = await import("./db");
        return getLinkCobrancaById(input.id);
      }),
    criarCheckout: protectedProcedure
      .input(z.object({
        clienteNome: z.string(),
        clienteEmail: z.string().email(),
        clienteTelefone: z.string().optional(),
        servicosIds: z.array(z.number()),
        desconto: z.number().min(0).max(100).optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const { getServicoById, createLinkCobranca } = await import("./db");
        const { calcularValorFinal } = await import("./products");

        // Buscar serviços selecionados
        const servicos = await Promise.all(
          input.servicosIds.map(id => getServicoById(id))
        );

        // Calcular valor total
        const valorTotal = servicos.reduce((sum, s) => sum + (s?.preco || 0), 0);
        const desconto = input.desconto || 0;
        const valorFinal = calcularValorFinal(valorTotal, desconto);

        // Criar line items para o Stripe
        const lineItems = servicos.map(servico => ({
          price_data: {
            currency: "brl",
            product_data: {
              name: servico!.nome,
              description: servico!.descricao || undefined,
            },
            unit_amount: servico!.preco,
          },
          quantity: 1,
        }));

        // Aplicar desconto se houver
        if (desconto > 0) {
          const valorDesconto = valorTotal - valorFinal;
          lineItems.push({
            price_data: {
              currency: "brl",
              product_data: {
                name: `Desconto (${desconto}%)`,
                description: `Desconto de ${desconto}% aplicado`,
              },
              unit_amount: -valorDesconto,
            },
            quantity: 1,
          });
        }

        // Criar sessão de checkout do Stripe
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${ctx.req.headers.origin}/cobranca/sucesso?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${ctx.req.headers.origin}/cobranca`,
          customer_email: input.clienteEmail,
          client_reference_id: input.clienteNome,
          metadata: {
            cliente_nome: input.clienteNome,
            cliente_email: input.clienteEmail,
            cliente_telefone: input.clienteTelefone || "",
            servicos_ids: JSON.stringify(input.servicosIds),
            desconto: desconto.toString(),
          },
          allow_promotion_codes: true,
        });

        // Salvar no banco de dados
        const linkId = await createLinkCobranca({
          stripeCheckoutSessionId: session.id,
          clienteNome: input.clienteNome,
          clienteEmail: input.clienteEmail,
          clienteTelefone: input.clienteTelefone,
          valorTotal: valorFinal,
          desconto,
          status: "Pendente",
          servicosIds: JSON.stringify(input.servicosIds),
          observacoes: input.observacoes,
          linkCheckout: session.url,
        });

        return {
          linkId,
          checkoutUrl: session.url,
          sessionId: session.id,
        };
      }),
  }),

  aprendizados: router({
    listAll: protectedProcedure.query(async () => {
      const { getAllAprendizados } = await import("./db");
      return getAllAprendizados();
    }),
    listAtivos: protectedProcedure.query(async () => {
      const { getAprendizadosAtivos } = await import("./db");
      return getAprendizadosAtivos();
    }),
    create: protectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        descricao: z.string().min(1),
        categoria: z.string().optional(),
        ordem: z.number().optional(),
        ativo: z.number().optional(),
        aprendidoAutomaticamente: z.number().optional(),
        confianca: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createAprendizado } = await import("./db");
        const id = await createAprendizado(input);
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        categoria: z.string().optional(),
        ordem: z.number().optional(),
        ativo: z.number().optional(),
        confianca: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { updateAprendizado } = await import("./db");
        await updateAprendizado(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteAprendizado } = await import("./db");
        await deleteAprendizado(input.id);
        return { success: true };
      }),
  }),

  modelos: router({
    listAll: protectedProcedure.query(async () => {
      const { getAllModelos } = await import("./db");
      return getAllModelos();
    }),
    listAtivos: protectedProcedure.query(async () => {
      const { getModelosAtivos } = await import("./db");
      return getModelosAtivos();
    }),
    getByCategoria: protectedProcedure
      .input(z.object({ categoria: z.string() }))
      .query(async ({ input }) => {
        const { getModelosByCategoria } = await import("./db");
        return getModelosByCategoria(input.categoria);
      }),
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        categoria: z.enum(["Orçamento", "Contrato", "Proposta", "Relatório", "Carta", "Outros"]),
        arquivoUrl: z.string(),
        arquivoNome: z.string().optional(),
        tipoArquivo: z.string().optional(),
        camposVariaveis: z.string().optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createModelo } = await import("./db");
        const id = await createModelo(input);
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        categoria: z.enum(["Orçamento", "Contrato", "Proposta", "Relatório", "Carta", "Outros"]).optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { updateModelo } = await import("./db");
        await updateModelo(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteModelo } = await import("./db");
        await deleteModelo(input.id);
        return { success: true };
      }),
    gerarDocumento: protectedProcedure
      .input(z.object({
        modeloId: z.number(),
        destinatarioNome: z.string(),
        destinatarioEmail: z.string().email().optional(),
        destinatarioTelefone: z.string().optional(),
        dadosAdicionais: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { getModeloById, createDocumentoGerado, incrementarUsoModelo } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");
        
        const modelo = await getModeloById(input.modeloId);
        if (!modelo) throw new Error("Modelo não encontrado");

        // Usar IA para preencher o documento
        const prompt = `
Você é um assistente que preenche documentos profissionais.

Modelo: ${modelo.nome}
Descrição: ${modelo.descricao || ""}
Categoria: ${modelo.categoria}

Destinatário:
- Nome: ${input.destinatarioNome}
- Email: ${input.destinatarioEmail || "Não informado"}
- Telefone: ${input.destinatarioTelefone || "Não informado"}

Dados adicionais: ${JSON.stringify(input.dadosAdicionais || {})}

Gere um documento completo e profissional baseado neste modelo.
Retorne em formato markdown.
`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um assistente especializado em criar documentos profissionais." },
            { role: "user", content: prompt },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const conteudoGerado = typeof messageContent === "string" ? messageContent : "";

        // Salvar documento gerado (aqui você poderia converter para PDF/DOCX)
        const documentoId = await createDocumentoGerado({
          modeloId: input.modeloId,
          nomeDocumento: `${modelo.nome} - ${input.destinatarioNome}`,
          arquivoUrl: "", // TODO: Implementar conversão e upload
          destinatarioNome: input.destinatarioNome,
          destinatarioEmail: input.destinatarioEmail,
          destinatarioTelefone: input.destinatarioTelefone,
          dadosPreenchidos: JSON.stringify(input.dadosAdicionais || {}),
          statusEnvio: "Não Enviado",
        });

        await incrementarUsoModelo(input.modeloId);

        return {
          documentoId,
          conteudo: conteudoGerado,
        };
      }),
  }),

  documentos: router({
    listAll: protectedProcedure.query(async () => {
      const { getAllDocumentosGerados } = await import("./db");
      return getAllDocumentosGerados();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getDocumentoGeradoById } = await import("./db");
        return getDocumentoGeradoById(input.id);
      }),
    enviar: protectedProcedure
      .input(z.object({
        id: z.number(),
        metodo: z.enum(["email", "whatsapp", "ambos"]),
      }))
      .mutation(async ({ input }) => {
        const { getDocumentoGeradoById, updateDocumentoGerado } = await import("./db");
        
        const documento = await getDocumentoGeradoById(input.id);
        if (!documento) throw new Error("Documento não encontrado");

        // TODO: Implementar envio real por email/WhatsApp
        
        const statusMap = {
          email: "Enviado Email" as const,
          whatsapp: "Enviado WhatsApp" as const,
          ambos: "Ambos" as const,
        };

        await updateDocumentoGerado(input.id, {
          statusEnvio: statusMap[input.metodo],
          dataEnvio: new Date(),
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
