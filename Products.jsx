import React, {useEffect, useState} from 'react';
import { apiGet } from '../api';

export default function Products(){
  const [items,setItems] = useState([]);
  useEffect(()=>{ apiGet('/products').then(setItems) },[]);
  return (
    <div>
      <h2>Products</h2>
      <ul>{items.map(p=> <li key={p.id}>{p.title} - ${p.price}</li>)}</ul>
    </div>
  );
}
