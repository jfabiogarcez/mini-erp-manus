import crypto from "crypto";

// Simular mensagem do Twilio
const twilioUrl = "https://3000-i11qdpwgzfazsxxepufk4-e90289e3.manusvm.computer/api/whatsapp/webhook";
const twilioAuthToken = "AC5992e9941e9deebff39d8c175fb2f157";

const params = {
  MessageSid: "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  AccountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  From: "whatsapp:+5511987654321",
  To: "whatsapp:+5511972632473",
  Body: "Olá! Testando a integração com Twilio",
};

// Construir string para validação
let data = twilioUrl;
const keys = Object.keys(params).sort();
for (const key of keys) {
  data += key + params[key];
}

// Gerar assinatura
const signature = crypto
  .createHmac("sha1", twilioAuthToken)
  .update(data)
  .digest("base64");

console.log("Enviando mensagem de teste para o webhook...");
console.log("URL:", twilioUrl);
console.log("Assinatura:", signature);

// Enviar requisição
const formData = new URLSearchParams();
for (const [key, value] of Object.entries(params)) {
  formData.append(key, value);
}

try {
  const response = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      "X-Twilio-Signature": signature,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Resposta:", text);
} catch (error) {
  console.error("Erro:", error.message);
}
