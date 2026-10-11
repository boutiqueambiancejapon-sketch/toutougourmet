/* global React, Placeholder */
function ArticlesGrid() {
  const articles = [
    {
      slug:'croquettes-vs-repas-frais',
      category:'Nutrition',
      title:'Croquettes vs repas frais : on a fait le match.',
      excerpt:'Spoiler : les deux ont leurs lettres de noblesse. Mais le vrai choix se joue sur 3 critères auxquels tu n\'as pas pensé.',
      author:'Camille',
      date:'18 avril 2026',
      read:'8 min',
      tone:'rose',
      variant:'food',
      pill:'#FFD6E3',
      featured:true,
    },
    {
      slug:'barf-guide-debutant',
      category:'Alimentation',
      title:'BARF : le guide honnête pour débuter.',
      excerpt:'On t\'explique le principe, les bénéfices réels, et surtout les 4 pièges à éviter quand tu passes au cru.',
      author:'Marc',
      date:'12 avril 2026',
      read:'12 min',
      tone:'green',
      variant:'dog',
      pill:'#C2F0D5',
    },
    {
      slug:'body-condition-score',
      category:'Santé',
      title:'Le Body Condition Score en 2 minutes.',
      excerpt:'La méthode véto pour savoir si ton chien est trop maigre, au poids, ou en surpoids. Sans balance.',
      author:'Camille',
      date:'5 avril 2026',
      read:'5 min',
      tone:'blue',
      variant:'editorial',
      pill:'#C8DCFF',
    },
    {
      slug:'transition-alimentaire',
      category:'Nutrition',
      title:'Changer de croquettes sans dégâts digestifs.',
      excerpt:'Le protocole de transition en 7 jours qu\'on recommande. Plus un plan B si ton chien chouine déjà.',
      author:'Marc',
      date:'29 mars 2026',
      read:'6 min',
      tone:'amber',
      variant:'landscape',
      pill:'#FFE8B5',
    },
  ];

  const [featured, ...rest] = articles;

  return (
    <section id="blog" style={{padding:'96px 40px',background:'#EEF4FF'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:32,marginBottom:48,flexWrap:'wrap'}}>
          <div>
            <p className="eyebrow" style={{margin:'0 0 10px',color:'#4E8EDB'}}>Le blog</p>
            <h2 className="section-title" style={{margin:0}}>On écrit,<br/>tu apprends.</h2>
          </div>
          <a href="#" style={{fontSize:14,fontWeight:700,color:'#4E8EDB',textDecoration:'none',whiteSpace:'nowrap'}}>Tous les articles →</a>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:20,alignItems:'stretch'}}>
          {/* Featured article — large */}
          <a href="article.html" className="article-card-featured" style={{
            display:'flex',flexDirection:'column',
            borderRadius:28,overflow:'hidden',background:'#fff',border:'1px solid #E2D5C8',textDecoration:'none',
            transition:'transform 220ms var(--ease), box-shadow 220ms var(--ease)',
          }}>
            <div style={{position:'relative',height:320}}>
              <Placeholder variant={featured.variant} tone={featured.tone} radius={0} style={{height:'100%'}} />
              <span style={{position:'absolute',top:16,left:16,fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:9999,background:featured.pill,color:'#1A1109',textTransform:'uppercase',letterSpacing:'0.08em'}}>{featured.category}</span>
              <span style={{position:'absolute',top:16,right:16,fontSize:10,fontWeight:900,padding:'5px 12px',borderRadius:9999,background:'#1A1109',color:'#F5EEE6',textTransform:'uppercase',letterSpacing:'0.08em'}}>À la une</span>
            </div>
            <div style={{padding:'28px 32px 32px',display:'flex',flexDirection:'column',gap:14,flex:1}}>
              <h3 style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:'clamp(1.5rem, 2.5vw, 2rem)',color:'#1A1109',margin:0,lineHeight:1.15,letterSpacing:'-0.02em'}}>{featured.title}</h3>
              <p style={{fontSize:16,color:'#4A3728',lineHeight:1.6,margin:0}}>{featured.excerpt}</p>
              <div style={{display:'flex',alignItems:'center',gap:12,marginTop:'auto',paddingTop:12,fontSize:13,color:'#8A7264'}}>
                <span style={{width:28,height:28,borderRadius:'50%',background:'#FFD6E3',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#1A1109'}}>C</span>
                <span style={{fontWeight:600,color:'#1A1109'}}>{featured.author}</span>
                <span>·</span>
                <span>{featured.date}</span>
                <span>·</span>
                <span style={{fontFamily:'var(--font-mono)'}}>{featured.read}</span>
              </div>
            </div>
          </a>

          {/* Small articles stacked */}
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            {rest.map(a => (
              <a key={a.slug} href="article.html" className="article-card" style={{
                display:'grid',gridTemplateColumns:'140px 1fr',gap:0,
                borderRadius:20,overflow:'hidden',background:'#fff',border:'1px solid #E2D5C8',textDecoration:'none',
                transition:'transform 220ms var(--ease), box-shadow 220ms var(--ease)',
                flex:1,
              }}>
                <div style={{position:'relative'}}>
                  <Placeholder variant={a.variant} tone={a.tone} radius={0} style={{height:'100%'}} />
                </div>
                <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:6}}>
                  <span style={{fontSize:10,fontWeight:700,color:'#8A7264',textTransform:'uppercase',letterSpacing:'0.1em'}}>{a.category}</span>
                  <h3 style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:18,color:'#1A1109',margin:0,lineHeight:1.2,letterSpacing:'-0.01em'}}>{a.title}</h3>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginTop:'auto',paddingTop:8,fontSize:12,color:'#8A7264'}}>
                    <span>{a.date}</span>
                    <span>·</span>
                    <span style={{fontFamily:'var(--font-mono)'}}>{a.read}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { ArticlesGrid });
