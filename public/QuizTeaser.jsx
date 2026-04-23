/* global React */
function QuizTeaser() {
  const steps = [
    {num:'01', icon:'🐶', title:'Ton animal', desc:'Chien ou chat, âge, taille, problèmes de santé'},
    {num:'02', icon:'💰', title:'Ton budget', desc:'De moins de 30€ à plus de 100€ par mois'},
    {num:'03', icon:'🎯', title:'Ta recommandation', desc:'La marque idéale + des alternatives'},
  ];
  return (
    <section style={{background:'#1A1109',padding:'96px 40px',position:'relative',overflow:'hidden'}}>
      <div aria-hidden style={{position:'absolute',top:-40,right:-40,width:300,height:300,borderRadius:'50%',background:'#FFD6E3',opacity:.15,filter:'blur(80px)'}} />
      <div aria-hidden style={{position:'absolute',bottom:-60,left:'10%',width:240,height:240,borderRadius:'50%',background:'#C8DCFF',opacity:.12,filter:'blur(70px)'}} />
      <div style={{maxWidth:1280,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:40,flexWrap:'wrap',position:'relative'}}>
        <div style={{maxWidth:560}}>
          <span style={{display:'inline-block',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',padding:'6px 14px',borderRadius:9999,background:'rgba(245,238,230,0.12)',color:'#F5EEE6',marginBottom:24,whiteSpace:'nowrap'}}>⚡ 2 minutes chrono</span>
          <h2 className="section-title" style={{color:'#F5EEE6',margin:'0 0 28px',lineHeight:1.3}}>
            Quelle marque pour{' '}
            <span style={{display:'inline-block',padding:'0 12px 4px',borderRadius:10,background:'#C8DCFF',color:'#1A1109',lineHeight:1.2}}>ton animal</span> ?
          </h2>
          <p style={{color:'#F5EEE6',opacity:.7,fontSize:16,lineHeight:1.6,margin:'0 0 32px'}}>
            5 questions. On analyse le profil de ton animal. On te recommande la meilleure option — sans te noyer dans les détails.
          </p>
          <a href="#" className="btn-dark" style={{fontSize:16,padding:'16px 32px'}}>Faire le quiz gratuit →</a>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14,maxWidth:380,width:'100%'}}>
          {steps.map(s => (
            <div key={s.num} style={{display:'flex',alignItems:'flex-start',gap:14,padding:16,borderRadius:16,background:'rgba(245,238,230,0.06)',border:'1px solid rgba(245,238,230,0.1)'}}>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:900,fontSize:12,color:'#F5EEE6',opacity:.6,flexShrink:0,marginTop:2}}>{s.num}</span>
              <span style={{fontSize:20,flexShrink:0}}>{s.icon}</span>
              <div>
                <p style={{fontSize:14,fontWeight:700,color:'#F5EEE6',margin:'0 0 2px'}}>{s.title}</p>
                <p style={{fontSize:13,color:'#F5EEE6',opacity:.7,margin:0,lineHeight:1.5}}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { QuizTeaser });
