/* global React, Header, Footer, StickyCta, Placeholder */
const { useState: useStateB, useMemo: useMemoB } = React;

const CATEGORIES = [
  { slug:'all',         label:'Tout',         count: 47, tone:'cream', pill:'#F5F0EA', emoji:'📚' },
  { slug:'nutrition',   label:'Nutrition',    count: 14, tone:'amber', pill:'#FFE8B5', emoji:'🍖' },
  { slug:'sante',       label:'Santé',        count: 11, tone:'green', pill:'#C2F0D5', emoji:'💊' },
  { slug:'alimentation',label:'Alimentation', count:  9, tone:'rose',  pill:'#FFD6E3', emoji:'🥩' },
  { slug:'comportement',label:'Comportement', count:  6, tone:'blue',  pill:'#C8DCFF', emoji:'🐾' },
  { slug:'enquetes',    label:'Enquêtes',     count:  4, tone:'amber', pill:'#FFE8B5', emoji:'🔍' },
  { slug:'races',       label:'Par race',     count:  3, tone:'rose',  pill:'#FFD6E3', emoji:'🦴' },
];

const POSTS = [
  { slug:'malinois', cat:'races', category:'Par race',
    title:'Quelle nourriture pour un Berger Belge Malinois ?',
    excerpt:"Besoins caloriques, protéines, santé articulaire, prévention du SDTV. Le guide complet pour une race de travail.",
    author:'Camille', date:'23 avr. 2026', read:'11 min', tone:'amber', variant:'dog', pill:'#FFE8B5',
    featured:true, hero:true },
  { slug:'croquettes-vs-frais', cat:'nutrition', category:'Nutrition',
    title:'Croquettes vs repas frais : on a fait le match.',
    excerpt:"Spoiler : les deux ont leurs lettres de noblesse. Mais le vrai choix se joue sur 3 critères auxquels tu n'as pas pensé.",
    author:'Camille', date:'18 avr. 2026', read:'8 min', tone:'rose', variant:'food', pill:'#FFD6E3' },
  { slug:'barf', cat:'alimentation', category:'Alimentation',
    title:'BARF : le guide honnête pour débuter.',
    excerpt:"Le principe, les bénéfices réels, et surtout les 4 pièges à éviter quand tu passes au cru.",
    author:'Marc', date:'12 avr. 2026', read:'12 min', tone:'green', variant:'food', pill:'#C2F0D5' },
  { slug:'bcs', cat:'sante', category:'Santé',
    title:'Le Body Condition Score en 2 minutes.',
    excerpt:"La méthode véto pour savoir si ton chien est trop maigre, au poids, ou en surpoids. Sans balance.",
    author:'Camille', date:'5 avr. 2026', read:'5 min', tone:'blue', variant:'editorial', pill:'#C8DCFF' },
  { slug:'transition', cat:'nutrition', category:'Nutrition',
    title:'Changer de croquettes sans dégâts digestifs.',
    excerpt:"Le protocole de transition en 7 jours qu'on recommande. Plus un plan B si ton chien chouine déjà.",
    author:'Marc', date:'29 mars 2026', read:'6 min', tone:'amber', variant:'landscape', pill:'#FFE8B5' },
  { slug:'omega3', cat:'sante', category:'Santé',
    title:'Oméga-3 chez le chien : combien, lesquels, pourquoi.',
    excerpt:"EPA, DHA, huile de saumon vs krill vs végétal. On démêle le marketing de la science.",
    author:'Camille', date:'24 mars 2026', read:'7 min', tone:'green', variant:'editorial', pill:'#C2F0D5' },
  { slug:'anxiete-repas', cat:'comportement', category:'Comportement',
    title:'Pourquoi ton chien engloutit ses croquettes en 12 secondes.',
    excerpt:"Gamelle anti-glouton, tapis de léchage, fractionnement : ce qui marche vraiment, et ce qui ne change rien.",
    author:'Marc', date:'19 mars 2026', read:'6 min', tone:'rose', variant:'dog', pill:'#FFD6E3' },
  { slug:'enquete-labels', cat:'enquetes', category:'Enquêtes',
    title:'Les labels « premium » : ce qu\'ils veulent dire vraiment.',
    excerpt:"On a lu les fiches techniques de 23 marques « premium ». 9 sur 23 affichent une composition qui justifie le prix.",
    author:'Camille', date:'14 mars 2026', read:'10 min', tone:'amber', variant:'landscape', pill:'#FFE8B5' },
  { slug:'senior', cat:'alimentation', category:'Alimentation',
    title:'Chien senior : quand changer d\'alimentation ?',
    excerpt:"L'âge n'est pas le bon critère. 3 signaux concrets qui justifient la bascule, et ceux qui sont des fausses alertes.",
    author:'Marc', date:'8 mars 2026', read:'7 min', tone:'blue', variant:'editorial', pill:'#C8DCFF' },
  { slug:'allergies', cat:'sante', category:'Santé',
    title:'Allergies alimentaires : diagnostic, régime d\'éviction, vérités.',
    excerpt:"Moins de 10 % des « allergies » diagnostiquées en sont vraiment. Le reste, ce sont des intolérances ou du marketing.",
    author:'Camille', date:'3 mars 2026', read:'9 min', tone:'green', variant:'dog', pill:'#C2F0D5' },
];

