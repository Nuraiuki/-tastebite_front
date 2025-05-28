// src/api/client.js
export const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getJSON  = (url) => fetch(API + url).then(r => r.json());
export const postJSON = (url, body) =>
  fetch(API + url, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
  .then(r => r.json());
export const putJSON  = (url, body) =>
  fetch(API + url, {method:"PUT", headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
export const del      = (url) => fetch(API + url,{method:"DELETE"});
