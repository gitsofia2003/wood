import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
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

// Создаем пустые страницы "О нас" и "Контакты"
const AboutPage = () => <div className="container mx-auto p-8"><h1 className="text-2xl">О нас</h1></div>;
const ContactPage = () => <div className="container mx-auto p-8"><h1 className="text-2xl">Контакты</h1></div>;

// Компонент для защиты админ-панели
const PrivateRoute = ({ user, children }) => {
  if (user && user.role === 'admin') {
    return children;
  }
  return <Navigate to="/login" />;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- ИЗМЕНЕНИЕ: Теперь мы также загружаем роль пользователя ---
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Пользователь вошел. Теперь идем в Firestore за его ролью.
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Если документ с ролью найден, добавляем роль к объекту пользователя
          setUser({ ...currentUser, role: userDocSnap.data().role });
        } else {
          // Если документа с ролью нет, это обычный пользователь
          setUser(currentUser);
        }
      } else {
        // Пользователь вышел
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>; // Показываем заглушку, пока проверяется статус входа
  }

  return (
    <Router>
      <div className="bg-white text-dark-gray flex flex-col min-h-screen">
        <Header user={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
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
      </div>
    </Router>
  );
}
 