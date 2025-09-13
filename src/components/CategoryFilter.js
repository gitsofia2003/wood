// src/components/CategoryFilter.js

import React from 'react';
import { Link } from 'react-router-dom';

// Иконки для категорий
const CategoryIcon = ({ type }) => {
    const icons = {
        Chairs: <path strokeLinecap="round" strokeLinejoin="round" d="M5 15V7a2 2 0 012-2h10a2 2 0 012 2v8M5 15h14M5 15l-1 5h16l-1-5" />,
        Tables: <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M4 4h16v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />,
        Sofas: <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-8-8v8m-4-4h16m-2-4h-2a2 2 0 00-2 2v4a2 2 0 002 2h2m-2-8a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2" />,
        Armchairs: <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />,
        Beds: <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />,
        Storage: <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />,
        Lighting: <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
    };
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{icons[type]}</svg>;
};

// Данные для фильтра
export const categories = [
    { name: 'Все товары', value: 'Все товары' },
    { name: 'Стулья', value: 'Стулья', icon: 'Chairs' },
    { name: 'Столы', value: 'Столы', icon: 'Tables' },
    { name: 'Диваны', value: 'Диваны', icon: 'Sofas' },
    { name: 'Кресла', value: 'Кресла', icon: 'Armchairs' },
    { name: 'Кровати', value: 'Кровати', icon: 'Beds' },
    { name: 'Хранение', value: 'Хранение', icon: 'Storage' },
    { name: 'Освещение', value: 'Освещение', icon: 'Lighting' },
];

const CategoryFilter = ({ activeCategory, setActiveCategory, isHomePage = false }) => {

    const displayedCategories = isHomePage
        ? categories.filter(cat => cat.value !== 'Все товары')
        : categories;

    // На главной странице кнопки будут ссылками
    // --- ИЗМЕНЕНИЕ ЗДЕСЬ: Новый, более компактный вид для главной страницы ---
    if (isHomePage) {
        return (
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 py-4">
                {displayedCategories.map(category => (
                    <Link
                        key={category.name}
                        to="/catalog"
                        state={{ selectedCategory: category.value }}
                        className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        {category.icon && <CategoryIcon type={category.icon} />}
                        <span className="ml-2">{category.name}</span>
                    </Link>
                ))}
            </div>
        );
    }


    // На странице каталога кнопки остаются кнопками
    return (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
            {displayedCategories.map(category => (
                <button
                    key={category.name}
                    onClick={() => setActiveCategory(category.value)}
                    className={`flex items-center justify-center px-4 py-2 text-sm font-semibold border rounded-full transition-colors duration-300
                        ${activeCategory === category.value
                            ? 'bg-gray-800 text-white border-gray-800'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                        }`}
                >
                    {category.icon && <CategoryIcon type={category.icon} />}
                    <span className={category.icon ? 'ml-2' : ''}>{category.name}</span>
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;