const AUTHORS = [
  { initial:'C', name:'Camille', role:'Nutrition & santé', bio:'Ingé agro (AgroParisTech). 12 ans chez un véto nutritionniste avant Toutou Gourmet.', count:18, pill:'#FFD6E3' },
  { initial:'M', name:'Marc',    role:'Enquêtes & comportement', bio:'Ancien journaliste food. 2 chiens (un Berger Australien, un bâtard de refuge).', count:29, pill:'#C8DCFF' },
];

function CategoryChip({ cat, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex',alignItems:'center',gap:8,
      padding:'8px 14px',borderRadius:9999,cursor:'pointer',
      border: active ? '2px solid #1A1109' : '2px solid #E2D5C8',
      background: active ? '#1A1109' : '#fff',
      color: active ? '#F5EEE6' : '#4A3728',
      fontSize:13,fontWeight:600,
      transition:'all 180ms var(--ease)',
      whiteSpace:'nowrap',
    }}>
      <span>{cat.emoji}</span>
      {cat.label}
      <span style={{
        fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,
        padding:'2px 8px',borderRadius:9999,
        background: active ? 'rgba(245,238,230,0.15)' : cat.pill,
        color: active ? '#F5EEE6' : '#1A1109',
      }}>{cat.count}</span>
    </button>
  );
}

function PostCard({ p, size = 'md' }) {
  const h = size === 'lg' ? 260 : size === 'sm' ? 140 : 180;
  return (
    <a href="article.html" className="article-card" style={{
      display:'flex',flexDirection:'column',
      borderRadius:20,overflow:'hidden',background:'#fff',
      border:'1px solid #E2D5C8',textDecoration:'none',
      transition:'transform 220ms var(--ease), box-shadow 220ms var(--ease)',
      height:'100%',
    }}>
      <div style={{position:'relative',height:h,flexShrink:0}}>
        <Placeholder variant={p.variant} tone={p.tone} radius={0} style={{height:'100%'}} />
        <span style={{position:'absolute',top:12,left:12,fontSize:10,fontWeight:700,padding:'4px 10px',borderRadius:9999,background:p.pill,color:'#1A1109',textTransform:'uppercase',letterSpacing:'0.08em',whiteSpace:'nowrap'}}>{p.category}</span>
      </div>
      <div style={{padding:'18px 22px 22px',display:'flex',flexDirection:'column',gap:10,flex:1}}>
        <h3 style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize: size === 'lg' ? 24 : 18,color:'#1A1109',margin:0,lineHeight:1.2,letterSpacing:'-0.01em'}}>{p.title}</h3>
        <p style={{fontSize:14,color:'#4A3728',lineHeight:1.6,margin:0}}>{p.excerpt}</p>
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:'auto',paddingTop:8,fontSize:12,color:'#8A7264',flexWrap:'wrap'}}>
          <span style={{fontWeight:600,color:'#1A1109',whiteSpace:'nowrap'}}>{p.author}</span>
          <span>·</span>
          <span style={{whiteSpace:'nowrap'}}>{p.date}</span>
          <span>·</span>
          <span style={{fontFamily:'var(--font-mono)',whiteSpace:'nowrap'}}>{p.read}</span>
        </div>
      </div>
    </a>
  );
}

