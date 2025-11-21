# Guia de Configuração do Twilio WhatsApp

## Passo 1: Acessar Console do Twilio

1. Acesse https://console.twilio.com/
2. Faça login com suas credenciais
3. No menu lateral, clique em **Messaging** → **Try it out** → **Send a WhatsApp message**

## Passo 2: Configurar WhatsApp Sandbox

1. Na página do WhatsApp Sandbox, você verá um número de teste do Twilio
2. Envie uma mensagem do seu telefone para esse número com o código fornecido (ex: `join <código>`)
3. Aguarde a confirmação de que seu número foi conectado ao sandbox

## Passo 3: Registrar Webhook

1. Na mesma página do WhatsApp Sandbox, role até a seção **Sandbox Configuration**
2. No campo **WHEN A MESSAGE COMES IN**, cole a URL do webhook:

```
https://3000-i11qdpwgzfazsxxepufk4-e90289e3.manusvm.computer/api/whatsapp/webhook
```

3. Selecione o método **HTTP POST**
4. Clique em **Save** para salvar a configuração

## Passo 4: Testar Integração

1. Envie uma mensagem do seu telefone para o número do Twilio
2. A mensagem deve aparecer automaticamente no chat do sistema
3. Você pode responder pelo sistema e a resposta chegará no seu telefone

## Credenciais Configuradas

As seguintes credenciais já estão configuradas no sistema:

- **TWILIO_ACCOUNT_SID**: AC5992e9941e9deebff39d8c175fb2f157
- **TWILIO_AUTH_TOKEN**: 3ab451a9776ded64853b69afaa988e07
- **TWILIO_PHONE_NUMBER**: 11972632473

## Troubleshooting

### Mensagens não chegam no sistema

1. Verifique se o webhook está registrado corretamente no console do Twilio
2. Teste o webhook manualmente com curl:

```bash
curl -X POST https://3000-i11qdpwgzfazsxxepufk4-e90289e3.manusvm.computer/api/whatsapp/webhook \
  -d "From=whatsapp:+5511999999999" \
  -d "Body=Teste de mensagem" \
  -d "MessageSid=TEST123"
```

3. Verifique os logs do servidor para erros

### Respostas não chegam no telefone

1. Verifique se as credenciais do Twilio estão corretas
2. Verifique se o número do Twilio está no formato correto (com código do país)
3. Verifique os logs do servidor para erros de envio

## Limitações do Sandbox

O WhatsApp Sandbox do Twilio tem algumas limitações:

- Apenas números que enviaram o código `join` podem receber mensagens
- Mensagens expiram após 24 horas de inatividade
- Para produção, você precisa solicitar aprovação do Twilio para usar um número real

## Próximos Passos

1. **Solicitar número real do Twilio** - Para produção, solicite um número real no console do Twilio
2. **Configurar templates aprovados** - Para enviar mensagens proativas, você precisa criar templates aprovados pelo WhatsApp
3. **Implementar webhooks de status** - Configure webhooks para receber atualizações de status de entrega
