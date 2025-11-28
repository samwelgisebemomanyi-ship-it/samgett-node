require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const checkoutRoutes = require('./routes/checkout');
const webhookRoutes = require('./routes/webhook');
const mpesaRoutes = require('./routes/mpesa');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/checkout', checkoutRoutes);
// note: webhook route expects raw body, it's mounted in the webhook file
app.use('/webhook', webhookRoutes);
app.use('/mpesa', mpesaRoutes);

app.get('/', (req,res)=> res.json({ok:true, service:'samgett-node'}));

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log('Samgett server listening on', port));
