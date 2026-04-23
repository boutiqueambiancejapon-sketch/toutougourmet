/* global React, Header, Footer, StickyCta, Placeholder */

function Breadcrumb({ items }) {
  return (
    <nav aria-label="Fil d'Ariane" style={{fontSize:13,color:'#8A7264',marginBottom:16,display:'flex',flexWrap:'wrap',gap:6,alignItems:'center'}}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{opacity:.5}}>›</span>}
          {it.href ? (
            <a href={it.href} style={{color:'#8A7264',textDecoration:'none'}}>{it.label}</a>
          ) : (
            <span style={{color:'#4A3728'}}>{it.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function TLDR() {
  const items = [
    <>Un <strong>Berger Belge Malinois</strong> adulte actif de 28 kg a besoin de <strong>1 350 à 2 100 kcal/jour</strong> selon son niveau de travail — l'écart est énorme entre un chien de famille et un chien en activité cynotechnique.</>,
    <>Prioriser des <strong>protéines animales ≥ 28 %</strong> et des <strong>lipides 16–20 %</strong> pour soutenir l'effort, les articulations et la masse musculaire sèche caractéristique de la race.</>,
    <>La race est exposée à la <strong>dysplasie hanche/coude</strong> (15–20 %) et au <strong>SDTV</strong> : glucosamine, oméga-3 et deux repas par jour sont des règles non négociables.</>,
  ];
  return (
    <div style={{background:'#FFF8E8',border:'1px solid #F2B85A',borderRadius:16,padding:'20px 24px',margin:'28px 0'}}>
      <p style={{display:'flex',alignItems:'center',gap:8,fontWeight:700,color:'#8A5A0F',fontSize:14,margin:'0 0 14px'}}>
        <span>⚡</span> En bref
      </p>
      <ul style={{margin:0,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:12}}>
        {items.map((it,i) => (
          <li key={i} style={{display:'grid',gridTemplateColumns:'20px 1fr',gap:10,alignItems:'flex-start',fontSize:15,lineHeight:1.6,color:'#1A1109'}}>
            <span aria-hidden style={{color:'#4CAF7D',fontSize:14,lineHeight:1.6,marginTop:1}}>✅</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummarizeWithAI() {
  const providers = [
    {name:'ChatGPT', icon:'💬'},
    {name:'Claude', icon:'✦'},
    {name:'Mistral', icon:'▲'},
    {name:'Perplexity', icon:'🔎'},
    {name:'Grok', icon:'✕'},
  ];
  return (
    <div style={{background:'#FAFAF8',border:'1px solid #E2D5C8',borderRadius:16,padding:'16px 20px',margin:'0 0 40px'}}>
      <p className="eyebrow" style={{margin:'0 0 10px',color:'#8A7264'}}>Résumer cet article avec :</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {providers.map(p => (
          <a key={p.name} href="#" className="ai-btn">
            <span>{p.icon}</span> {p.name}
          </a>
        ))}
      </div>
    </div>
  );
}

function Callout({ title, children }) {
  return (
    <div className="callout">
      <p className="callout-title"><span>⚡</span> {title}</p>
      <p className="callout-body">{children}</p>
    </div>
  );
}

function RelatedBrands() {
  const brands = [
    {name:'Franklin', score:4.6, tone:'amber', pill:'#FFE8B5', emoji:'🔥'},
    {name:'Elmut', score:4.7, tone:'green', pill:'#C2F0D5', emoji:'🌿'},
    {name:'Petty Well', score:4.5, tone:'blue', pill:'#C8DCFF', emoji:'⭐'},
  ];
  return (
    <aside style={{position:'sticky',top:100}}>
      <p className="eyebrow" style={{margin:'0 0 14px'}}>Recommandées pour ce profil</p>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {brands.map(b => (
          <a key={b.name} href="article.html" style={{
            display:'flex',alignItems:'center',gap:12,padding:'14px 16px',
            background:'#fff',border:'1px solid #E2D5C8',borderRadius:16,textDecoration:'none',
            transition:'border-color 180ms var(--ease), transform 180ms var(--ease)',
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#E8622A';e.currentTarget.style.transform='translateY(-2px)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#E2D5C8';e.currentTarget.style.transform='translateY(0)';}}
          >
            <span style={{fontSize:22,width:40,height:40,borderRadius:10,background:b.pill,display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{b.emoji}</span>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:15,color:'#1A1109',margin:'0 0 2px',lineHeight:1.2}}>{b.name}</p>
              <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#8A7264'}}>
                <div style={{flex:1,height:4,borderRadius:9999,background:'#E2D5C8',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(b.score/5)*100}%`,background:'#E8622A',borderRadius:9999}} />
                </div>
                <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'#E8622A'}}>{b.score}</span>
              </div>
            </div>
            <span style={{fontSize:16,color:'#8A7264'}}>→</span>
          </a>
        ))}
      </div>

      <div style={{marginTop:24,padding:20,background:'#1A1109',borderRadius:20,color:'#F5EEE6'}}>
        <p style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:18,margin:'0 0 8px',color:'#F5EEE6',lineHeight:1.25}}>Pas sûr(e) du bon choix ?</p>
        <p style={{fontSize:13,opacity:.75,lineHeight:1.5,margin:'0 0 14px'}}>2 min de quiz, et on te recommande la marque idéale pour ton Malinois.</p>
        <a href="#" className="btn-primary" style={{fontSize:13,padding:'10px 16px',width:'100%',justifyContent:'center'}}>Faire le quiz →</a>
      </div>
    </aside>
  );
}

function Article() {
  return (
    <div>
      <Header active="Guides" transparent={false} />

      <article style={{background:'#FAFAF8',paddingTop:40,paddingBottom:80}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 40px'}}>
          <Breadcrumb items={[
            {label:'Accueil', href:'index.html'},
            {label:'Chien', href:'#'},
            {label:'Alimentation par race', href:'#'},
            {label:'Quelle nourriture pour un Berger Belge Malinois ?'},
          ]} />

          <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 320px',gap:48,alignItems:'flex-start'}} data-article-grid>
            <div style={{minWidth:0}}>
              {/* Meta + title */}
              <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:16}}>
                <span style={{fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:9999,background:'#C8DCFF',color:'#1A1109',textTransform:'uppercase',letterSpacing:'0.08em'}}>Race</span>
                <span style={{fontSize:13,color:'#8A7264'}}>23 avril 2026</span>
                <span style={{fontSize:13,color:'#8A7264'}}>·</span>
                <span style={{fontSize:13,color:'#8A7264',fontFamily:'var(--font-mono)'}}>11 min de lecture</span>
              </div>

              <h1 style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:'clamp(2rem, 4.5vw, 3.25rem)',color:'#1A1109',margin:'0 0 20px',lineHeight:1.1,letterSpacing:'-0.02em',textWrap:'balance'}}>
                Quelle nourriture pour un Berger Belge Malinois ?
              </h1>
              <p style={{fontSize:19,color:'#4A3728',lineHeight:1.55,margin:'0 0 28px',maxWidth:720}}>
                Le Berger Belge Malinois est un chien de travail très énergique : besoins caloriques, protéines, santé articulaire, prévention du SDTV et recommandations 2026.
              </p>

              {/* Hero image */}
              <div style={{marginBottom:28,borderRadius:24,overflow:'hidden',border:'1px solid #E2D5C8'}}>
                <Placeholder variant="dog" tone="amber" radius={0} label="Photo de couverture — Malinois" style={{height:360}} />
              </div>

              <TLDR />
              <SummarizeWithAI />

              <div className="prose">
                <h2>Pourquoi l'activité réelle change tout chez le Malinois</h2>
                <p>
                  Le Malinois est classé au Groupe 1, Section 1 de la FCI (Chiens de berger avec épreuve de travail). C'est un médioligne sec et puissant, taillé pour l'endurance, dont le métabolisme peut encaisser plusieurs heures d'effort soutenu par jour. Selon les formules du besoin énergétique d'entretien de la <a href="#" className="ref">FEDIAF (Nutritional Guidelines 2023)</a> :
                </p>
                <ul>
                  <li><strong>Malinois sédentaire ou peu actif</strong> ({'<'} 1h/jour) : ~95 kcal/kg<sup>0,75</sup></li>
                  <li><strong>Malinois modérément actif</strong> (1–3h/jour) : ~110 kcal/kg<sup>0,75</sup></li>
                  <li><strong>Malinois de travail intense</strong> ({'>'} 3h/jour, cynotechnie, mantrailing) : 150–175 kcal/kg<sup>0,75</sup></li>
                </ul>
                <p>
                  Pour un adulte de 28 kg, cela représente concrètement <strong>1 160 kcal/jour au repos contre 2 100 kcal/jour en travail intensif</strong> — près du double. Nourrir un Malinois de famille comme un chien de brigade conduit invariablement à une prise de poids, avec aggravation du risque articulaire. À l'inverse, sous-nourrir un chien en activité provoque une perte de masse musculaire, une baisse de concentration et une chute de performance sur le terrain.
                </p>

                <Callout title="Le piège du Malinois « d'appartement »">
                  Un Malinois qui ne sort qu'une heure par jour reste dans la catégorie <strong>peu actif</strong> au sens nutritionnel, même s'il semble « toujours en mouvement » à l'intérieur. L'agitation mentale ne compense pas une activité physique structurée. Si la ration n'est pas ajustée, le surpoids arrive vite — et ce sont les hanches et les coudes qui paient la facture.
                </Callout>

                <h3>Utiliser la notation corporelle (BCS) pour caler la ration</h3>
                <p>
                  Le <em>Body Condition Score</em> (échelle 1–9 validée par la <a href="#" className="ref">WSAVA, 2013</a>) reste l'outil de référence. Un Malinois en condition correcte est à <strong>4 ou 5/9</strong> : les côtes sont palpables sans pression, la silhouette présente une taille marquée vue du dessus et un rentré abdominal visible de profil. Un Malinois qui perd sa taille ou dont les côtes ne sont plus palpables a déjà basculé en surpoids léger — la ration doit être réduite de 10 à 15 % et réévaluée toutes les deux semaines.
                </p>

                <h2>Les besoins nutritionnels spécifiques du Malinois</h2>
                <p>
                  Au-delà du total calorique, le Malinois a des contraintes qualitatives précises. Une bonne croquette ou un bon repas frais pour cette race doit afficher au minimum <strong>28 % de protéines brutes</strong> dans une croquette, avec une exigence de qualité sur le profil en acides aminés (lysine, méthionine, leucine) — particulièrement critique pour les chiens en croissance et les adultes en travail.
                </p>
                <p>
                  Côté lipides, la cible se situe entre <strong>16 et 20 %</strong> pour un adulte actif, avec un ratio oméga-6/oméga-3 idéalement ≤ 5:1. Les oméga-3 EPA/DHA (500–1500 mg/jour selon le poids) jouent un rôle démontré sur la réponse inflammatoire articulaire, point capital chez une race exposée à la dysplasie.
                </p>

                <h3>Digestibilité : un critère sous-estimé</h3>
                <p>
                  Le Malinois de travail tolère mal les croquettes à digestibilité moyenne : un transit irrégulier ou des selles molles pénalisent la récupération et perturbent la concentration en épreuve. Viser une digestibilité protéique {'>'} 87 % (données fournies par le fabricant, pas estimées). Les marques que nous recommandons communiquent cette valeur ; les autres, non — c'est un signal.
                </p>

                <Callout title="Protéines végétales : pas l'ennemi">
                  Contrairement à une idée reçue, un pois jaune ou une pomme de terre ne « dégradent » pas automatiquement une croquette. Ce qui compte, c'est le <strong>profil global en acides aminés essentiels</strong> et la digestibilité mesurée. Une formule avec 28 % de protéines totales dont 70 % d'origine animale et 30 % végétale bien sélectionnée peut surclasser un produit 100 % animal mal formulé.
                </Callout>

                <h2>Santé articulaire : l'enjeu central</h2>
                <p>
                  La dysplasie de la hanche touche 15 à 20 % des Malinois selon les dépistages FCI sur la population française. La dysplasie du coude est plus rare mais invalidante. Trois leviers nutritionnels ont un impact démontré :
                </p>
                <ul>
                  <li><strong>Contrôle calorique strict</strong> pendant la croissance (0–18 mois) : pas de libre-service, pas de surnutrition.</li>
                  <li><strong>Apport contrôlé en calcium</strong> : 0,7 à 1,2 % sur matière sèche, jamais plus. Les compléments calciques pendant la croissance sont <em>contre-indiqués</em>.</li>
                  <li><strong>Oméga-3 EPA/DHA</strong> en continu, à vie, dès l'âge adulte. L'effet est modeste mais cumulatif.</li>
                </ul>
                <p>
                  La glucosamine et la chondroïtine, longtemps controversées, bénéficient aujourd'hui de méta-analyses favorables à doses thérapeutiques (500–1500 mg/jour de glucosamine). Plusieurs marques recommandées intègrent ces actifs dans leurs formules spécifiques « Grandes Races ».
                </p>
              </div>
            </div>

            <RelatedBrands />
          </div>
        </div>
      </article>

      <Footer />
      <StickyCta />
    </div>
  );
}

const rootA = ReactDOM.createRoot(document.getElementById('root'));
rootA.render(<Article />);
