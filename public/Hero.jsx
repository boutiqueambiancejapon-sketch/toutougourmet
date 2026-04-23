/* global React, Placeholder */
const { useState: useStateHero, useEffect: useEffectHero } = React;

function WordRotator({ words, intervalMs = 1800 }) {
  const [i, setI] = useStateHero(0);
  useEffectHero(() => {
    const t = setInterval(() => setI(x => (x+1) % words.length), intervalMs);
    return () => clearInterval(t);
  }, [words, intervalMs]);
  return <span key={i} style={{display:'inline-block',animation:'wordSlideIn 400ms cubic-bezier(0.4,0,0.2,1)'}}>{words[i]}</span>;
}

/**
 * Hero fade-to-cream : photo en haut qui se fond dans le fond crème,
 * H1 par-dessus, stats + CTA en dessous.
 */
function Hero() {
  const words = ['chien','chat','Labrador','Golden','bouledogue','compagnon','toutou'];
  const stats = [
    {value:'4', label:'marques testées'},
    {value:'0€', label:'de sponsoring'},
    {value:'2 min', label:'pour le quiz'},
    {value:'100%', label:'indépendant'},
  ];

  return (
    <section style={{position:'relative',background:'#FAFAF8',overflow:'hidden'}}>
      {/* Cover image layer — fades into cream at bottom */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:620,pointerEvents:'none'}} aria-hidden="true">
        <Placeholder
          variant="landscape"
          tone="rose"
          radius={0}
          style={{width:'100%',height:'100%',position:'absolute',inset:0}}
        />
        {/* Fade to cream overlay — subtle at top so image is visible, strong at bottom */}
        <div style={{
          position:'absolute',inset:0,
          background:'linear-gradient(180deg, rgba(250,250,248,0) 0%, rgba(250,250,248,0) 35%, rgba(250,250,248,0.4) 60%, rgba(250,250,248,0.9) 85%, #FAFAF8 100%)',
        }} />
        {/* Soft color blobs (brand signature) */}
        <div style={{position:'absolute',top:-60,right:'12%',width:320,height:320,borderRadius:'50%',background:'#FFD6E3',opacity:.3,filter:'blur(90px)'}} />
        <div style={{position:'absolute',top:60,left:'-6%',width:260,height:260,borderRadius:'50%',background:'#C8DCFF',opacity:.25,filter:'blur(80px)'}} />
      </div>

      <div style={{position:'relative',maxWidth:1280,margin:'0 auto',padding:'80px 40px 72px'}}>
        {/* Top spacer to let image breathe above the H1 */}
        <div style={{height:180}} />

        <div style={{maxWidth:960}}>
          <span className="eyebrow" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:9999,background:'#FFFFFF',border:'1px solid #E2D5C8',color:'#E8622A',marginBottom:28,boxShadow:'0 1px 3px rgba(26,17,9,0.06)',whiteSpace:'nowrap'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#E8622A'}} />
            Comparatif indépendant · 2026
          </span>
          <h1 style={{color:'#1A1109',fontFamily:'var(--font-serif)',fontSize:'clamp(2.75rem, 7.5vw, 6rem)',fontWeight:900,lineHeight:1,letterSpacing:'-.03em',margin:'0 0 28px',textWrap:'balance'}}>
            La bouffe de ton{' '}
            <span style={{display:'inline-block',padding:'2px 18px 8px',borderRadius:14,background:'#FFD6E3',color:'#1A1109',lineHeight:1}}>
              <WordRotator words={words} />
            </span>
            <br/>
            on a tout comparé.
          </h1>
          <p style={{color:'#4A3728',fontSize:20,lineHeight:1.55,maxWidth:640,margin:'0 0 40px'}}>
            Franklin, Elmut, Petty Well, Dog Chef — on les a tous testés, scrutés, notés. Sans blabla, sans langue de bois. <b style={{color:'#1A1109'}}>Trouve la meilleure option en 2 min.</b>
          </p>
          <div style={{display:'flex',flexWrap:'wrap',gap:14,marginBottom:64}}>
            <a href="#" className="btn-primary" style={{fontSize:16,padding:'16px 32px'}}>Faire le quiz personnalisé →</a>
            <a href="#comparatif" className="btn-outline" style={{fontSize:16,padding:'14px 30px'}}>Voir le comparateur</a>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24,paddingTop:32,borderTop:'1px solid #E2D5C8'}}>
            {stats.map(s => (
              <div key={s.label}>
                <p style={{fontFamily:'var(--font-serif)',fontWeight:900,color:'#1A1109',fontSize:44,margin:'0 0 2px',lineHeight:1.05,letterSpacing:'-0.02em'}}>{s.value}</p>
                <p style={{fontSize:13,color:'#8A7264',margin:0,fontWeight:500}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero, WordRotator });
