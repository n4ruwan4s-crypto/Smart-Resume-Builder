// Netlify Serverless Function — PayHere Hash Generator
// Deployed automatically by Netlify at /.netlify/functions/get-hash
// DO NOT expose MERCHANT_SECRET in frontend code

const crypto = require('crypto');

const MERCHANT_ID     = '1235121';
const AMOUNT          = '100.00';
const CURRENCY        = 'LKR';
const MERCHANT_SECRET = 'MjU4NzE4NDc4NDE3NjYzMzc0MDExMTY0ODQyMzMwMTk0NTI0ODI4NQ==';

exports.handler = async (event) => {
  // Allow CORS for same-origin fetch from the site
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let order_id;
  try {
    const body = JSON.parse(event.body || '{}');
    order_id = body.order_id;
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!order_id) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'order_id required' }) };
  }

  // PayHere hash: MD5( merchant_id + order_id + amount + currency + MD5(secret).toUpperCase() )
  const secretHash = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();
  const rawHash    = `${MERCHANT_ID}${order_id}${AMOUNT}${CURRENCY}${secretHash}`;
  const hash       = crypto.createHash('md5').update(rawHash).digest('hex').toUpperCase();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ hash }),
  };
};
