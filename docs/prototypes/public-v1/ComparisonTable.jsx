/* global React */
const { useState: useStateCmp } = React;

function ComparisonTable() {
  const brands = [
    {slug:'franklin', name:'Franklin', emoji:'🔥', type:'Croquettes', score:4.6, price:'€€', digest:'Très bonne', origin:'France', recette:'Mono-protéine', essai:'Oui · -20%', pill:'#FFE8B5'},
    {slug:'elmut', name:'Elmut', emoji:'🌿', type:'Repas frais', score:4.7, price:'€€€', digest:'Excellente', origin:'France', recette:'Cuisine maison', essai:'Oui · -50% 1ère box', pill:'#C2F0D5', featured:true},
    {slug:'pettywell', name:'Petty Well', emoji:'⭐', type:'Croquettes', score:4.5, price:'€€', digest:'Très bonne', origin:'France', recette:'Formulée AgroParisTech', essai:'Oui · -30%', pill:'#C8DCFF'},
    {slug:'dogchef', name:'Dog Chef', emoji:'👨‍🍳', type:'Repas frais', score:4.8, price:'€€€', digest:'Excellente', origin:'Belgique', recette:'Sur-mesure', essai:'Oui · -35%', pill:'#FFD6E3'},
  ];
  const rows = [
    { key:'type', label:'Type' },
    { key:'score', label:'Note /5' },
    { key:'price', label:'Prix' },
    { key:'digest', label:'Digestibilité' },
    { key:'origin', label:'Origine' },
    { key:'recette', label:'Spécificité recette' },
    { key:'essai', label:'Offre d\'essai' },
  ];

  const [sortBy, setSortBy] = useStateCmp('score');
  const sorted = [...brands].sort((a,b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'price') return a.price.length - b.price.length;
    return 0;
  });

  return (
    <section id="comparatif" style={{padding:'96px 40px',background:'#F5F0EA'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:32,marginBottom:40,flexWrap:'wrap'}}>
          <div>
            <p className="eyebrow" style={{margin:'0 0 10px'}}>Le comparateur</p>
            <h2 className="section-title" style={{margin:0}}>Tout sur la table.<br/><span style={{background:'#FFD6E3',padding:'2px 14px 6px',borderRadius:12,display:'inline-block',lineHeight:1}}>Comparées en 10 s.</span></h2>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <span style={{fontSize:12,fontWeight:700,color:'#8A7264',textTransform:'uppercase',letterSpacing:'0.1em'}}>Trier :</span>
            {[['score','Note'],['price','Prix'],['default','Par défaut']].map(([k,l]) => (
              <button key={k} onClick={()=>setSortBy(k)}
                style={{
                  fontSize:13, fontWeight:600, padding:'7px 14px', borderRadius:9999,
                  border: sortBy===k ? '2px solid #1A1109' : '2px solid #E2D5C8',
                  background: sortBy===k ? '#1A1109' : '#fff',
                  color: sortBy===k ? '#F5EEE6' : '#4A3728',
                  cursor:'pointer', transition:'all 180ms var(--ease)',
                }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{background:'#fff',borderRadius:24,border:'1px solid #E2D5C8',overflow:'hidden',boxShadow:'0 4px 16px rgba(26,17,9,0.06)'}}>
          {/* Head */}
          <div style={{display:'grid',gridTemplateColumns:'200px repeat(4, 1fr)',borderBottom:'1px solid #E2D5C8'}}>
            <div style={{padding:'18px 20px',fontSize:12,fontWeight:700,color:'#8A7264',textTransform:'uppercase',letterSpacing:'0.1em',background:'#FAFAF8'}}>Critère</div>
            {sorted.map(b => (
              <div key={b.slug} style={{padding:'18px 18px',borderLeft:'1px solid #E2D5C8',position:'relative',background: b.featured ? 'rgba(232,98,42,0.04)' : '#fff'}}>
                {b.featured && <span style={{position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',fontSize:10,fontWeight:900,letterSpacing:'0.08em',padding:'3px 10px',borderRadius:'0 0 8px 8px',background:'#E8622A',color:'#fff',textTransform:'uppercase'}}>Top</span>}
                <div style={{display:'flex',alignItems:'center',gap:10,marginTop: b.featured ? 8 : 0}}>
                  <span style={{fontSize:22}}>{b.emoji}</span>
                  <div>
                    <p style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:17,color:'#1A1109',margin:0,lineHeight:1.1}}>{b.name}</p>
                    <p style={{fontSize:11,color:'#8A7264',margin:'2px 0 0',fontWeight:500}}>{b.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, rIdx) => (
            <div key={row.key} style={{display:'grid',gridTemplateColumns:'200px repeat(4, 1fr)',borderBottom: rIdx === rows.length-1 ? 'none' : '1px solid #F5F0EA'}}>
              <div style={{padding:'14px 20px',fontSize:13,fontWeight:600,color:'#4A3728',background:'#FAFAF8',display:'flex',alignItems:'center'}}>{row.label}</div>
              {sorted.map(b => {
                const v = b[row.key];
                return (
                  <div key={b.slug} style={{padding:'14px 18px',borderLeft:'1px solid #F5F0EA',fontSize:14,color:'#1A1109',background: b.featured ? 'rgba(232,98,42,0.04)' : 'transparent',display:'flex',alignItems:'center'}}>
                    {row.key === 'score' ? (
                      <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'#E8622A'}}>{v}/5</span>
                    ) : row.key === 'price' ? (
                      <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'#1A1109'}}>{v}</span>
                    ) : row.key === 'essai' ? (
                      <span style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:13}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:'#4CAF7D'}} /> {v}
                      </span>
                    ) : v}
                  </div>
                );
              })}
            </div>
          ))}

          {/* CTA row */}
          <div style={{display:'grid',gridTemplateColumns:'200px repeat(4, 1fr)',borderTop:'1px solid #E2D5C8',background:'#FAFAF8'}}>
            <div style={{padding:'16px 20px',fontSize:12,fontWeight:700,color:'#8A7264',textTransform:'uppercase',letterSpacing:'0.1em'}}>Action</div>
            {sorted.map(b => (
              <div key={b.slug} style={{padding:'16px 18px',borderLeft:'1px solid #E2D5C8'}}>
                <a href="article.html" className="btn-primary" style={{fontSize:13,padding:'8px 14px',width:'100%',justifyContent:'center'}}>Voir la fiche →</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { ComparisonTable });
