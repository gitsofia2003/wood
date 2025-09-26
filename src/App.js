import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Импортируем компоненты и страницы
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import ProductPage from './pages/ProductPage';
import UsPage from './pages/Us';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Компонент для защиты админ-панели
const PrivateRoute = ({ user, children }) => {
  if (user && user.role === 'admin') {
    return children;
  }
  return <Navigate to="/login" />;
};

// Компонент баннера для уведомления
const ConsentBanner = ({ onAccept }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex flex-col sm:flex-row justify-between items-center z-50 shadow-lg">
            <p className="text-sm mb-2 sm:mb-0">
                Продолжая использовать наш сайт, вы даете согласие на обработку файлов cookie и принимаете условия{' '}
                <Link to="/privacy-policy" className="underline hover:text-gray-300">Политики конфиденциальности</Link>.
            </p>
            <button 
                onClick={onAccept}
                className="bg-sand text-gray-800 font-semibold px-4 py-2 rounded-md hover:bg-opacity-80 transition-colors flex-shrink-0"
            >
                OK
            </button>
        </div>
    );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consentGiven = localStorage.getItem('userConsent');
    if (!consentGiven) {
      setShowConsent(true);
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ ...currentUser, role: userDocSnap.data().role });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleConsent = () => {
    localStorage.setItem('userConsent', 'true');
    setShowConsent(false);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Router>
      <div className="bg-white text-dark-gray flex flex-col min-h-screen">
        <Header user={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/about" element={<UsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute user={user}>
                  <AdminPage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
        {showConsent && <ConsentBanner onAccept={handleConsent} />}
      </div>
    </Router>
  );
}