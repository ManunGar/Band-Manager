/* =========================================================
   App.js — Main application shell.
   Assembles all landing page sections in document order.
   ========================================================= */

import './App.css';

import Navbar      from './components/Navbar/Navbar';
import Hero        from './components/Hero/Hero';
import Pillars     from './components/Pillars/Pillars';
import FeatureGrid from './components/FeatureGrid/FeatureGrid';
import HowItWorks  from './components/HowItWorks/HowItWorks';
import Download    from './components/Download/Download';
import Footer      from './components/Footer/Footer';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <Pillars />
        <FeatureGrid />
        <HowItWorks />
        <Download />
      </main>
      <Footer />
    </div>
  );
}

export default App;
