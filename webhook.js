const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const pool = require('../db');

// Stripe requires the raw body to verify signature
router.post('/stripe', express.raw({type: 'application/json'}), async (req,res)=>{
  const sig = req.headers['stripe-signature'];
  let event;
  try{
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }catch(err){
    console.log('webhook signature error', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if(event.type === 'checkout.session.completed'){
    const session = event.data.object;
    const orderId = session.metadata && session.metadata.order_id ? parseInt(session.metadata.order_id) : null;
    try{
      if(orderId){
        // mark order paid and attach stripe session id
        await pool.query('UPDATE orders SET status=?, stripe_session_id=? WHERE id=?',['paid', session.id, orderId]);
        console.log('Order marked paid', orderId);
        // reduce stock for each order item
        const [items] = await pool.query('SELECT product_id, qty FROM order_items WHERE order_id=?',[orderId]);
        for(const it of items){
          await pool.query('UPDATE products SET stock = stock - ? WHERE id=?',[it.qty, it.product_id]);
        }
      }else{
        console.log('No order metadata found for session', session.id);
      }
    }catch(e){
      console.error('Error processing order after webhook', e);
    }
  }
  res.json({received:true});
});

module.exports = router;
