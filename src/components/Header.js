import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Header = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Закрываем меню при переходе на новую страницу
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'Каталог', path: '/catalog' },
    { name: 'О нас', path: '/about' },
    { name: 'Контакты', path: '/contact' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <header className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-md shadow-sm z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* --- ИЗМЕНЕНИЕ: Заменяем название на "Полиформа" --- */}
          <Link to="/" className="text-2xl font-bold text-gray-800 tracking-wider">ПОЛИФОРМА</Link>

          {/* --- Десктопная навигация --- */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`${location.pathname === link.path ? 'text-gray-800 font-semibold' : 'text-gray-500'} hover:text-gray-800 transition duration-300`}
              >
                {link.name}
              </Link>
            ))}
            {user && location.pathname === '/admin' && (
                 <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-semibold">Выйти</button>
            )}
          </nav>

          {location.pathname !== '/admin' && (
            <div className="hidden md:block">
                <a href="tel:+78123364246" className="font-bold text-lg text-gray-800">+7 (812) 336-42-46</a>
                <p className="text-sm text-gray-500 cursor-pointer">Заказать звонок</p>
            </div>
          )}

          {/* --- Кнопка мобильного меню (бургер) --- */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {/* Иконка меняется в зависимости от состояния меню (крестик/бургер) */}
            {isMenuOpen ? (
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            )}
          </button>
        </div>
      </div>

      {/* --- ИЗМЕНЕНИЕ: ЗАПОЛНЕННОЕ МОБИЛЬНОЕ МЕНЮ --- */}
      {/* Меню появляется с плавной анимацией */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden md:hidden ${isMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-6 pb-6 pt-2 border-t border-gray-200">
          <nav className="flex flex-col space-y-4">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-lg ${location.pathname === link.path ? 'text-gray-900 font-bold' : 'text-gray-600'} hover:text-gray-900`}
              >
                {link.name}
              </Link>
            ))}
             {user && location.pathname === '/admin' && (
                 <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-lg text-left">Выйти</button>
            )}
          </nav>
          
          {location.pathname !== '/admin' && (
            <div className="mt-6 pt-4 border-t border-gray-200">
                <a href="tel:+78123364246" className="font-bold text-lg text-gray-800">+7 (812) 336-42-46</a>
                <p className="text-sm text-gray-500 cursor-pointer">Заказать звонок</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;