function BlogHero() {
  return (
    <section style={{position:'relative',background:'#FAFAF8',overflow:'hidden'}}>
      <div aria-hidden style={{position:'absolute',top:-60,right:'10%',width:320,height:320,borderRadius:'50%',background:'#FFD6E3',opacity:.35,filter:'blur(90px)'}} />
      <div aria-hidden style={{position:'absolute',top:40,left:'-4%',width:260,height:260,borderRadius:'50%',background:'#C8DCFF',opacity:.3,filter:'blur(80px)'}} />
      <div style={{position:'relative',maxWidth:1280,margin:'0 auto',padding:'80px 40px 40px'}}>
        <nav aria-label="Fil d'Ariane" style={{fontSize:13,color:'#8A7264',marginBottom:20,display:'flex',gap:6,alignItems:'center'}}>
          <a href="index.html" style={{color:'#8A7264',textDecoration:'none'}}>Accueil</a>
          <span style={{opacity:.5}}>›</span>
          <span style={{color:'#4A3728'}}>Blog</span>
        </nav>
        <span className="eyebrow" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:9999,background:'#fff',border:'1px solid #E2D5C8',color:'#4E8EDB',marginBottom:20,whiteSpace:'nowrap',boxShadow:'0 1px 3px rgba(26,17,9,0.06)'}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#4E8EDB'}} />
          Le blog · 47 articles
        </span>
        <h1 style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:'clamp(2.5rem, 6vw, 4.75rem)',color:'#1A1109',margin:'0 0 20px',lineHeight:1,letterSpacing:'-0.03em',textWrap:'balance',maxWidth:900}}>
          On écrit. <span style={{background:'#FFD6E3',padding:'2px 16px 8px',borderRadius:14,display:'inline-block',lineHeight:1}}>Tu apprends.</span> <br/>Personne ne paie pour ça.
        </h1>
        <p style={{color:'#4A3728',fontSize:19,lineHeight:1.55,maxWidth:680,margin:0}}>
          Nutrition, santé, comportement, enquêtes. Des guides qu'on écrit nous-mêmes, sans sponsoring ni langue de bois. Tu cherches ? Utilise les filtres ou la recherche ci-dessous.
        </p>
      </div>
    </section>
  );
}

