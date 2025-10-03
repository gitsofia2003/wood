import React from 'react';
import { Link } from 'react-router-dom';
import woodTexture from '../assets/wood-texture.webp'; 

const CategoryIcon = ({ type }) => {
    
    const icons = {
        Lighting: {
            viewBox: "0 0 14 14",
            content: <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M10.5 8a3.5 3.5 0 1 0-5.06 3.12v1.72a.39.39 0 0 0 .39.38h2.34a.39.39 0 0 0 .39-.38v-1.75A3.5 3.5 0 0 0 10.5 8ZM7 .81v1.5m4-.07L9.94 3.31m3.34 2.03h-1.5M3 2.24l1.06 1.07M.72 5.34h1.5"></path>
        },
        TVStand: {
            viewBox: "0 0 20 20",
            content: <g fill="currentColor"><path fillRule="evenodd" d="M3.25 9v5a3 3 0 0 0 3 3h7.5a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-7.5a3 3 0 0 0-3 3m3 7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h7.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2z" clipRule="evenodd"></path><path d="m9.86 5.688l2-2.5c.416-.52 1.197.104.78.624l-2 2.5c-.416.52-1.197-.104-.78-.624"></path><path d="m8.86 6.312l-2-2.5c-.417-.52.364-1.145.78-.624l2 2.5c.417.52-.364 1.145-.78.624"></path></g>
        },
        ReadySet: {
            viewBox: "0 0 16 16",
            content: <path fill="currentColor" d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2l-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504L1.508 9.071l2.742 1.567l2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134l2.75 1.571v-3.134L8.5 9.933zm.508-3.996l2.742 1.567l2.742-1.567l-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643L8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z"></path>
        },
        Mirror: {
            viewBox: "0 0 32 32",
            content: <g fill="currentColor"><path d="M16 27.15c3.733 0 6.76-4.867 6.76-10.87c0-6.003-3.027-10.87-6.76-10.87c-3.733 0-6.76 4.867-6.76 10.87c0 6.003 3.027 10.87 6.76 10.87m5.76-10.87c0 2.845-.72 5.373-1.83 7.158c-1.118 1.8-2.535 2.712-3.93 2.712s-2.812-.912-3.93-2.712a10.968 10.968 0 0 1-1.024-2.172l9.85-10.134c.543 1.49.864 3.249.864 5.148"></path><path d="M16 1a5.671 5.671 0 0 0-4.719 2.525l-1.024 1.536a3 3 0 0 1-1.154 1.02l-1.583.79a5 5 0 0 0-2.303 6.568l.601 1.304a3 3 0 0 1 0 2.514l-.601 1.304a5 5 0 0 0 2.303 6.567l1.583.791a3 3 0 0 1 1.154 1.02l1.024 1.536a5.671 5.671 0 0 0 9.438 0l1.024-1.536a3 3 0 0 1 1.154-1.02l1.583-.79a5 5 0 0 0 2.303-6.568l-.602-1.304a3 3 0 0 1 0-2.514l.602-1.304a5 5 0 0 0-2.303-6.567l-1.583-.791a3 3 0 0 1-1.154-1.02l-1.024-1.536A5.671 5.671 0 0 0 15.999 1m-3.055 3.635a3.671 3.671 0 0 1 6.11 0l1.024 1.536a5 5 0 0 0 1.924 1.698l1.582.792a3 3 0 0 1 1.382 3.94l-.601 1.304a5 5 0 0 0 0 4.19l.601 1.304a3 3 0 0 1-1.382 3.94l-1.582.792a5 5 0 0 0-1.924 1.698l-1.024 1.536a3.671 3.671 0 0 1-6.11 0l-1.024-1.536a5 5 0 0 0-1.924-1.698l-1.582-.792a3 3 0 0 1-1.382-3.94l.601-1.304a5 5 0 0 0 0-4.19l-.6-1.305a3 3 0 0 1 1.382-3.94l1.582-.792a5 5 0 0 0 1.924-1.698z"></path></g>
        },
        Hangers: {
            viewBox: "0 0 24 24",
            content: <path fill="currentColor" d="M10.5 7.5a1.5 1.5 0 1 1 2.084 1.382c-.544.23-1.281.747-1.512 1.58l-.01.007l-8.574 6.86c-1.107.886-.48 2.671.937 2.671h17.15c1.418 0 2.044-1.785.937-2.671l-8.217-6.573c.022-.011.045-.022.069-.032A3.5 3.5 0 1 0 8.5 7.5a1 1 0 1 0 2 0m1.5 4.78L19.15 18H4.85z" />
        },
        Fireplace: {
            viewBox: "0 0 512 512",
            content: <path fill="currentColor" d="m133.2 25l-53.69 94H432.5l-53.7-94zM25 137v46h462v-46zm32 64v46h46v-46zm352 0v46h46v-46zm-171.4.6s-22 8.8-24 18.8c-4.6 22.8 33.9 60.8 33.9 60.8s-13.3-34.6-14.3-52.8c-.5-9.1 4.4-26.8 4.4-26.8m54.4 14.8c-6.1 40.2-11.2 83.7-45.9 100.2c-30.3 14.4-36.4-78.5-94.1-91.5c44.9 101.1-68.9 139.9 42.2 185.2h19.5c-24-25.9-34.4-90.8-34.4-90.8s30.2 72 62.5 74.2c15 1 33.5-30.2 33.5-30.2s5.9 29.8-.1 46.8H319c27.3-14.8 44.6-35.7 51.2-57.3c6.5-20.9 3-42.5-10.9-59.9c-8.6 51.8-21.4 62.8-55.1 74.1c36.6-44.7 20.2-119.2-12.2-150.8M57 265v46h46v-46zm352 0v46h46v-46zM57 329v78h46v-78zm352 0v78h46v-78zM25 425v62h462v-62z" />
        },
        Chairs: {
            viewBox: "0 0 448 512",
            content: <path fill="currentColor" d="M112 128c0-29.5 16.2-55 40-68.9V256h48V48h48v208h48V59.1c23.8 13.9 40 39.4 40 68.9v128h48V128C384 57.3 326.7 0 256 0h-64C121.3 0 64 57.3 64 128v128h48zm334.3 213.9l-10.7-32c-4.4-13.1-16.6-21.9-30.4-21.9H42.7c-13.8 0-26 8.8-30.4 21.9l-10.7 32C-5.2 362.6 10.2 384 32 384v112c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V384h256v112c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V384c21.8 0 37.2-21.4 30.3-42.1" />
        },
        Tables: {
            viewBox: "0 0 448 512",
            content: <path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64v384c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zm112 432h96c8.8 0 16 7.2 16 16s-7.2 16-16 16h-96c-8.8 0-16-7.2-16-16s7.2-16 16-16"></path>
        },
        Sofas: {
            viewBox: "0 0 24 24",
            content: <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M2 16v3m10-6V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-8 4V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"></path><path d="M20 9a2 2 0 0 0-2 2v2H6v-2a2 2 0 1 0-4 0v6h20v-6a2 2 0 0 0-2-2m2 7v3"></path></g>
        },
        Armchairs: {
            viewBox: "0 0 256 256",
            content: <path fill="currentColor" d="M212 92.23V72a36 36 0 0 0-36-36H80a36 36 0 0 0-36 36v20.23a36 36 0 0 0 0 71.55V200a12 12 0 0 0 12 12h144a12 12 0 0 0 12-12v-36.22a36 36 0 0 0 0-71.55M80 44h96a28 28 0 0 1 28 28v20.23A36 36 0 0 0 172 128v4H84v-4a36 36 0 0 0-32-35.77V72a28 28 0 0 1 28-28m128.3 112h-.3a4 4 0 0 0-4 4v40a4 4 0 0 1-4 4H56a4 4 0 0 1-4-4v-40a4 4 0 0 0-4-4h-.3A28 28 0 1 1 76 128v40a4 4 0 0 0 8 0v-28h88v28a4 4 0 0 0 8 0v-40a28 28 0 1 1 28.3 28" />
        },
        Beds: {
            viewBox: "0 0 512 512",
            content: <path fill="currentColor" d="M416 224H208v120.619h-22.154v-41A87.716 87.716 0 0 0 98.229 216H48v-64H16v344h32v-47.743l416 3.328V496h32V304a80.091 80.091 0 0 0-80-80M48 248h50.229a55.68 55.68 0 0 1 55.617 55.617v41H48Zm416 171.584l-416-3.328v-39.637h416Zm0-74.965H240V256h176a48.055 48.055 0 0 1 48 48Z" />
        },
        Storage: {
            viewBox: "0 0 24 24",
            content: <path fill="currentColor" d="M18 2a2 2 0 0 1 1.995 1.85L20 4v16a2 2 0 0 1-1.85 1.995L18 22H6a2 2 0 0 1-1.995-1.85L4 20V4a2 2 0 0 1 1.85-1.995L6 2zm-7 2H6v16h5zm7 0h-5v16h5zm-9 7a1 1 0 0 1 .117 1.993L9 13H8a1 1 0 0 1-.117-1.993L8 11zm7 0a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2z" />
        },
    };

    const iconData = icons[type];
    if (!iconData) return null;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox={iconData.viewBox}
        >
            {iconData.content}
        </svg>
    );
};


