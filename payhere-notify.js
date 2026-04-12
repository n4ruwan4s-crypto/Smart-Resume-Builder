// Netlify Function — PayHere Payment Notification Handler
// PayHere calls this URL after every payment to confirm status
// You can use this to unlock downloads, log payments, send emails etc.

const crypto = require('crypto');

const MERCHANT_SECRET = 'MjU4NzE4NDc4NDE3NjYzMzc0MDExMTY0ODQyMzMwMTk0NTI0ODI4NQ==';

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'text/plain' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method not allowed' };
  }

  // Parse form-encoded body from PayHere
  const params = new URLSearchParams(event.body || '');
  const merchant_id      = params.get('merchant_id');
  const order_id         = params.get('order_id');
  const payment_id       = params.get('payment_id');
  const payhere_amount   = params.get('payhere_amount');
  const payhere_currency = params.get('payhere_currency');
  const status_code      = params.get('status_code');
  const md5sig           = params.get('md5sig');

  // Verify signature
  const secretHash   = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();
  const localMd5     = crypto.createHash('md5')
    .update(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`)
    .digest('hex').toUpperCase();

  if (localMd5 !== md5sig) {
    console.error('PayHere signature mismatch for order:', order_id);
    return { statusCode: 400, headers, body: 'Signature mismatch' };
  }

  // status_code 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargedback
  if (status_code === '2') {
    console.log(`✅ Payment confirmed — Order: ${order_id}, Payment: ${payment_id}, Amount: ${payhere_amount} ${payhere_currency}`);
    // TODO: Save to database, send confirmation email, etc.
  } else {
    console.log(`⚠️ Payment status ${status_code} for order ${order_id}`);
  }

  return { statusCode: 200, headers, body: 'OK' };
};
