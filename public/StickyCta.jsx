/* global React */
const { useState: useStickyState } = React;

function StickyCta() {
  const [visible, setVisible] = useStickyState(true);
  if (!visible) return null;
  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:40,padding:'0 16px 16px',pointerEvents:'none'}}>
      <div style={{maxWidth:720,margin:'0 auto',background:'#1A1109',borderRadius:24,display:'flex',alignItems:'center',gap:14,padding:'14px 16px',boxShadow:'0 16px 56px rgba(26,17,9,0.30)',pointerEvents:'auto'}}>
        <span style={{background:'#FFD6E3',color:'#1A1109',fontSize:11,fontWeight:900,padding:'6px 10px',borderRadius:8,whiteSpace:'nowrap'}}>-35%</span>
        <p style={{flex:1,fontSize:13,color:'#F5EEE6',margin:0,lineHeight:1.3}}>
          <b style={{fontWeight:700}}>Dog Chef</b>
          <span style={{opacity:.6}}> — repas frais personnalisés · Code </span>
          <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'#FFD6E3'}}>MZU7090</span>
        </p>
        <a href="#" className="btn-primary" style={{fontSize:13,padding:'8px 14px'}}>J'en profite →</a>
        <button onClick={()=>setVisible(false)} aria-label="Fermer" style={{background:'none',border:'none',color:'#8A7264',fontSize:18,cursor:'pointer',padding:4}}>✕</button>
      </div>
    </div>
  );
}

Object.assign(window, { StickyCta });
