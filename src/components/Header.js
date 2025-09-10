import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // <-- Импортируем из react-router-dom
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Header = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // <-- Хук для определения текущей страницы
  const navigate = useNavigate(); // <-- Хук для перенаправления

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'Каталог', path: '/catalog' },
    { name: 'О нас', path: '/about' },
    { name: 'Контакты', path: '/contact' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Перенаправляем на главную после выхода
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <header className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-md shadow-sm z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-800 tracking-wider">WOOD & CANVAS</Link>
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
            {user && (
                 <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Выйти</button>
            )}
          </nav>
          <div className="hidden md:block">
            <a href="tel:+78123364246" className="font-bold text-lg text-gray-800">+7 (812) 336-42-46</a>
            <p className="text-sm text-gray-500 cursor-pointer">Заказать звонок</p>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </div>
      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden px-6 pb-4">
          {/* ... код мобильного меню ... */}
        </div>
      )}
    </header>
  );
};

export default Header;
