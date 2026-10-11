/* global React */
const { useState, useEffect } = React;

function Logo({ dark = false }) {
  return (
    <a href="index.html" style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:'var(--font-serif)',fontWeight:900,fontSize:20,color:dark?'#F5EEE6':'#1A1109',textDecoration:'none'}}>
      <span>Toutou</span>
      <span style={{background:'#FFD6E3',color:'#1A1109',padding:'1px 8px 3px',borderRadius:6}}>Gourmet</span>
    </a>
  );
}

function Header({ active = 'Comparateur', onNav, transparent = false }) {
  const links = ['Guides','Races','Comparateur','Marques','Outils','Blog'];
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = !transparent || scrolled;

  return (
    <header style={{
      position:'sticky', top:0, zIndex:50,
      background: solid ? 'rgba(250,250,248,0.92)' : 'transparent',
      backdropFilter: solid ? 'blur(10px)' : 'none',
      borderBottom: solid ? '1px solid #E2D5C8' : '1px solid transparent',
      transition:'background 220ms var(--ease), border-color 220ms var(--ease)',
    }}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',height:68,display:'flex',alignItems:'center',justifyContent:'space-between',gap:24}}>
        <Logo />
        <nav style={{display:'flex',gap:2}}>
          {links.map(l => (
            <a key={l} href="#" onClick={(e)=>{e.preventDefault();onNav&&onNav(l);}}
               style={{
                 fontSize:14, fontWeight:600, padding:'8px 14px', borderRadius:10, textDecoration:'none',
                 color: l===active ? '#1A1109' : '#4A3728',
                 background: l===active ? '#F5F0EA' : 'transparent',
                 transition:'background 180ms var(--ease), color 180ms var(--ease)',
               }}
               onMouseEnter={(e)=>{ if(l!==active) e.currentTarget.style.background='#F5F0EA'; }}
               onMouseLeave={(e)=>{ if(l!==active) e.currentTarget.style.background='transparent'; }}
            >
              {l}
            </a>
          ))}
        </nav>
        <a href="#" onClick={(e)=>{e.preventDefault();onNav&&onNav('Quiz');}} className="btn-primary" style={{fontSize:14,padding:'10px 20px'}}>Faire le quiz →</a>
      </div>
    </header>
  );
}

Object.assign(window, { Logo, Header });
