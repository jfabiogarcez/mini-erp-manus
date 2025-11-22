#!/usr/bin/env node

/**
 * Script para testar webhook do Twilio
 * Simula uma mensagem recebida do WhatsApp
 */

// fetch está disponível nativamente no Node.js 18+

const WEBHOOK_URL = "http://localhost:3000/api/whatsapp/webhook";

const testMessages = [
  {
    From: "whatsapp:+5511987654321",
    Body: "Olá, gostaria de um orçamento",
    MessageSid: "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    From: "whatsapp:+5511987654321",
    Body: "1", // Menu option
    MessageSid: "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    From: "whatsapp:+5511987654321",
    Body: "Qual é o valor?",
    MessageSid: "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
];

async function testarWebhook() {
  console.log("🚀 Iniciando testes do webhook...\n");

  for (let i = 0; i < testMessages.length; i++) {
    const msg = testMessages[i];
    console.log(`\n📨 Teste ${i + 1}/${testMessages.length}`);
    console.log(`   Mensagem: "${msg.Body}"`);
    console.log(`   De: ${msg.From}`);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(msg).toString(),
      });

      const text = await response.text();

      if (response.ok) {
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📤 Resposta XML recebida`);

        // Verificar se contém Response tag
        if (text.includes("<Response>")) {
          console.log(`   ✓ XML válido`);
        }
      } else {
        console.log(`   ❌ Status: ${response.status}`);
        console.log(`   Erro: ${text}`);
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }

    // Aguardar um pouco entre testes
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n\n✅ Testes concluídos!");
  console.log(
    "\n📝 Próximos passos:"
  );
  console.log("   1. Verificar se as mensagens aparecem no banco de dados");
  console.log("   2. Verificar logs do servidor para erros");
  console.log("   3. Verificar se o ChatGPT está gerando respostas");
  console.log("   4. Verificar se o Twilio está enviando respostas de volta");
}

testarWebhook().catch(console.error);
