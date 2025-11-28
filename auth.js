const jwt = require('jsonwebtoken');
require('dotenv').config();

function auth(req,res,next){
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({error:'no token'});
  const token = authHeader.split(' ')[1];
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){
    return res.status(401).json({error:'invalid token'});
  }
}

module.exports = auth;