function SearchAndFilters({ query, onQuery, activeCat, onCat, sort, onSort }) {
  return (
    <section style={{background:'#FAFAF8',padding:'16px 40px 8px',borderTop:'1px solid #E2D5C8',position:'sticky',top:68,zIndex:20,backdropFilter:'blur(10px)'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',paddingBottom:14}}>
          <label style={{position:'relative',flex:'1 1 280px',minWidth:240,maxWidth:420}}>
            <span aria-hidden style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'#8A7264'}}>🔍</span>
            <input
              type="search"
              value={query}
              onChange={e=>onQuery(e.target.value)}
              placeholder="Chercher un article, un sujet, une race…"
              style={{
                width:'100%',padding:'11px 14px 11px 38px',
                borderRadius:9999,border:'1px solid #E2D5C8',
                background:'#fff',fontFamily:'var(--font-sans)',fontSize:14,color:'#1A1109',
                outline:'none',
              }}
              onFocus={e=>e.currentTarget.style.borderColor='#E8622A'}
              onBlur={e=>e.currentTarget.style.borderColor='#E2D5C8'}
            />
          </label>
          <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto'}}>
            <span style={{fontSize:12,fontWeight:700,color:'#8A7264',textTransform:'uppercase',letterSpacing:'0.1em'}}>Trier</span>
            {[['recent','Récent'],['popular','Populaire'],['long','Plus longs']].map(([k,l]) => (
              <button key={k} onClick={()=>onSort(k)} style={{
                fontSize:12,fontWeight:600,padding:'6px 12px',borderRadius:9999,
                border: sort===k?'2px solid #1A1109':'2px solid #E2D5C8',
                background: sort===k?'#1A1109':'#fff',
                color: sort===k?'#F5EEE6':'#4A3728',
                cursor:'pointer',transition:'all 180ms var(--ease)',
              }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingBottom:14}}>
          {CATEGORIES.map(c => (
            <CategoryChip key={c.slug} cat={c} active={activeCat===c.slug} onClick={()=>onCat(c.slug)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedBlock({ post }) {
  return (
    <a href="article.html" style={{
      display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:0,
      borderRadius:28,overflow:'hidden',background:'#fff',border:'1px solid #E2D5C8',textDecoration:'none',
      marginBottom:56,
    }} data-featured>
      <div style={{position:'relative',minHeight:380}}>
        <Placeholder variant={post.variant} tone={post.tone} radius={0} style={{height:'100%',position:'absolute',inset:0}} />
        <span style={{position:'absolute',top:20,left:20,fontSize:10,fontWeight:900,padding:'5px 12px',borderRadius:9999,background:'#1A1109',color:'#F5EEE6',textTransform:'uppercase',letterSpacing:'0.08em',whiteSpace:'nowrap'}}>À la une</span>
      </div>
      <div style={{padding:'40px 44px',display:'flex',flexDirection:'column',justifyContent:'center',gap:16}}>
        <span style={{fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:9999,background:post.pill,color:'#1A1109',textTransform:'uppercase',letterSpacing:'0.08em',alignSelf:'flex-start',whiteSpace:'nowrap'}}>{post.category}</span>
        <h2 style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:'clamp(1.75rem, 3vw, 2.5rem)',color:'#1A1109',margin:0,lineHeight:1.1,letterSpacing:'-0.02em'}}>{post.title}</h2>
        <p style={{fontSize:17,color:'#4A3728',lineHeight:1.6,margin:0}}>{post.excerpt}</p>
        <div style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:'#8A7264',paddingTop:8,flexWrap:'wrap'}}>
          <span style={{width:32,height:32,borderRadius:'50%',background:'#FFD6E3',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#1A1109'}}>{post.author[0]}</span>
          <span style={{fontWeight:600,color:'#1A1109',whiteSpace:'nowrap'}}>{post.author}</span>
          <span>·</span>
          <span style={{whiteSpace:'nowrap'}}>{post.date}</span>
          <span>·</span>
          <span style={{fontFamily:'var(--font-mono)',whiteSpace:'nowrap'}}>{post.read}</span>
        </div>
        <span style={{fontSize:14,fontWeight:700,color:'#E8622A',marginTop:8}}>Lire l'article →</span>
      </div>
    </a>
  );
}

function AuthorsBlock() {
  return (
    <section style={{padding:'64px 40px',background:'#F5F0EA'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:24,marginBottom:32,flexWrap:'wrap'}}>
          <div>
            <p className="eyebrow" style={{margin:'0 0 10px'}}>La rédaction</p>
            <h2 className="section-title" style={{margin:0}}>Deux humains.<br/><span style={{color:'#E8622A'}}>Zéro bot.</span></h2>
          </div>
          <p style={{color:'#4A3728',maxWidth:360,fontSize:15,lineHeight:1.55,margin:0}}>On écrit tout nous-mêmes. Pas d'IA pour pondre du vide, pas de pige à 20€.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:20}} data-grid-2>
          {AUTHORS.map(a => (
            <div key={a.name} style={{display:'flex',gap:20,background:'#fff',border:'1px solid #E2D5C8',borderRadius:24,padding:'24px 28px',alignItems:'center'}}>
              <span style={{width:72,height:72,borderRadius:'50%',background:a.pill,display:'inline-flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-serif)',fontWeight:900,fontSize:32,color:'#1A1109',flexShrink:0}}>{a.initial}</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:20,color:'#1A1109',margin:'0 0 2px'}}>{a.name}</p>
                <p style={{fontSize:12,fontWeight:600,color:'#E8622A',textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 8px'}}>{a.role} · <span style={{fontFamily:'var(--font-mono)',color:'#8A7264'}}>{a.count} articles</span></p>
                <p style={{fontSize:14,color:'#4A3728',lineHeight:1.55,margin:0}}>{a.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useStateB('');
  const [sent, setSent] = useStateB(false);
  return (
    <section style={{padding:'80px 40px',background:'#1A1109',position:'relative',overflow:'hidden'}}>
      <div aria-hidden style={{position:'absolute',top:-80,right:-80,width:360,height:360,borderRadius:'50%',background:'#FFD6E3',opacity:.15,filter:'blur(90px)'}} />
      <div aria-hidden style={{position:'absolute',bottom:-60,left:'-4%',width:280,height:280,borderRadius:'50%',background:'#C8DCFF',opacity:.12,filter:'blur(80px)'}} />
      <div style={{position:'relative',maxWidth:880,margin:'0 auto',textAlign:'center'}}>
        <span style={{display:'inline-block',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',padding:'6px 14px',borderRadius:9999,background:'rgba(245,238,230,0.12)',color:'#F5EEE6',marginBottom:24,whiteSpace:'nowrap'}}>La newsletter</span>
        <h2 className="section-title" style={{color:'#F5EEE6',margin:'0 0 16px'}}>
          Un email par mois. <span style={{background:'#FFD6E3',color:'#1A1109',padding:'0 14px 4px',borderRadius:12,display:'inline-block',lineHeight:1.2}}>Zéro spam.</span>
        </h2>
        <p style={{color:'#F5EEE6',opacity:.7,fontSize:16,lineHeight:1.6,margin:'0 0 28px',maxWidth:560,marginInline:'auto'}}>
          Nos meilleurs articles, un bon plan vérifié, et la liste des promos marques du mois. Si on n'a rien à dire, on n'envoie rien.
        </p>
        {sent ? (
          <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'14px 22px',borderRadius:12,background:'#C2F0D5',color:'#1A1109',fontWeight:700,fontSize:15}}>
            ✓ Inscrit. À dans pas longtemps.
          </div>
        ) : (
          <form onSubmit={e=>{e.preventDefault();if(email.includes('@'))setSent(true);}} style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',maxWidth:520,margin:'0 auto'}}>
            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
              placeholder="ton@email.fr"
              style={{flex:'1 1 240px',padding:'14px 18px',borderRadius:12,border:'1px solid rgba(245,238,230,0.2)',background:'rgba(245,238,230,0.08)',color:'#F5EEE6',fontSize:15,fontFamily:'var(--font-sans)',outline:'none'}}
            />
            <button type="submit" className="btn-primary" style={{fontSize:14,padding:'14px 24px'}}>Je m'inscris →</button>
          </form>
        )}
        <p style={{fontSize:11,color:'rgba(245,238,230,0.45)',margin:'16px 0 0'}}>2 834 inscrits · désinscription en 1 clic</p>
      </div>
    </section>
  );
}

function Blog() {
  const [query, setQuery] = useStateB('');
  const [activeCat, setActiveCat] = useStateB('all');
  const [sort, setSort] = useStateB('recent');

  const filtered = useMemoB(() => {
    let r = POSTS.filter(p => !p.hero);
    if (activeCat !== 'all') r = r.filter(p => p.cat === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (sort === 'long') r = [...r].sort((a,b) => parseInt(b.read)-parseInt(a.read));
    // popular = keep as-is (simulated)
    return r;
  }, [query, activeCat, sort]);

  const featured = POSTS.find(p => p.hero);
  const showFeatured = activeCat === 'all' && !query.trim();

  return (
    <div>
      <Header active="Blog" transparent={false} />
      <BlogHero />
      <SearchAndFilters
        query={query} onQuery={setQuery}
        activeCat={activeCat} onCat={setActiveCat}
        sort={sort} onSort={setSort}
      />

      <section style={{padding:'48px 40px 80px',background:'#FAFAF8'}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          {showFeatured && <FeaturedBlock post={featured} />}

          {filtered.length > 0 ? (
            <>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:24,gap:16,flexWrap:'wrap'}}>
                <h2 style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:'clamp(1.5rem, 2.5vw, 2rem)',color:'#1A1109',margin:0,letterSpacing:'-0.02em'}}>
                  {activeCat === 'all' ? 'Tous les articles' : CATEGORIES.find(c=>c.slug===activeCat)?.label}
                </h2>
                <span style={{fontSize:13,color:'#8A7264',fontFamily:'var(--font-mono)'}}>{filtered.length} résultat{filtered.length>1?'s':''}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:20}} data-grid-3>
                {filtered.map(p => <PostCard key={p.slug} p={p} />)}
              </div>
            </>
          ) : (
            <div style={{textAlign:'center',padding:'64px 20px',background:'#fff',border:'1px dashed #E2D5C8',borderRadius:24}}>
              <p style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:22,color:'#1A1109',margin:'0 0 8px'}}>Rien trouvé.</p>
              <p style={{color:'#4A3728',fontSize:15,margin:'0 0 20px'}}>Essaie d'autres mots-clés, ou réinitialise les filtres.</p>
              <button onClick={()=>{setQuery('');setActiveCat('all');}} className="btn-outline" style={{fontSize:13,padding:'10px 18px'}}>Réinitialiser →</button>
            </div>
          )}
        </div>
      </section>

      <AuthorsBlock />
      <Newsletter />
      <Footer />
      <StickyCta />
    </div>
  );
}

const rootBlog = ReactDOM.createRoot(document.getElementById('root'));
rootBlog.render(<Blog />);
