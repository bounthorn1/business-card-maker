import React,{lazy,Suspense} from 'react';import {createRoot} from 'react-dom/client';import {BrowserRouter,Routes,Route} from 'react-router-dom';import './index.css';
const Pages=lazy(()=>import('./Pages.jsx')),Editor=lazy(()=>import('./Editor.jsx'));
createRoot(document.getElementById('root')).render(<BrowserRouter><Suspense fallback={<p className="p-8">Loading…</p>}><Routes>
<Route path="/editor" element={<Editor/>}/><Route path="/*" element={<Pages/>}/></Routes></Suspense></BrowserRouter>);
