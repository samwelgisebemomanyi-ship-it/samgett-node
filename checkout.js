const express = require('express');
const router = express.Router();
const pool = require('../db');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// create checkout session and create pending order in DB
router.post('/create-checkout', async (req,res)=>{
  const {items,email,userId} = req.body; // items: [{productId, qty}]
  if(!items || items.length===0) return res.status(400).json({error:'no items'});
  const ids = items.map(i=>i.productId);
  const placeholders = ids.map(()=>'?').join(',');
  const [products] = await pool.query(`SELECT id,title,price FROM products WHERE id IN (${placeholders})`, ids);
  const line_items = items.map(it=>{
    const p = products.find(x=>x.id===it.productId);
    return {price_data: {currency:'usd', product_data:{name:p.title}, unit_amount: Math.round(p.price*100)}, quantity: it.qty};
  });

  // calculate total for local order record
  const total = items.reduce((s,it)=>{
    const p = products.find(x=>x.id===it.productId);
    return s + (p.price * it.qty);
  },0);

  // create a pending order in DB to link later in webhook
  const conn = await pool.getConnection();
  try{
    await conn.beginTransaction();
    const [r] = await conn.query('INSERT INTO orders (user_id,total,currency,status) VALUES (?,?,?,?)',[userId || null, total, 'USD', 'pending']);
    const orderId = r.insertId;
    const insertItems = items.map(it => [orderId, it.productId, it.qty, products.find(p=>p.id===it.productId).price]);
    await conn.query('INSERT INTO order_items (order_id,product_id,qty,unit_price) VALUES ?',[insertItems]);
    await conn.commit();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
      customer_email: email,
      metadata: { order_id: orderId.toString() }
    });
    res.json({id:session.id, url: session.url});
  }catch(err){
    await conn.rollback();
    console.error(err);
    res.status(500).json({error:'server error'});
  }finally{
    conn.release();
  }
});

module.exports = router;
