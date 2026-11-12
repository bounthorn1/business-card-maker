const open=()=>new Promise((res,rej)=>{const q=indexedDB.open('bcm',1);q.onupgradeneeded=()=>q.result.createObjectStore('p',{keyPath:'id'});q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
const run=async(m,f)=>{const d=await open();return new Promise((res,rej)=>{const s=d.transaction('p',m).objectStore('p');const q=f(s);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})};
export const putP=p=>run('readwrite',s=>s.put({...p,v:1,updated:Date.now()}));
export const getP=id=>run('readonly',s=>s.get(id));
export const allP=()=>run('readonly',s=>s.getAll());
export const delP=id=>run('readwrite',s=>s.delete(id));
