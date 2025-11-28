export async function apiGet(path, token){ 
  const res = await fetch('/api' + path, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
  return res.json();
}
export async function apiPost(path, body, token){
  const res = await fetch('/api' + path, { method:'POST', body: JSON.stringify(body), headers: {'Content-Type':'application/json', ...(token?{Authorization:'Bearer '+token}:{})}});
  return res.json();
}
