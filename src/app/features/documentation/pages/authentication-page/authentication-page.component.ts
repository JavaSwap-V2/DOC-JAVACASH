import { Component, ViewEncapsulation } from '@angular/core';
import { COUNTRIES, COUNTRY_LIST, SANDBOX } from '@core/models/api.models';

/** Quita el protocolo para mostrar solo el host en los enlaces. */
const host = (url: string) => url.replace(/^https?:\/\//, '');

@Component({
  selector: 'app-authentication-page',
  templateUrl: './authentication-page.component.html',
  styleUrls: ['./authentication-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthenticationPageComponent {
  readonly countries = COUNTRY_LIST.map(country => ({
    ...country,
    dashboardHost: host(country.dashboardUrl)
  }));

  readonly sandbox = {
    ...SANDBOX,
    dashboardHost: host(SANDBOX.dashboardUrl)
  };

  /** País por defecto de los ejemplos de código de esta página. */
  readonly defaultCountry = COUNTRIES.ARG;

  apiKeyExample = `4f3c1a9b7e2d5806af14bc39d07e6a52`;

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
  "customId": "1001",
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
  "customId": "2001",
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

  // Webhooks capturados en Sandbox; la firma está recalculada con apiKeyExample
  signaturePayInCaptureExample = `POST /su-ruta-webhook HTTP/1.1
Content-Type: application/json
Content-Length: 168
X-JavaCash-Signature: fdb00b8cca9f967c0cf991756d893a7bfb0c5badacc0efd5e5bbc078cfd89afa
X-JavaCash-Timestamp: 2026-09-16T15:36:48.411Z

{"type":"pay-in","transactionId":149,"userId":3,"amount":"120.00","status":"pending","timestamp":"2026-09-16T15:36:48.411Z","customId":"20260917","amountReceived":null}`;

  signaturePayOutCaptureExample = `POST /su-ruta-webhook HTTP/1.1
Content-Type: application/json
Content-Length: 146
X-JavaCash-Signature: 27f229dc4a38e81819f491c679337dfe4b09dc6c7899cda28a85989340384379
X-JavaCash-Timestamp: 2026-09-16T15:29:08.774Z

{"type":"pay-out","transactionId":148,"userId":3,"amount":"15.00","status":"pending","timestamp":"2026-09-16T15:29:08.774Z","customId":"20260916"}`;

  signatureOpensslExample = `API_KEY='4f3c1a9b7e2d5806af14bc39d07e6a52'

# PayIn -> fdb00b8cca9f967c0cf991756d893a7bfb0c5badacc0efd5e5bbc078cfd89afa
printf '%s' '{"type":"pay-in","transactionId":149,"userId":3,"amount":"120.00","status":"pending","timestamp":"2026-09-16T15:36:48.411Z","customId":"20260917","amountReceived":null}' \\
  | openssl dgst -sha256 -hmac "$API_KEY"

# PayOut -> 27f229dc4a38e81819f491c679337dfe4b09dc6c7899cda28a85989340384379
printf '%s' '{"type":"pay-out","transactionId":148,"userId":3,"amount":"15.00","status":"pending","timestamp":"2026-09-16T15:29:08.774Z","customId":"20260916"}' \\
  | openssl dgst -sha256 -hmac "$API_KEY"`;

  webhookVerifyNodeExample = `const crypto = require('crypto');
const express = require('express');

const app = express();
const apiKey = process.env.JAVACASH_API_KEY;

function verifyWebhookSignature(rawBody, signature, apiKey) {
  if (typeof signature !== 'string') return false;

  const expected = crypto
    .createHmac('sha256', apiKey)
    .update(rawBody)
    .digest('hex');

  const received = Buffer.from(signature, 'utf8');
  const computed = Buffer.from(expected, 'utf8');
  return received.length === computed.length && crypto.timingSafeEqual(received, computed);
}

// express.raw entrega el body sin parsear (Buffer) para calcular la firma
app.post('/su-ruta-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-javacash-signature'];

  if (!verifyWebhookSignature(req.body, signature, apiKey)) {
    return res.status(401).json({ error: 'Firma no válida' });
  }

  const event = JSON.parse(req.body.toString('utf8'));
  // Procesar el webhook (event.type: 'pay-in' | 'pay-out' | 'pay-outs')
  res.status(200).json({ received: true });
});`;

  webhookVerifyPythonExample = `import hashlib
import hmac
import json
import os

from flask import Flask, jsonify, request

app = Flask(__name__)
API_KEY = os.environ['JAVACASH_API_KEY']

def verify_webhook_signature(raw_body, signature, api_key):
    if not signature:
        return False

    expected = hmac.new(
        api_key.encode(),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)

@app.route('/su-ruta-webhook', methods=['POST'])
def webhook_handler():
    raw_body = request.get_data()  # bytes sin parsear
    signature = request.headers.get('X-JavaCash-Signature')

    if not verify_webhook_signature(raw_body, signature, API_KEY):
        return jsonify({"error": "Firma no válida"}), 401

    event = json.loads(raw_body)
    # Procesar el webhook
    return jsonify({"received": True}), 200`;

  webhookVerifyPhpExample = `<?php
function verifyWebhookSignature($rawBody, $signature, $apiKey) {
    if ($signature === '') {
        return false;
    }

    $expected = hash_hmac('sha256', $rawBody, $apiKey);

    return hash_equals($expected, $signature);
}

// Uso en tu servidor
$apiKey = getenv('JAVACASH_API_KEY');
$rawBody = file_get_contents('php://input');   // body sin parsear
$signature = $_SERVER['HTTP_X_JAVACASH_SIGNATURE'] ?? '';

if (!verifyWebhookSignature($rawBody, $signature, $apiKey)) {
    http_response_code(401);
    echo json_encode(["error" => "Firma no válida"]);
    exit;
}

$event = json_decode($rawBody, true);
// Procesar el webhook
http_response_code(200);
echo json_encode(["received" => true]);`;
}
