/* global React */
function Footer() {
  const groups = {
    'Les marques': ['Franklin Pet Food','Elmut','Petty Well','Dog Chef'],
    'Outils': ['Le quiz personnalisé','Comparateur','Calculateurs & Simulateurs','Le blog'],
    'Infos': ['À propos','Contact','Mentions légales','Politique de confidentialité'],
  };
  return (
    <footer style={{background:'#1A1109',color:'#fff',paddingTop:72}}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 40px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1.2fr repeat(3,1fr)',gap:40,paddingBottom:48}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,marginBottom:14,fontFamily:'var(--font-serif)',fontWeight:900,fontSize:22}}>
              <span style={{color:'#fff'}}>Toutou</span>
              <span style={{background:'#FFD6E3',color:'#1A1109',padding:'1px 8px 3px',borderRadius:6}}>Gourmet</span>
            </div>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.7)',lineHeight:1.6,margin:'0 0 14px',maxWidth:320}}>
              Le comparateur fun et honnête de la bouffe premium pour chiens et chats en France.
            </p>
            <p style={{fontSize:12,color:'rgba(255,255,255,0.4)',margin:0,maxWidth:320}}>
              Site indépendant monétisé par affiliation. <a href="#" style={{color:'inherit',textDecoration:'underline'}}>En savoir plus</a>
            </p>
          </div>
          {Object.entries(groups).map(([title, links]) => (
            <div key={title}>
              <h3 style={{fontFamily:'var(--font-sans)',fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 16px'}}>{title}</h3>
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:10}}>
                {links.map(l => (
                  <li key={l}><a href="#" style={{fontSize:14,color:'rgba(255,255,255,0.75)',textDecoration:'none'}}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.1)',padding:'24px 0',display:'flex',justifyContent:'space-between',fontSize:12,color:'rgba(255,255,255,0.4)',flexWrap:'wrap',gap:12}}>
          <p style={{margin:0}}>© 2026 Toutou Gourmet — Tous droits réservés</p>
          <p style={{margin:0}}>Les liens peuvent être affiliés. <a href="#" style={{color:'inherit',textDecoration:'underline'}}>Disclosure complète</a></p>
        </div>
      </div>
    </footer>
  );
}
Object.assign(window, { Footer });
