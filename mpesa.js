/**
 * Minimal Safaricom Daraja (MPesa) STK Push endpoints (server-side).
 * NOTE: You must register with Safaricom and obtain credentials for production.
 * This implementation is illustrative and uses axios.
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortcode = process.env.MPESA_SHORTCODE;
const passkey = process.env.MPESA_PASSKEY;
const callbackUrl = process.env.MPESA_CALLBACK_URL || `${process.env.BASE_URL}/mpesa/callback`;

// obtain oauth token
async function getToken(){
  const auth = Buffer.from(consumerKey + ':' + consumerSecret).toString('base64');
  const r = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',{
    headers:{ Authorization: `Basic ${auth}`}
  });
  return r.data.access_token;
}

// STK push
router.post('/stk', async (req,res)=>{
  const {phone, amount, accountReference, description} = req.body;
  try{
    const token = await getToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g,'').slice(0,14); // YYYYMMDDHHMMSS
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');
    const body = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || 'Samgett',
      TransactionDesc: description || 'Payment'
    };
    const resp = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', body, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(resp.data);
  }catch(err){
    console.error('MPesa STK error', err.response && err.response.data ? err.response.data : err.message);
    res.status(500).json({error:'mpesa error'});
  }
});

// mpesa callback endpoint - capture result
router.post('/callback', express.json(), async (req,res)=>{
  // Save the callback payload to DB or process payment result
  console.log('MPesa callback received', JSON.stringify(req.body).slice(0,200));
  // respond with 200 to Safaricom
  res.json({ResultCode:0, ResultDesc: 'Accepted'});
});

module.exports = router;
