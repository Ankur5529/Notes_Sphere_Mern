import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Components/Navbar';
import Hero from './Components/Hero';
import Features from './Components/Features';
import Footer from './Components/Footer';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Dashboard from './Components/Dashboard';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    setIsAuth(!!localStorage.getItem("token"));
  }, []);

  return (
    <Routes>
      {/*Landing */}
      <Route path="/" element={<> <Navbar onLoginClick={() => { setShowLogin(true); setShowSignup(false); }}
        onSignupClick={() => { setShowSignup(true); setShowLogin(false); }} />


        <div className={showLogin || showSignup ? "blur-bg" : ""}>
          <Hero onStart={() => { setShowLogin(true); setShowSignup(false); }} />
          <Features />
          <Footer />
        </div>

        {showLogin && (<Login onClose={() => setShowLogin(false)}
          onOpenSignup={() => { setShowSignup(true); setShowLogin(false); }}
          onSucess={() => setIsAuth(true)} />
        )}


        {showSignup && (<Signup onClose={() => setShowSignup(false)} onOpenLogin={() => { setShowLogin(true); setShowSignup(false); }}
          onSucess={() => setIsAuth(true)} />)}
      </>
      } />

      {/* Protected Dashboard */}
      <Route path="/dashboard" element={isAuth ? <Dashboard onLogout={() => setIsAuth(false)} /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
