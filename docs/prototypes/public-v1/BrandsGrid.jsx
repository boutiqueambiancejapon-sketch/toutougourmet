/* global React, Placeholder */
function BrandsGrid() {
  const brands = [
    {slug:'franklin', name:'Franklin Pet Food', tag:'Pionniers du mono-protéine en France depuis 2018', emoji:'🔥', type:'Croquettes', score:4.6, price:'€€', bg:'#FFF8F0', pill:'#FFE8B5', tone:'amber', variant:'food'},
    {slug:'elmut', name:'Elmut', tag:'Repas frais cuisinés maison, livrés chez toi', emoji:'🌿', type:'Repas frais', score:4.7, price:'€€€', bg:'#F0FFF8', pill:'#C2F0D5', tone:'green', variant:'food', featured:true},
    {slug:'pettywell', name:'Petty Well', tag:'Croquettes 100% françaises, formulées avec AgroParisTech', emoji:'⭐', type:'Croquettes', score:4.5, price:'€€', bg:'#F0F5FF', pill:'#C8DCFF', tone:'blue', variant:'food'},
    {slug:'dogchef', name:'Dog Chef', tag:'Repas frais sur-mesure, livrés à domicile', emoji:'👨‍🍳', type:'Repas frais', score:4.8, price:'€€€', bg:'#FFF0F5', pill:'#FFD6E3', tone:'rose', variant:'food'},
  ];
  return (
    <section id="marques" style={{padding:'96px 40px 64px',background:'#FAFAF8'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:32,marginBottom:40,flexWrap:'wrap'}}>
          <div>
            <p className="eyebrow" style={{margin:'0 0 10px'}}>Notre sélection</p>
            <h2 className="section-title" style={{margin:0}}>4 marques.<br/>Zéro bullshit.</h2>
          </div>
          <p style={{color:'#4A3728',maxWidth:360,fontSize:16,lineHeight:1.55,margin:0}}>On a filtré des dizaines de marques pour ne garder que celles qui valent <i>vraiment</i> le coup.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {brands.map(b => (
            <a key={b.slug} href="article.html" className="brand-card" style={{
              display:'flex',flexDirection:'column',
              borderRadius:24,border:`2px solid ${b.featured?'#E8622A':'#E2D5C8'}`,
              background:b.bg,textDecoration:'none',overflow:'hidden',position:'relative',
              transition:'transform 220ms var(--ease), box-shadow 220ms var(--ease), border-color 220ms var(--ease)',
            }}>
              {b.featured && (
                <span style={{position:'absolute',top:12,right:12,zIndex:2,fontSize:10,fontWeight:900,letterSpacing:'0.08em',padding:'4px 10px',borderRadius:9999,background:'#E8622A',color:'#fff',textTransform:'uppercase'}}>Coup de cœur</span>
              )}
              <div style={{height:128,position:'relative'}}>
                <Placeholder variant={b.variant} tone={b.tone} radius={0} label="Photo produit" style={{height:'100%'}} />
              </div>
              <div style={{padding:'20px 22px 12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <span style={{fontSize:26}}>{b.emoji}</span>
                  <span style={{fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:9999,background:b.pill,color:'#1A1109'}}>{b.type}</span>
                </div>
                <h3 style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:20,color:'#1A1109',margin:'0 0 6px',letterSpacing:'-0.01em'}}>{b.name}</h3>
                <p style={{fontSize:13,color:'#4A3728',lineHeight:1.55,margin:0}}>{b.tag}</p>
              </div>
              <div style={{padding:'0 22px 14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{flex:1,height:6,borderRadius:9999,background:'#E2D5C8',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${(b.score/5)*100}%`,background:'#E8622A',borderRadius:9999}} />
                  </div>
                  <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'#E8622A',fontSize:14}}>{b.score}/5</span>
                </div>
              </div>
              <div style={{marginTop:'auto',padding:'14px 22px',borderTop:'1px solid #E2D5C8',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(255,255,255,0.4)'}}>
                <span style={{fontSize:13,fontWeight:700,color:'#1A1109'}}>Voir la fiche →</span>
                <span style={{fontSize:11,fontWeight:700,padding:'2px 10px',borderRadius:9999,background:b.pill,color:'#4A3728',fontFamily:'var(--font-mono)'}}>{b.price}</span>
              </div>
            </a>
          ))}
        </div>
        <div style={{textAlign:'center',marginTop:40}}>
          <a href="#comparatif" className="btn-outline">Voir le comparateur complet →</a>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { BrandsGrid });
