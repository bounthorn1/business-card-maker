import {useEffect,useRef,useState,useCallback} from 'react';
import {useSearchParams,Link} from 'react-router-dom';
import {Canvas,StaticCanvas,ActiveSelection,Gradient,Shadow,Textbox,Rect,Circle,FabricImage} from 'fabric';
import QRCode from 'qrcode';import {jsPDF} from 'jspdf';
import {useI18n,useT} from './i18n';import Thumb from './Thumb';import {TEMPLATES,W,H} from './templates';import {putP,getP} from './db';
import {Type,Square,Circle as CI,ImagePlus,Undo2,Redo2,Save,Download,LayoutTemplate,PenLine,Shapes,Palette,QrCode,Plus,Copy,Trash2,Lock,Unlock,ArrowUp,ArrowDown,AlignHorizontalJustifyCenter as CH,AlignVerticalJustifyCenter as CV,ZoomIn,ZoomOut,Maximize,Bold,Italic,Underline,AlignLeft,AlignCenter,AlignRight,CreditCard} from 'lucide-react';
const FONTS=[['Khmer',['Kantumruy Pro','Battambang','Hanuman','Siemreap','Noto Sans Khmer','Content','Moul','Koulen','Bayon','Dangrek','Fasthand','Moulpali','Suwannaphum','Bokor','Angkor']],['English',['Inter','Poppins','Montserrat','Playfair Display','Roboto Slab','Oswald','Bebas Neue','Lobster','Pacifico','Dancing Script']]];
const SW=['#111111','#ffffff','#1f4fd8','#00a3ff','#0f766e','#16a34a','#f59e0b','#ef4444','#d946ef','#7c3aed','#c9a227','#64748b'];
const GR=[['#1f4fd8','#00d1ff'],['#111111','#c9a227'],['#ff5a5f','#ffd23f'],['#0f766e','#a7f3d0'],['#7c3aed','#f472b6'],['#0b1020','#334e68']];
const hex=c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)?c:'#000000';
const mk=s=>s.t==='text'?new Textbox(s.text,{fontFamily:'Kantumruy Pro',width:s.width||W-200,...s,t:undefined}):s.t==='circle'?new Circle({...s,t:undefined}):new Rect({...s,t:undefined});
const IB=({f,icon:I,l,on,dis})=><button title={l} aria-label={l} disabled={dis} onClick={f} className={'p-2 rounded-lg disabled:opacity-30 hover:bg-indigo-50 '+(on?'bg-indigo-100 text-indigo-700':'text-slate-600')}><I size={18}/></button>;
const TB=({f,icon:I,l})=><button title={l} aria-label={l} onClick={f} className="p-2 rounded-lg hover:bg-white/20"><I size={18}/></button>;
const Sec=({title,children})=><section className="py-3 border-b last:border-0"><h3 className="sec">{title}</h3>{children}</section>;
const Sw=({f})=><div className="flex flex-wrap gap-1.5 mt-2">{SW.map(c=><button key={c} aria-label={c} onClick={()=>f(c)} className="w-6 h-6 rounded-full ring-1 ring-black/10" style={{background:c}}/>)}</div>;
export default function Editor(){
 const t=useT(),{lang,set}=useI18n(),L=(a,b)=>lang==='km'?b:a,[sp]=useSearchParams(),el=useRef(),cv=useRef(),data=useRef({pages:[null]}),hist=useRef({u:[],r:[],lock:false}),clip=useRef(null),tm=useRef(),noth=useRef(false),pir=useRef(0),id=useRef(sp.get('id')||crypto.randomUUID()),
 [pi,setPi]=useState(0),[thumbs,setThumbs]=useState([]),[sel,setSel]=useState(null),[name,setName]=useState('Untitled'),[status,setStatus]=useState('saved'),[qr,setQr]=useState('https://example.com'),[qt,setQt]=useState('url'),[qc,setQc]=useState(['#000000','#ffffff']),[guides,setGuides]=useState(false),[tab,setTab]=useState('templates'),[zoom,setZoom]=useState(null),[menu,setMenu]=useState(false),[pop,setPop]=useState(null),[,tick]=useState(0),rf=()=>tick(n=>n+1);
 const C=()=>cv.current,cur=()=>JSON.stringify(C().toJSON()),act=()=>C().getActiveObjects();
 const fixFonts=()=>document.fonts.ready.then(()=>{C()?.getObjects().forEach(o=>o.initDimensions?.());C()?.renderAll()});
 const snap=()=>{const h=hist.current;if(h.lock)return;h.u.push(cur());if(h.u.length>60)h.u.shift();h.r=[];setStatus('unsaved');rf();clearTimeout(tm.current);tm.current=setTimeout(refreshThumbs,700)};
 const load=async j=>{const h=hist.current;h.lock=true;await C().loadFromJSON(j);C().renderAll();h.lock=false;h.u=[cur()];h.r=[];fixFonts();rf();refreshThumbs()};
 const build=async specs=>{const h=hist.current;h.lock=true;C().clear();specs.forEach(x=>C().add(mk(x)));C().renderAll();h.lock=false;h.u=[cur()];h.r=[];fixFonts();rf();refreshThumbs()};
 const setPage=n=>{pir.current=n;setPi(n)};
 const s2j=async specs=>{const sc=new StaticCanvas(document.createElement('canvas'),{width:W,height:H,backgroundColor:'#fff'});specs.forEach(x=>sc.add(mk(x)));const j=JSON.stringify(sc.toJSON());sc.dispose();return j};
 const th=async j=>{if(!j)return '';try{const sc=new StaticCanvas(document.createElement('canvas'),{width:W,height:H});await sc.loadFromJSON(j);sc.renderAll();const u=sc.toDataURL({format:'png',multiplier:.18});sc.dispose();return u}catch{return ''}};
 const refreshThumbs=async()=>{if(noth.current||!C())return;const P=data.current.pages;P[pir.current]=cur();const a=await Promise.all(P.map(th));data.current.t0=a[0];setThumbs(a)};

 useEffect(()=>{const c=new Canvas((()=>{const n=document.createElement('canvas');el.current.appendChild(n);return n})(),{width:W,height:H,backgroundColor:'#fff',preserveObjectStacking:true});cv.current=c;
  ['object:added','object:modified','object:removed'].forEach(n=>c.on(n,snap));
  const upd=()=>{setSel(c.getActiveObject()||null);rf()};['selection:created','selection:updated','selection:cleared'].forEach(n=>c.on(n,upd));
  (async()=>{try{const p=sp.get('id')&&await getP(sp.get('id'));
   if(p){setName(p.name);data.current={pages:p.pages||[p.front,p.back].filter(Boolean)};await load(data.current.pages[0])}
   else{const tp=TEMPLATES.find(x=>x.id===sp.get('tpl'));if(tp){setName(tp.name);data.current={pages:[null,await s2j(tp.back)]};await build(tp.front)}}
   setStatus('saved')}catch(e){console.error(e)}})();
  return()=>{c.dispose();if(el.current)el.current.innerHTML=''}},[]);
 const goPage=async n=>{if(n===pir.current)return;const P=data.current.pages;P[pir.current]=cur();setPage(n);C().discardActiveObject();if(P[n])await load(P[n]);else await build([])};
 const addPage=async()=>{const P=data.current.pages;P[pir.current]=cur();P.push(null);setPage(P.length-1);C().discardActiveObject();await build([])};
 const dupPage=async()=>{const P=data.current.pages;P[pir.current]=cur();P.splice(pir.current+1,0,P[pir.current]);setPage(pir.current+1);await load(P[pir.current])};
 const delPage=async()=>{const P=data.current.pages;if(P.length<2||!confirm(L('Delete this page?','លុបទំព័រនេះ?')))return;P.splice(pir.current,1);const n=Math.min(pir.current,P.length-1);setPage(n);await load(P[n])};

 const applyTpl=async tp=>{if(!confirm(L('Replace the current design with this template?','ជំនួសការរចនាបច្ចុប្បន្នដោយគំរូនេះ?')))return;setPage(0);data.current={pages:[null,await s2j(tp.back)]};setName(tp.name);await build(tp.front);setStatus('unsaved')};
 const save=useCallback(async()=>{setStatus('saving');try{data.current.pages[pir.current]=cur();await putP({id:id.current,name,pages:data.current.pages.map(j=>j||null),thumb:data.current.t0||''});setStatus('saved')}catch(e){setStatus('failed')}},[name]);
 const undo=async()=>{const h=hist.current;if(h.u.length<2)return;h.r.push(h.u.pop());h.lock=true;await C().loadFromJSON(h.u[h.u.length-1]);C().renderAll();h.lock=false;rf()};
 const redo=async()=>{const h=hist.current;if(!h.r.length)return;const j=h.r.pop();h.u.push(j);h.lock=true;await C().loadFromJSON(j);C().renderAll();h.lock=false;rf()};
 const add=o=>{C().add(o);C().setActiveObject(o);C().renderAll()};
 const del=()=>{act().forEach(o=>C().remove(o));C().discardActiveObject();C().renderAll()};
 const dup=async()=>{const o=C().getActiveObject();if(!o)return;const c=await o.clone();c.set({left:o.left+20,top:o.top+20});C().discardActiveObject();add(c)};
 const prop=(k,v)=>{act().forEach(o=>{o.set(k,v);o.initDimensions?.()});C().renderAll();snap()};
 const font=async f=>{try{await document.fonts.load(`16px "${f}"`,'កAa')}catch{}prop('fontFamily',f)};
 const ctr=ax=>{ax==='x'?sel.set('left',(W-sel.getScaledWidth())/2):sel.set('top',(H-sel.getScaledHeight())/2);sel.setCoords();C().renderAll();snap()};
 const lock=()=>{const v=!sel.lockMovementX;['lockMovementX','lockMovementY','lockRotation','lockScalingX','lockScalingY'].forEach(k=>sel.set(k,v));C().renderAll();rf()};
 const bg=v=>{const f=C().getObjects().find(o=>o.type==='rect'&&o.left===0&&o.top===0&&o.width>=W-1&&o.height>=H-1);if(f)f.set('fill',v);else C().backgroundColor=v;C().renderAll();snap()};
 const grad=(a,b)=>bg(new Gradient({type:'linear',coords:{x1:0,y1:0,x2:W,y2:H},colorStops:[{offset:0,color:a},{offset:1,color:b}]}));
 const addT=async(txt,size,bold,f='Kantumruy Pro')=>{try{await document.fonts.load(`16px "${f}"`,'កAa')}catch{}add(new Textbox(txt,{left:100,top:100,width:700,fontSize:size,fontWeight:bold?700:400,fontFamily:f,fill:'#111111'}))};
 const upload=f=>{if(!f)return;if(!['image/png','image/jpeg'].includes(f.type)||f.size>5e6){alert(t('bigfile'));return}const r=new FileReader();r.onload=async()=>{const im=await FabricImage.fromURL(r.result);im.scaleToWidth(300);add(im)};r.readAsDataURL(f)};
 const qrContent=()=>{const v=qr.trim();if(qt==='phone')return 'tel:'+v;if(qt==='email')return 'mailto:'+v;if(qt==='whatsapp')return 'https://wa.me/'+v.replace(/\D/g,'');if(qt==='vcard'){const [n,p,e,u]=v.split('|').map(x=>x.trim());return `BEGIN:VCARD\nVERSION:3.0\nFN:${n||''}\nTEL:${p||''}\nEMAIL:${e||''}\nURL:${u||''}\nEND:VCARD`}return v};
 const addQr=async()=>{if(!qr.trim()){alert(L('Enter QR content','បញ្ចូលមាតិកា QR'));return}const u=await QRCode.toDataURL(qrContent(),{width:900,margin:1,errorCorrectionLevel:'M',color:{dark:qc[0],light:qc[1]}});const im=await FabricImage.fromURL(u);im.scaleToWidth(220);im.set({left:W-300,top:H-300});add(im)};
 const png=async(fmt,only)=>{noth.current=true;await document.fonts.ready;const c=C(),h=hist.current,hs=[h.u,h.r],P=data.current.pages,was=pir.current;c.discardActiveObject();c.renderAll();P[was]=cur();const out=[];
  for(const i of(only!=null?[only]:P.map((_,i)=>i))){if(P[i])await load(P[i]);else await build([]);out.push(c.toDataURL({format:fmt==='jpg'?'jpeg':'png',quality:.95,multiplier:1}))}
  await load(P[was]);h.u=hs[0];h.r=hs[1];noth.current=false;refreshThumbs();return out};
 const dl=(u,n)=>{const a=document.createElement('a');a.href=u;a.download=n;a.click()};
 const exportImg=async f=>{const o=await png(f,pir.current);dl(o[0],`${name}-page${pir.current+1}.${f}`)};
 const exportPdf=async()=>{const o=await png('png');const p=new jsPDF({orientation:'landscape',unit:'mm',format:[90,54]});o.forEach((im,i)=>{if(i)p.addPage([90,54],'landscape');p.addImage(im,'PNG',0,0,90,54)});p.save(`${name}.pdf`)};
 const sheet=async()=>{const o=await png('png');const p=new jsPDF({unit:'mm',format:'a4'});const x0=15,y0=13.5;
  const pg=img=>{for(let r=0;r<5;r++)for(let c=0;c<2;c++)p.addImage(img,'PNG',x0+c*90,y0+r*54,90,54);p.setDrawColor(0);p.setLineWidth(.1);for(let i=0;i<=2;i++){const x=x0+i*90;p.line(x,y0-5,x,y0-1);p.line(x,y0+271,x,y0+275)}for(let i=0;i<=5;i++){const y=y0+i*54;p.line(x0-5,y,x0-1,y);p.line(x0+181,y,x0+185,y)}};
  o.forEach((im,i)=>{if(i)p.addPage('a4');pg(im)});p.save(`${name}-sheet.pdf`)};
 useEffect(()=>{const clipc=()=>act()[0]?.clone().then(c=>{clip.current=c});const k=e=>{const m=e.ctrlKey||e.metaKey;if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;const o=C().getActiveObject();if(o?.isEditing)return;
  if(m&&e.key==='z'){e.preventDefault();e.shiftKey?redo():undo()}else if(m&&e.key==='s'){e.preventDefault();save()}else if(m&&e.key==='d'){e.preventDefault();dup()}
  else if(m&&e.key==='a'){e.preventDefault();C().discardActiveObject();C().setActiveObject(new ActiveSelection(C().getObjects(),{canvas:C()}));C().renderAll()}
  else if(m&&e.key==='c')clipc();else if(m&&e.key==='v'){clip.current?.clone().then(c=>{c.set({left:c.left+20,top:c.top+20});clip.current=c;add(c)})}
  else if(e.key==='Delete'||e.key==='Backspace')del();else if(o&&e.key.startsWith('Arrow')){e.preventDefault();const d=e.shiftKey?10:1;if(e.key==='ArrowLeft')o.left-=d;if(e.key==='ArrowRight')o.left+=d;if(e.key==='ArrowUp')o.top-=d;if(e.key==='ArrowDown')o.top+=d;o.setCoords();C().renderAll()}};
  window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)});
 const texts=C()?C().getObjects().filter(o=>o.type==='textbox'):[];
 const isT=sel&&sel.type==='textbox',one=sel&&sel.type!=='activeselection';
 const TABS=[['edit',PenLine,L('Details','ព័ត៌មាន')],['templates',LayoutTemplate,t('templates')],['add',Shapes,t('add')],['bg',Palette,t('bg')]];
 const Num=({v,f,w='w-16'})=><input type="number" className={'btn '+w} value={Math.round(v)} onChange={e=>f(+e.target.value)}/>;
 const stT=status==='saved'?t('saved'):status==='saving'?t('saving'):status==='failed'?t('failed'):L('Unsaved','មិនទាន់រក្សាទុក');