// ЗАМЕНИТЕ СТАРЫЙ МАССИВ НА ЭТОТ
export const categories = [
    { name: 'Все товары', value: 'Все товары' },
    { name: 'Стулья и табуреты', value: 'Стулья и табуреты', icon: 'Chairs' },
    { name: 'Шкафы и стеллажи', value: 'Шкафы и стеллажи', icon: 'Storage' },
    { name: 'Прикроватные тумбы', value: 'Прикроватные тумбы', icon: 'Storage' },
    { name: 'ТВ тумбы', value: 'ТВ тумбы', icon: 'TVStand' },
    { name: 'Рабочие столы', value: 'Рабочие столы', icon: 'Tables' },
    { name: 'Журнальные столики', value: 'Журнальные столики', icon: 'Tables' },
    { name: 'Комоды', value: 'Комоды', icon: 'Storage' },
    { name: 'Кровати', value: 'Кровати', icon: 'Beds' },
    { name: 'Комплекты', value: 'Комплекты', icon: 'ReadySet' },
    { name: 'Столы в прихожую', value: 'Столы в прихожую', icon: 'Tables' },
    { name: 'Туалетные столики', value: 'Туалетные столики', icon: 'Mirror' },
    { name: 'Обеденные столы', value: 'Обеденные столы', icon: 'Tables' },
];

