/* global React, Placeholder */

function BreedsGuides() {
  const breeds = [
    {slug:'labrador',  name:'Labrador',        count:'12 guides', tone:'amber',  emoji:'🦴'},
    {slug:'golden',    name:'Golden Retriever',count:'9 guides',  tone:'rose',   emoji:'🌟'},
    {slug:'bouledogue',name:'Bouledogue',      count:'7 guides',  tone:'blue',   emoji:'💪'},
    {slug:'berger',    name:'Berger Australien',count:'8 guides', tone:'green',  emoji:'🏃'},
    {slug:'chihuahua', name:'Chihuahua',       count:'6 guides',  tone:'rose',   emoji:'✨'},
    {slug:'cavalier',  name:'Cavalier King Charles',count:'5 guides',tone:'amber',emoji:'👑'},
  ];
  return (
    <section id="races" style={{padding:'96px 40px 64px',background:'#FAFAF8'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:32,marginBottom:40,flexWrap:'wrap'}}>
          <div>
            <p className="eyebrow" style={{margin:'0 0 10px',color:'#4E8EDB'}}>Guides par race</p>
            <h2 className="section-title" style={{margin:0}}>Ton <span style={{background:'#C8DCFF',padding:'2px 14px 6px',borderRadius:12,display:'inline-block',lineHeight:1}}>Labrador</span> ne bouffe pas comme un Chihuahua.</h2>
          </div>
          <a href="#" style={{fontSize:14,fontWeight:700,color:'#E8622A',textDecoration:'none',whiteSpace:'nowrap'}}>Toutes les races (42) →</a>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6, 1fr)',gap:14}}>
          {breeds.map(b => (
            <a key={b.slug} href="#" className="breed-card" style={{
              display:'flex',flexDirection:'column',
              borderRadius:20,overflow:'hidden',background:'#fff',border:'1px solid #E2D5C8',textDecoration:'none',
              transition:'transform 220ms var(--ease), box-shadow 220ms var(--ease), border-color 220ms var(--ease)',
            }}>
              <div style={{height:120,position:'relative'}}>
                <Placeholder variant="dog" tone={b.tone} radius={0} style={{height:'100%'}} />
                <span style={{position:'absolute',top:10,right:10,fontSize:18,background:'#fff',width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(26,17,9,0.1)'}}>{b.emoji}</span>
              </div>
              <div style={{padding:'14px 16px'}}>
                <p style={{fontFamily:'var(--font-serif)',fontWeight:900,fontSize:15,color:'#1A1109',margin:'0 0 2px',lineHeight:1.2}}>{b.name}</p>
                <p style={{fontSize:11,color:'#8A7264',margin:0,fontFamily:'var(--font-mono)',fontWeight:500}}>{b.count}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { BreedsGuides });
