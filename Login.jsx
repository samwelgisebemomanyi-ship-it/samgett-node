import React, {useState} from 'react';
import { apiPost } from '../api';

export default function Login({onLogin}){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const submit = async e=>{
    e.preventDefault();
    const r = await apiPost('/auth/login', {email,password});
    if(r.token) onLogin(r.token);
  };
  return (
    <form onSubmit={submit}>
      <h2>Admin Login</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder='email' />
      <input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='password' />
      <button>Login</button>
    </form>
  );
}
