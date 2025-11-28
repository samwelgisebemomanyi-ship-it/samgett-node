const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// list
router.get('/', async (req,res)=>{
  const [rows] = await pool.query('SELECT id,sku,title,description,price,stock,image_url FROM products');
  res.json(rows);
});

// admin create product
router.post('/', auth, async (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({error:'forbidden'});
  const {sku,title,description,price,stock,image_url} = req.body;
  const [r] = await pool.query('INSERT INTO products (sku,title,description,price,stock,image_url) VALUES (?,?,?,?,?,?)',[sku,title,description,price,stock,image_url]);
  res.json({id:r.insertId});
});

module.exports = router;
