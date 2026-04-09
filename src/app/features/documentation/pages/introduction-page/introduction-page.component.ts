import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-introduction-page',
  templateUrl: './introduction-page.component.html',
  styleUrls: ['./introduction-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IntroductionPageComponent {
  quickStartCode = `curl -X POST "https://api-ar.javacash.finance/api/payin/register" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "currency": "ARS",
    "amount": "100",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "userPhone": "12345678",
    "userIdentificationNumber": "20123456789",
    "dueDate": "2025/12/31"
  }'`;

  responseExample = `{
  "success": true,
  "message": "Transaction successfully created",
  "code": 200,
  "data": {
    "id": "65baf429-9e41-44c5-bb16-5785aa087160",
    "status": "pending",
    "reference": "39001303",
    "checkoutUrl": "https://argentina.javacash.finance/checkout/65baf429...",
    "currency": "ARS",
    "amount": "100.00",
    "customId": "1"
  }
}`;

  nodeExample = `const JavaCash = require('@javacash/sdk');

const javacash = new JavaCash({
  apiKey: process.env.JAVACASH_API_KEY,
  country: 'ARG'
});

// Crear un PayIn
const payin = await javacash.payin.create({
  amount: 100,
  currency: 'ARS',
  userName: 'John Doe',
  userEmail: 'john@example.com',
  userPhone: '12345678',
  userIdentificationNumber: '20-12345678-9', // CUIT/CUIL del usuario
  dueDate: '2025/12/31'
});

console.log(payin.checkoutUrl);`;

  pythonExample = `from javacash import JavaCash

javacash = JavaCash(
    api_key=os.environ.get('JAVACASH_API_KEY'),
    country='ARG'
)

# Crear un PayIn
payin = javacash.payin.create(
    amount=100,
    currency='ARS',
    user_name='John Doe',
    user_email='john@example.com',
    user_phone='12345678',
    user_identification_number='20-12345678-9',  # CUIT/CUIL del usuario
    due_date='2025/12/31'
)

print(payin.checkout_url)`;

  phpExample = `<?php
use JavaCash\\JavaCashClient;

$javacash = new JavaCashClient([
    'api_key' => getenv('JAVACASH_API_KEY'),
    'country' => 'ARG'
]);

// Crear un PayIn
$payin = $javacash->payin->create([
    'amount' => 100,
    'currency' => 'ARS',
    'userName' => 'John Doe',
    'userEmail' => 'john@example.com',
    'userPhone' => '12345678',
    'userIdentificationNumber' => '20-12345678-9', // CUIT/CUIL del usuario
    'dueDate' => '2025/12/31'
]);

echo $payin->checkoutUrl;`;

  webhookExample = `// Configurar webhook para recibir notificaciones
app.post('/webhook/javacash', (req, res) => {
  const event = req.body;

  switch(event.type) {
    case 'payin.completed':
      console.log('Pago completado:', event.data.id);
      // Actualizar estado en tu base de datos
      break;
    case 'payin.failed':
      console.log('Pago fallido:', event.data.id);
      break;
    case 'payout.completed':
      console.log('Transferencia completada:', event.data.id);
      break;
  }

  res.status(200).send('OK');
});`;
}
