import {W,H} from './templates';
export default function Thumb({tp,side='front',cls=''}){
 return <div className={'relative overflow-hidden rounded-lg shadow-md ring-1 ring-black/5 '+cls} style={{aspectRatio:`${W}/${H}`,containerType:'inline-size',background:tp.bg}}>
 {tp[side].map((o,i)=>{const b={position:'absolute',left:o.left/W*100+'%',top:o.top/H*100+'%',opacity:o.opacity};
  if(o.t==='rect')return <div key={i} style={{...b,width:o.width/W*100+'%',height:o.height/H*100+'%',background:o.fill}}/>;
  if(o.t==='circle')return <div key={i} style={{...b,width:o.radius*2/W*100+'%',aspectRatio:'1',borderRadius:'50%',background:o.fill}}/>;
  return <div key={i} style={{...b,width:(o.width||W-200)/W*100+'%',fontSize:o.fontSize/W*100+'cqw',color:o.fill,fontWeight:o.fontWeight,textAlign:o.textAlign||'left',lineHeight:o.lineHeight||1.16,whiteSpace:'pre-wrap',fontFamily:'Kantumruy Pro,Inter,sans-serif'}}>{o.text}</div>})}</div>}
