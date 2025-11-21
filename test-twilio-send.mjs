// Usando fetch nativo do Node.js 18+

// Credenciais do Twilio
const TWILIO_ACCOUNT_SID = 'AC5992e9941e9deebff39d8c175fb2f157';
const TWILIO_AUTH_TOKEN = '3ab451a9776ded64853b69afaa988e07';
const TWILIO_PHONE_NUMBER = 'whatsapp:+11972632473';

// Número de destino (substitua pelo seu número)
const TO_NUMBER = 'whatsapp:+5511999999999'; // SUBSTITUA PELO SEU NÚMERO

async function testTwilioSend() {
  console.log('🧪 Testando envio de mensagem via Twilio...\n');
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const params = new URLSearchParams();
  params.append('From', TWILIO_PHONE_NUMBER);
  params.append('To', TO_NUMBER);
  params.append('Body', 'Teste de envio via Twilio! Se você recebeu esta mensagem, a integração está funcionando! 🎉');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Mensagem enviada com sucesso!');
      console.log('📱 SID da mensagem:', data.sid);
      console.log('📊 Status:', data.status);
      console.log('📞 De:', data.from);
      console.log('📞 Para:', data.to);
      console.log('\n💡 Verifique seu telefone para confirmar o recebimento!');
    } else {
      console.error('❌ Erro ao enviar mensagem:');
      console.error('Status:', response.status);
      console.error('Erro:', data);
      
      if (data.code === 21608) {
        console.log('\n⚠️  O número de destino não está registrado no WhatsApp Sandbox do Twilio.');
        console.log('📝 Para corrigir:');
        console.log('   1. Acesse https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
        console.log('   2. Envie uma mensagem do seu telefone para o número do Twilio com o código fornecido');
        console.log('   3. Aguarde a confirmação e tente novamente');
      }
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

// Executar teste
testTwilioSend();
