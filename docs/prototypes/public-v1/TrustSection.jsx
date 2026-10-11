/* global React */
function TrustSection() {
  const points = [
    {num:'0€', pillBg:'#FFD6E3', title:'de sponsoring', desc:"Aucune marque ne nous paie pour nos avis. On perçoit une commission uniquement si tu commandes."},
    {num:'100%', pillBg:'#C8DCFF', title:'honnête', desc:"On publie les points forts ET les points faibles de chaque marque. Si c'est trop cher, on le dit."},
    {num:'4/4', pillBg:'#C2F0D5', title:'marques analysées en détail', desc:"On a comparé des dizaines et retenu seulement 4. Critères : qualité, digestibilité, rapport qualité/prix."},
  ];
  return (
    <section style={{padding:'96px 40px',background:'#EEF4FF'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <p className="eyebrow" style={{margin:'0 0 10px',color:'#4E8EDB'}}>Pourquoi nous faire confiance ?</p>
          <h2 className="section-title" style={{margin:0}}>On est chiants. <span style={{color:'#4E8EDB'}}>C'est voulu.</span></h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          {points.map(p => (
            <div key={p.num} style={{background:'#fff',borderRadius:24,padding:32,border:'1px solid #E2D5C8'}}>
              <span style={{display:'inline-block',fontFamily:'var(--font-serif)',fontWeight:900,fontSize:48,padding:'4px 14px',borderRadius:12,background:p.pillBg,color:'#1A1109',marginBottom:16,lineHeight:1.05}}>{p.num}</span>
              <h3 style={{fontFamily:'var(--font-serif)',fontWeight:700,fontSize:20,color:'#1A1109',margin:'0 0 12px'}}>{p.title}</h3>
              <p style={{fontSize:15,color:'#4A3728',lineHeight:1.6,margin:0}}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { TrustSection });
