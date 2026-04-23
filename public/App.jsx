/* global React, Header, Hero, BrandsGrid, ComparisonTable, BreedsGuides, ArticlesGrid, QuizTeaser, TrustSection, Footer, StickyCta */
function App() {
  const [toast, setToast] = React.useState(null);
  const handleNav = (label) => {
    setToast(`→ ${label}`);
    setTimeout(() => setToast(null), 1600);
  };
  return (
    <div>
      <Header active="Accueil" onNav={handleNav} transparent />
      <Hero />
      <BrandsGrid />
      <ComparisonTable />
      <BreedsGuides />
      <QuizTeaser />
      <ArticlesGrid />
      <TrustSection />
      <Footer />
      <StickyCta />
      {toast && (
        <div style={{position:'fixed',top:88,right:24,background:'#1A1109',color:'#F5EEE6',padding:'10px 18px',borderRadius:12,fontSize:13,fontWeight:600,boxShadow:'0 8px 32px rgba(26,17,9,0.3)',zIndex:60}}>
          {toast}
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
