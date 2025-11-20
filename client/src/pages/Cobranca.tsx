import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, DollarSign, Link as LinkIcon, Mail, MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function Cobranca() {
  const { data: servicos, isLoading } = trpc.servicos.listAtivos.useQuery();
  const { data: links } = trpc.cobranca.listAll.useQuery();
  const criarCheckout = trpc.cobranca.criarCheckout.useMutation();

  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [desconto, setDesconto] = useState(0);
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleServico = (id: number) => {
    setServicosSelecionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const calcularTotal = () => {
    if (!servicos) return 0;
    const total = servicos
      .filter(s => servicosSelecionados.includes(s.id))
      .reduce((sum, s) => sum + s.preco, 0);
    return total;
  };

  const calcularDesconto = () => {
    const total = calcularTotal();
    return Math.round(total * (desconto / 100));
  };

  const calcularValorFinal = () => {
    return calcularTotal() - calcularDesconto();
  };

  const formatarMoeda = (centavos: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(centavos / 100);
  };

  const handleGerarLink = async () => {
    if (servicosSelecionados.length === 0) {
      toast.error("Selecione pelo menos um serviço");
      return;
    }
    if (!clienteNome || !clienteEmail) {
      toast.error("Preencha nome e e-mail do cliente");
      return;
    }

    try {
      const result = await criarCheckout.mutateAsync({
        clienteNome,
        clienteEmail,
        clienteTelefone,
        servicosIds: servicosSelecionados,
        desconto,
        observacoes,
      });

      setLinkGerado(result.checkoutUrl || null);
      toast.success("Link de pagamento gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar link de pagamento");
    }
  };

  const copiarLink = () => {
    if (linkGerado) {
      navigator.clipboard.writeText(linkGerado);
      setCopiedLink(true);
      toast.success("Link copiado para área de transferência!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const compartilharWhatsApp = () => {
    if (linkGerado) {
      const mensagem = `Olá ${clienteNome}! Segue o link para pagamento dos serviços da Transblindados: ${linkGerado}`;
      const url = `https://wa.me/${clienteTelefone.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, "_blank");
    }
  };

  const compartilharEmail = () => {
    if (linkGerado) {
      const assunto = "Link de Pagamento - Transblindados";
      const corpo = `Olá ${clienteNome},\n\nSegue o link para pagamento dos serviços contratados:\n\n${linkGerado}\n\nValor total: ${formatarMoeda(calcularValorFinal())}\n\nAtenciosamente,\nTransblindados`;
      const url = `mailto:${clienteEmail}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
      window.location.href = url;
    }
  };

  const resetarFormulario = () => {
    setServicosSelecionados([]);
    setDesconto(0);
    setClienteNome("");
    setClienteEmail("");
    setClienteTelefone("");
    setObservacoes("");
    setLinkGerado(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cobrança por Link</h1>
          <p className="text-gray-500">Gere links de pagamento para seus clientes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seleção de Serviços */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Selecione os Serviços</CardTitle>
                <CardDescription>Escolha os serviços que o cliente contratou</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicos?.map((servico) => (
                    <div
                      key={servico.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        servicosSelecionados.includes(servico.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleServico(servico.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={servicosSelecionados.includes(servico.id)}
                          onCheckedChange={() => toggleServico(servico.id)}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{servico.nome}</h3>
                          <p className="text-sm text-gray-500 mt-1">{servico.descricao}</p>
                          <p className="text-lg font-bold text-blue-600 mt-2">
                            {formatarMoeda(servico.preco)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
                <CardDescription>Informações para envio do link de pagamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clienteNome">Nome do Cliente *</Label>
                  <Input
                    id="clienteNome"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clienteEmail">E-mail *</Label>
                    <Input
                      id="clienteEmail"
                      type="email"
                      value={clienteEmail}
                      onChange={(e) => setClienteEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clienteTelefone">Telefone/WhatsApp</Label>
                    <Input
                      id="clienteTelefone"
                      value={clienteTelefone}
                      onChange={(e) => setClienteTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Informações adicionais"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculadora e Resumo */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Calculadora
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="desconto">Desconto (%)</Label>
                  <Input
                    id="desconto"
                    type="number"
                    min="0"
                    max="100"
                    value={desconto}
                    onChange={(e) => setDesconto(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatarMoeda(calcularTotal())}</span>
                  </div>
                  {desconto > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto ({desconto}%):</span>
                      <span>-{formatarMoeda(calcularDesconto())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatarMoeda(calcularValorFinal())}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGerarLink}
                  disabled={criarCheckout.isPending || servicosSelecionados.length === 0}
                >
                  {criarCheckout.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Gerar Link de Pagamento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {linkGerado && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Link Gerado!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white p-3 rounded border border-green-200 break-all text-sm">
                    {linkGerado}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={copiarLink}>
                      {copiedLink ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={compartilharWhatsApp}
                      disabled={!clienteTelefone}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>

                  <Button variant="outline" size="sm" className="w-full" onClick={compartilharEmail}>
                    <Mail className="h-4 w-4 mr-1" />
                    Enviar por E-mail
                  </Button>

                  <Button variant="ghost" size="sm" className="w-full" onClick={resetarFormulario}>
                    Nova Cobrança
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Histórico de Links */}
        {links && links.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Histórico de Cobranças</CardTitle>
              <CardDescription>Links de pagamento gerados recentemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {links.slice(0, 10).map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{link.clienteNome}</p>
                      <p className="text-sm text-gray-500">{link.clienteEmail}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(link.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatarMoeda(link.valorTotal)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          link.status === "Pago"
                            ? "bg-green-100 text-green-800"
                            : link.status === "Pendente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {link.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
