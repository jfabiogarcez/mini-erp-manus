import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Send, Mail } from "lucide-react";

interface Email {
  id: number;
  para: string;
  assunto: string;
  mensagem: string;
  data: string;
  status: "enviado" | "rascunho";
}

export default function Email() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [para, setPara] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  const enviarEmail = () => {
    if (para.trim() && assunto.trim()) {
      const novoEmail: Email = {
        id: Date.now(),
        para,
        assunto,
        mensagem,
        data: new Date().toLocaleDateString("pt-BR"),
        status: "enviado",
      };
      setEmails([novoEmail, ...emails]);
      setPara("");
      setAssunto("");
      setMensagem("");
    }
  };

  const salvarRascunho = () => {
    if (para.trim() || assunto.trim()) {
      const novoEmail: Email = {
        id: Date.now(),
        para,
        assunto,
        mensagem,
        data: new Date().toLocaleDateString("pt-BR"),
        status: "rascunho",
      };
      setEmails([novoEmail, ...emails]);
      setPara("");
      setAssunto("");
      setMensagem("");
    }
  };

  const deletarEmail = (id: number) => {
    setEmails(emails.filter((e) => e.id !== id));
  };

  const emailsEnviados = emails.filter((e) => e.status === "enviado");
  const rascunhos = emails.filter((e) => e.status === "rascunho");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Email</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Novo Email</h2>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Para (email)"
            value={para}
            onChange={(e) => setPara(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Assunto"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <textarea
            placeholder="Mensagem"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={5}
          />
          <div className="flex gap-2">
            <Button onClick={enviarEmail} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
            <Button onClick={salvarRascunho} variant="outline" className="flex-1">
              Salvar Rascunho
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {emailsEnviados.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Enviados ({emailsEnviados.length})
            </h3>
            <div className="space-y-2">
              {emailsEnviados.map((email) => (
                <Card key={email.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold">Para: {email.para}</p>
                      <p className="text-gray-700 font-medium">{email.assunto}</p>
                      <p className="text-gray-600 text-sm mt-1">{email.mensagem}</p>
                      <p className="text-gray-400 text-xs mt-2">{email.data}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletarEmail(email.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {rascunhos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Rascunhos ({rascunhos.length})
            </h3>
            <div className="space-y-2">
              {rascunhos.map((email) => (
                <Card key={email.id} className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold">Para: {email.para || "(vazio)"}</p>
                      <p className="text-gray-700 font-medium">{email.assunto || "(sem assunto)"}</p>
                      <p className="text-gray-600 text-sm mt-1">{email.mensagem}</p>
                      <p className="text-gray-400 text-xs mt-2">{email.data}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletarEmail(email.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {emails.length === 0 && (
          <p className="text-gray-600 text-center py-8">
            Nenhum email enviado ou rascunho.
          </p>
        )}
      </div>
    </div>
  );
}