const CategoryFilter = ({ activeCategory, setActiveCategory, isHomePage = false, navLinks = [], location = {}, layout = 'horizontal' }) => {


    // --- Логика для главной страницы (теперь это НАВИГАЦИЯ) ---
    if (isHomePage) {
        return (
            <div 
                className="bg-gray-800"
                style={{
                    backgroundImage: `url(${woodTexture})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* ИЗМЕНЕНИЕ ЗДЕСЬ: justify-between заменен на justify-center */}
                {/* justify-center, чтобы ссылки были по центру */}
                <div className="container mx-auto px-6 flex flex-wrap justify-center items-center">
                    {/* Ссылки меню */}
                    <nav className="flex flex-nowrap items-center gap-x-4 gap-y-2 py-3">
                        {navLinks.map(link => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-semibold transition-opacity ${
                                    location.pathname === link.path ? 'text-white' : 'text-gray-300 hover:opacity-80'
                                }`}
                                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        );
    }
    const containerClasses = layout === 'vertical'
        ? "flex flex-col space-y-2" // Вертикальный список для сайдбара
        : "flex flex-wrap justify-center gap-3 mb-12"; // Горизонтальный ряд для админки

    const displayedCategories = categories; 
    return (
        <div className={containerClasses}>
            {displayedCategories.map(category => (
                <button
                    key={category.name}
                    onClick={() => setActiveCategory(category.value)}
                    className={`flex items-center justify-center px-4 py-2 text-sm font-semibold border rounded-full transition-colors duration-300 w-full md:w-auto text-left md:text-center
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