const RAIL=[['edit',PenLine,L('Edit','កែ')],['templates',LayoutTemplate,t('templates')],['elements',Shapes,L('Elements','ធាតុ')],['text',Type,t('text')],['uploads',ImagePlus,L('Uploads','រូប')],['qr',QrCode,'QR'],['bg',Palette,t('bg')]];
 const PRE=[[L('Add a heading','បន្ថែមចំណងជើង'),64,1,'Kantumruy Pro'],[L('Add a subheading','បន្ថែមចំណងជើងរង'),40,1,'Poppins'],[L('Add body text','បន្ថែមអត្ថបទ'),28,0,'Inter'],['Elegant',56,0,'Playfair Display'],['Script',60,0,'Dancing Script'],['ក្បាលអក្សរ',50,0,'Moul']];
 const P=({k,children,w='w-72'})=>pop===k&&sel?<div className={'absolute left-3 top-full mt-1 z-30 bg-white rounded-xl shadow-xl border p-3 '+w}>{children}</div>:null;
 const Pb=({k,children})=><button className={'btn '+(pop===k?'pri':'')} onClick={()=>setPop(pop===k?null:k)}>{children}</button>;
 return <div className="h-screen flex flex-col bg-slate-200">
 <header className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 py-2 flex flex-wrap gap-2 items-center">
  <Link to="/dashboard" className="font-bold flex items-center gap-2 mr-2"><CreditCard size={20}/><span className="hidden sm:inline">{t('app')}</span></Link>
  <input className="bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-44" value={name} onChange={e=>setName(e.target.value)} aria-label={t('name')}/>
  <TB f={undo} icon={Undo2} l={t('undo')}/><TB f={redo} icon={Redo2} l={t('redo')}/><span className="text-xs text-white/80">{stT}</span>
  <div className="ml-auto flex items-center gap-2"><button className="bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1.5 text-sm" onClick={()=>set(lang==='en'?'km':'en')}>{lang==='en'?'ខ្មែរ':'EN'}</button>
   <button className="bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1" onClick={save}><Save size={15}/>{t('save')}</button>
   <div className="relative"><button className="bg-white text-violet-700 font-semibold rounded-lg px-4 py-1.5 text-sm flex items-center gap-1" onClick={()=>setMenu(!menu)}><Download size={15}/>{L('Download','ទាញយក')}</button>
    {menu&&<div className="absolute right-0 mt-1 w-64 bg-white text-slate-800 rounded-xl shadow-xl border p-1 z-40" onClick={()=>setMenu(false)}>
     {[[L('PNG image','រូប PNG'),()=>exportImg('png')],[L('JPG image','រូប JPG'),()=>exportImg('jpg')],[L('PDF · front + back (90×54 mm)','PDF មុខ+ក្រោយ (90×54 mm)'),exportPdf],[L('PDF · A4 sheet, 10 cards + crop marks','PDF A4 · ១០កាត + ស្លាកកាត់'),sheet]].map(([l,f])=><button key={l} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-violet-50" onClick={f}>{l}</button>)}</div>}</div></div></header>
 <div className="flex flex-1 min-h-0 flex-col md:flex-row">
  <div className="flex flex-col-reverse md:flex-row order-2 md:order-1 bg-white border-r max-h-[50vh] md:max-h-none">
   <nav className="flex md:flex-col overflow-auto md:w-[72px] border-t md:border-t-0 md:border-r bg-slate-50">{RAIL.map(([k,I,l])=><button key={k} onClick={()=>setTab(tab===k?null:k)} className={'flex-1 md:flex-none flex flex-col items-center gap-1 py-3 px-2 text-[11px] '+(tab===k?'bg-white text-violet-700 font-semibold md:border-l-2 border-violet-600':'text-slate-500 hover:bg-white')}><I size={20}/>{l}</button>)}</nav>
   {tab&&<div className="md:w-72 overflow-auto p-4">
   {tab==='edit'&&<><p className="text-sm text-slate-500 mb-3">{L('Type here to change the text on your card.','វាយនៅទីនេះដើម្បីកែអត្ថបទលើកាតរបស់អ្នក។')}</p>
    {!texts.length&&<p className="text-sm text-slate-400">{L('No text yet. Open the Text tab to add some.','មិនទាន់មានអត្ថបទ។ បើកផ្ទាំងអត្ថបទដើម្បីបន្ថែម។')}</p>}
    {texts.map((o,i)=><textarea key={i} rows={Math.min(4,o.text.split('\n').length)} className="btn w-full mb-2 block" style={{fontFamily:'Kantumruy Pro'}} value={o.text} onFocus={()=>{C().setActiveObject(o);C().renderAll()}} onChange={e=>{o.set('text',e.target.value);o.initDimensions();C().renderAll();rf()}} onBlur={snap}/>)}</>}
   {tab==='templates'&&<div className="grid grid-cols-2 gap-3">{TEMPLATES.map(x=><button key={x.id} title={x.name} onClick={()=>applyTpl(x)} className="text-left hover:-translate-y-0.5 transition"><Thumb tp={x}/><span className="text-xs text-slate-500">{x.name}</span></button>)}</div>}
   {tab==='elements'&&<div className="grid grid-cols-3 gap-2">
     <button className="tool" onClick={()=>add(new Rect({left:100,top:100,width:300,height:160,fill:'#1f4fd8'}))}><Square size={22}/>{t('rect')}</button>
     <button className="tool" onClick={()=>add(new Rect({left:100,top:100,width:300,height:160,rx:40,ry:40,fill:'#7c3aed'}))}><Square size={22} className="rounded"/>{L('Round','មូល')}</button>
     <button className="tool" onClick={()=>add(new Circle({left:100,top:100,radius:90,fill:'#ff5a5f'}))}><CI size={22}/>{t('circle')}</button>
     <button className="tool" onClick={()=>add(new Rect({left:100,top:100,width:400,height:5,fill:'#111111'}))}><span className="h-5 grid place-items-center"><i className="block w-6 h-0.5 bg-current"/></span>{L('Line','បន្ទាត់')}</button></div>}
   {tab==='text'&&<div className="space-y-2">{PRE.map(([l,sz,b,f])=><button key={l} className="btn w-full text-left py-3" style={{fontFamily:f,fontWeight:b?700:400,fontSize:Math.max(15,sz/3)}} onClick={()=>addT(l,sz,b,f)}>{l}</button>)}</div>}
   {tab==='uploads'&&<label className="block border-2 border-dashed rounded-xl p-6 text-center text-sm text-slate-500 cursor-pointer hover:bg-violet-50" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();upload(e.dataTransfer.files[0])}}><ImagePlus className="mx-auto mb-2" size={26}/>{L('Drop PNG/JPG here or click to upload','ទម្លាក់ PNG/JPG ឬចុចដើម្បីផ្ទុក')}<input type="file" accept="image/png,image/jpeg" hidden onChange={e=>{upload(e.target.files[0]);e.target.value=''}}/></label>}
   {tab==='qr'&&<div className="space-y-2"><select className="btn w-full" value={qt} onChange={e=>setQt(e.target.value)}>{['url','phone','email','whatsapp','vcard','text'].map(k=><option key={k}>{k}</option>)}</select>
     <input className="btn w-full" value={qr} placeholder={qt==='vcard'?'Name|Phone|Email|Website':''} onChange={e=>setQr(e.target.value)}/>
     <div className="flex items-center gap-2"><input type="color" value={qc[0]} onChange={e=>setQc([e.target.value,qc[1]])}/><input type="color" value={qc[1]} onChange={e=>setQc([qc[0],e.target.value])}/><button className="btn pri ml-auto" onClick={addQr}>+ QR</button></div></div>}
   {tab==='bg'&&<><Sec title={t('color')}><input type="color" onChange={e=>bg(e.target.value)}/><Sw f={bg}/></Sec>
    <Sec title={L('Gradient','ពណ៌ចម្រុះ')}><div className="flex flex-wrap gap-2">{GR.map(c=><button key={c[0]} aria-label="gradient" className="w-10 h-10 rounded-lg ring-1 ring-black/10" style={{background:`linear-gradient(135deg,${c[0]},${c[1]})`}} onClick={()=>grad(...c)}/>)}</div></Sec>
    <p className="text-xs text-slate-500 mt-3">{t('printNote')}</p></>}
   </div>}</div>
  <main className="flex-1 min-w-0 flex flex-col order-1 md:order-2" onClick={()=>setPop(null)}>
   <div className="relative bg-white border-b px-3 py-2 min-h-14" onClick={e=>e.stopPropagation()}><div className="flex flex-wrap items-center gap-2">{!sel?<span className="text-sm text-slate-500">{L('Click an item on the card to edit it · double-click text to type','ចុចលើធាតុលើកាតដើម្បីកែ · ចុចពីរដងលើអត្ថបទដើម្បីវាយ')}</span>:<>
    {isT&&<><button className="btn w-40 text-left truncate" style={{fontFamily:sel.fontFamily}} onClick={()=>setPop(pop==='font'?null:'font')}>{sel.fontFamily}</button>
     <div className="flex items-center border rounded-lg"><button className="px-2" onClick={()=>prop('fontSize',Math.max(6,sel.fontSize-2))}>−</button><input type="number" className="w-12 text-center text-sm outline-none" value={Math.round(sel.fontSize)} onChange={e=>prop('fontSize',Math.max(6,+e.target.value))}/><button className="px-2" onClick={()=>prop('fontSize',sel.fontSize+2)}>+</button></div></>}
    {typeof sel.fill==='string'&&<button title={t('color')} aria-label={t('color')} className="w-8 h-8 rounded-lg ring-2 ring-slate-300" style={{background:sel.fill}} onClick={()=>setPop(pop==='color'?null:'color')}/>}
    {isT&&<><IB icon={Bold} l="Bold" on={sel.fontWeight==700} f={()=>prop('fontWeight',sel.fontWeight==700?400:700)}/><IB icon={Italic} l="Italic" on={sel.fontStyle==='italic'} f={()=>prop('fontStyle',sel.fontStyle==='italic'?'normal':'italic')}/><IB icon={Underline} l="Underline" on={sel.underline} f={()=>prop('underline',!sel.underline)}/>
     {[['left',AlignLeft],['center',AlignCenter],['right',AlignRight]].map(([a,I])=><IB key={a} icon={I} l={a} on={sel.textAlign===a} f={()=>prop('textAlign',a)}/>)}<Pb k="space">{L('Spacing','គម្លាត')}</Pb></>}
    <Pb k="fx">{L('Effects','ឥទ្ធិពល')}</Pb><Pb k="pos">{L('Position','ទីតាំង')}</Pb>
    <div className="ml-auto flex"><IB f={dup} icon={Copy} l={t('dup')}/><IB f={del} icon={Trash2} l={t('del')}/><IB f={lock} icon={sel.lockMovementX?Lock:Unlock} l="Lock" on={sel.lockMovementX}/>
     <IB f={()=>{C().bringObjectForward(sel);C().renderAll();snap()}} icon={ArrowUp} l={t('fwd')}/><IB f={()=>{C().sendObjectBackwards(sel);C().renderAll();snap()}} icon={ArrowDown} l={t('bwd')}/><IB f={()=>ctr('x')} icon={CH} l="Center H"/><IB f={()=>ctr('y')} icon={CV} l="Center V"/></div></>}</div>
    <P k="font" w="w-72"><div className="max-h-72 overflow-auto">{FONTS.map(([g,l])=><div key={g}><div className="sec px-2 pt-2">{g}</div>{l.map(f=><button key={f} onClick={()=>{font(f);setPop(null)}} className={'block w-full text-left px-3 py-1.5 text-base hover:bg-violet-50 rounded '+(sel?.fontFamily===f?'bg-violet-100':'')} style={{fontFamily:f}}>{f} <span className="text-slate-400 text-sm">កខគ Abc</span></button>)}</div>)}</div></P>
    <P k="color" w="w-60"><input type="color" value={hex(sel?.fill)} onChange={e=>prop('fill',e.target.value)}/><Sw f={c=>prop('fill',c)}/></P>
    <P k="space" w="w-64"><label className="block text-xs">{L('Letter spacing','គម្លាតអក្សរ')}<input type="range" className="w-full" min="-50" max="500" value={sel?.charSpacing||0} onChange={e=>prop('charSpacing',+e.target.value)}/></label><label className="block text-xs mt-2">{L('Line height','កម្ពស់បន្ទាត់')}<input type="range" className="w-full" min=".8" max="2.5" step=".05" value={sel?.lineHeight||1} onChange={e=>prop('lineHeight',+e.target.value)}/></label></P>
    <P k="fx" w="w-64"><label className="block text-xs">{t('opacity')}<input type="range" className="w-full" min=".1" max="1" step=".05" value={sel?.opacity??1} onChange={e=>prop('opacity',+e.target.value)}/></label>
     <button className={'btn mt-2 '+(sel?.shadow?'pri':'')} onClick={()=>prop('shadow',sel.shadow?null:new Shadow({color:'rgba(0,0,0,.35)',blur:18,offsetX:6,offsetY:6}))}>{L('Shadow','ស្រមោល')}</button>
     {one&&!isT&&sel.type!=='image'&&<div className="flex items-center gap-2 mt-3 text-xs">{L('Border','ស៊ុម')}<input type="color" value={hex(sel.stroke)} onChange={e=>prop('stroke',e.target.value)}/><Num v={sel.strokeWidth||0} f={v=>prop('strokeWidth',Math.max(0,v))}/></div>}</P>
    <P k="pos" w="w-64"><div className="flex items-center gap-2 text-xs">X<Num v={sel?.left||0} f={v=>prop('left',v)}/>Y<Num v={sel?.top||0} f={v=>prop('top',v)}/></div><div className="flex items-center gap-2 text-xs mt-2">{L('Rotate','បង្វិល')}<Num v={sel?.angle||0} f={v=>prop('angle',v)}/>°</div></P></div>
   <div className="flex-1 overflow-auto p-6 flex justify-center items-start"><div className="relative shadow-2xl" style={zoom?{width:zoom*9,flexShrink:0}:{width:'100%',maxWidth:900}}>
    <style>{`.canvas-container{width:100%!important;height:auto!important}.canvas-container canvas{width:100%!important;height:auto!important}`}</style><div ref={el}/>
    {guides&&<div className="absolute pointer-events-none border border-dashed border-red-300/70" style={{inset:'5.56% 3.33%'}}/>}</div></div>
   <div className="bg-white border-t border-slate-100 px-3 py-2 flex items-center gap-3">
    <div className="flex gap-3 overflow-x-auto py-1 flex-1">{data.current.pages.map((_,i)=><div key={i} className="shrink-0 text-center"><button onClick={()=>goPage(i)} className={'block w-28 aspect-[90/54] rounded-lg overflow-hidden bg-slate-100 '+(pi===i?'ring-2 ring-violet-500':'ring-1 ring-slate-200 hover:ring-slate-300')}>{thumbs[i]&&<img src={thumbs[i]} alt="" className="w-full h-full object-cover"/>}</button><span className="text-[11px] text-slate-500">{L('Page','ទំព័រ')} {i+1}</span></div>)}
     <button onClick={addPage} title={L('Add page','បន្ថែមទំព័រ')} className="shrink-0 w-28 aspect-[90/54] rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:text-violet-600 hover:border-violet-400 grid place-items-center"><Plus size={22}/></button></div>
    <div className="flex items-center"><IB f={dupPage} icon={Copy} l={L('Duplicate page','ចម្លងទំព័រ')}/><IB f={delPage} icon={Trash2} l={L('Delete page','លុបទំព័រ')} dis={data.current.pages.length<2}/></div>
    <button className={'btn '+(guides?'pri':'')} onClick={()=>setGuides(!guides)}>{L('Safe area','ដែនសុវត្ថិភាព')}</button>
    <span className="hidden md:flex items-center gap-2"><ZoomOut size={16}/><input type="range" min="40" max="200" value={zoom||100} onChange={e=>setZoom(+e.target.value)}/><ZoomIn size={16}/><button className="btn" onClick={()=>setZoom(null)}><Maximize size={14}/></button></span></div></main>
 </div></div>}
