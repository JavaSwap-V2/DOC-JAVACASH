import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-authentication-page',
  templateUrl: './authentication-page.component.html',
  styleUrls: ['./authentication-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthenticationPageComponent {
  exampleHeader = `curl -X POST "https://api-ar.javacash.finance/api/payin/register" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: abc123xyz456def789ghi012jkl345"`;

  nodeExample = `const axios = require('axios');

const config = {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.JAVACASH_API_KEY
  }
};

const response = await axios.post(
  'https://api-ar.javacash.finance/api/payin/register',
  requestData,
  config
);`;

  pythonExample = `import os
import requests

headers = {
    'Content-Type': 'application/json',
    'x-api-key': os.environ.get('JAVACASH_API_KEY')
}

response = requests.post(
    'https://api-ar.javacash.finance/api/payin/register',
    json=request_data,
    headers=headers
)`;

  errorExample = `{
  "success": false,
  "message": "Invalid API key or missing authentication",
  "code": 401,
  "error": "Unauthorized"
}`;

  // Webhook examples
  payInWebhookExample = `{
  "type": "pay-in",
  "transactionId": "TXN-123456",
  "userId": "USR-789",
  "amount": 500.00,
  "status": "paid",
  "timestamp": "2024-01-15T10:30:00Z",
  "customId": "ORDER-001",
  "amountReceived": 500.00,
  "notes": ""
}`;

  payOutWebhookExample = `{
  "type": "pay-out",
  "transactionId": "TXN-789012",
  "userId": "USR-789",
  "reference": "REF-456",
  "amount": 300.00,
  "status": "completed",
  "timestamp": "2024-01-15T14:00:00Z",
  "customId": "PAYOUT-001",
  "observation": ""
}`;

  payOutBulkWebhookExample = `{
  "type": "pay-outs",
  "totalTransactions": 3,
  "transactions": [
    {
      "transactionId": "TXN-001",
      "reference": "REF-001",
      "amount": 100.00,
      "status": "completed"
    },
    {
      "transactionId": "TXN-002",
      "reference": "REF-002",
      "amount": 250.00,
      "status": "paid"
    },
    {
      "transactionId": "TXN-003",
      "reference": "REF-003",
      "amount": 150.00,
      "status": "failed"
    }
  ]
}`;

  webhookVerifyNodeExample = `const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, timestamp, secretKey) {
  const message = timestamp + '.' + JSON.stringify(payload);
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('hex');

  return signature === expectedSignature;
}

// Uso en tu servidor
app.post('/su-ruta-webhook', (req, res) => {
  const signature = req.headers['x-javacash-signature'];
  const timestamp = req.headers['x-javacash-timestamp'];

  if (verifyWebhookSignature(req.body, signature, timestamp, secretKey)) {
    // Procesar el webhook
    console.log('Webhook verificado:', req.body);
    res.status(200).json({ received: true });
  } else {
    res.status(401).json({ error: 'Firma no válida' });
  }
});`;

  webhookVerifyPythonExample = `import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, timestamp, secret_key):
    message = f"{timestamp}.{json.dumps(payload)}"
    expected = hmac.new(
        secret_key.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)

# Uso con Flask
@app.route('/su-ruta-webhook', methods=['POST'])
def webhook_handler():
    signature = request.headers.get('X-JavaCash-Signature')
    timestamp = request.headers.get('X-JavaCash-Timestamp')

    if verify_webhook_signature(request.json, signature, timestamp, secret_key):
        # Procesar el webhook
        return jsonify({"received": True}), 200
    else:
        return jsonify({"error": "Firma no válida"}), 401`;

  webhookVerifyPhpExample = `<?php
function verifyWebhookSignature($payload, $signature, $timestamp, $secretKey) {
    $message = $timestamp . '.' . json_encode($payload);
    $expected = hash_hmac('sha256', $message, $secretKey);

    return hash_equals($expected, $signature);
}

// Uso en tu servidor
$payload = json_decode(file_get_contents('php://input'), true);
$signature = $_SERVER['HTTP_X_JAVACASH_SIGNATURE'] ?? '';
$timestamp = $_SERVER['HTTP_X_JAVACASH_TIMESTAMP'] ?? '';

if (verifyWebhookSignature($payload, $signature, $timestamp, $secretKey)) {
    // Procesar el webhook
    http_response_code(200);
    echo json_encode(["received" => true]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Firma no válida"]);
}`;
}
