import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Logo from './Logo';
import CategoryFilter from './CategoryFilter';
import ContactFormSection from './email';

const Header = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Каталог', path: '/catalog' },
    { name: 'Главная', path: '/' },
    { name: 'Гарантия', path: '/warranty' },
    { name: 'О нас', path: '/about' },
    { name: 'Контакты и адреса', path: '/contact' },
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
      {/* --- ВЕРХНИЙ УРОВЕНЬ ШАПКИ (Лого и контакты) --- */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-x-3">
              <Logo width="130" /> 
          </Link>

          {/* Контакты и кнопка "Оставить заявку" на десктопе */}
          <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <a href="tel:+78123364246" className="font-bold text-lg text-gray-800 block">+7 (812) 336-42-46</a>
                <Link to="/#contact-form" className="text-sm text-gray-500 cursor-pointer">
                  Заказать звонок
              </Link>
              </div>
              
          </div>

          {/* Кнопка мобильного меню (бургер) */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            )}
          </button>
        </div>
      </div>

      {/* --- НИЖНИЙ УРОВЕНЬ ШАПКИ (НАВИГАЦИЯ) --- */}
      {/* На десктопе всегда виден, на мобильных скрыт */}
      <div className="hidden md:block">
        {/* Отображаем, только если мы НЕ в админ-панели */}
        {!location.pathname.startsWith('/admin') && (
            <CategoryFilter isHomePage={true} navLinks={navLinks} location={location} />
        )}
      </div>

      {/* --- ВЫЕЗЖАЮЩЕЕ МОБИЛЬНОЕ МЕНЮ --- */}
      {/* Появляется только на мобильных по клику на бургер */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden md:hidden ${isMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-6 pb-6 pt-2 border-t border-gray-200">
            {/* В мобильном меню просто выводим ссылки списком */}
            <nav className="flex flex-col space-y-4 mt-4">
              {navLinks.map(link => (
                <Link key={link.name} to={link.path} className={`text-lg ${location.pathname === link.path ? 'font-bold' : ''}`}>
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t">
              <a href="tel:+78123364246" className="font-bold text-lg">+7 (812) 336-42-46</a>
              <a href="#contact-form" className="text-sm text-gray-500 cursor-pointer">Заявка на звонок</a>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;