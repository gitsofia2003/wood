// src/components/MoodboardSection.js

import React from 'react';

// --- ОБНОВЛЕННАЯ СТРУКТУРА ДАННЫХ: Добавлены классы высоты ---
const galleryData = {
    leftColumn: [
        {
            id: 1,
            imageUrl: '/images/gallery-1.webp',
            heightClass: 'h-[32rem]', // <-- ВЫСОТА ЭТОЙ РАМКИ
            hotspots: [
                { id: '1a', position: { top: '55%', left: '50%' }, product: { name: 'Диван "Осло"', size: '220x95x80 см', price: '89 900 ₽' }}
            ]
        },
        {
            id: 2,
            imageUrl: '/images/gallery-2.webp',
            heightClass: 'h-[24rem]', // <-- ВЫСОТА ЭТОЙ РАМКИ
            hotspots: [
                { 
                    id: '2a', position: { top: '40%', left: '45%' }, product: { name: 'Кресло "Хюгге"', size: '80x85x90 см', price: '34 900 ₽' }
                }
            ]
        },
    ],
    middleColumn: [
        {
            id: 3,
            imageUrl: '/images/gallery-3.webp',
            heightClass: 'h-[28rem]', // <-- ВЫСОТА ЭТОЙ РАМКИ
            hotspots: [
                { id: '3a', position: { top: '60%', left: '30%' }, product: { name: 'Столик "Гекса"', size: '50x50x45 см', price: '8 900 ₽' }}
            ]
        },
        {
            id: 4,
            imageUrl: '/images/gallery-4.webp',
            heightClass: 'h-[36rem]', // <-- ВЫСОТА ЭТОЙ РАМКИ
            hotspots: [
                { id: '4a', position: { top: '50%', left: '65%' }, product: { name: 'Комод "Берген"', size: '160x45x80 см', price: '54 900 ₽' }}
            ]
        },
    ],
    rightColumn: [
        {
            id: 5,
            imageUrl: '/images/gallery-5.webp',
            heightClass: 'h-[24rem]', // <-- ВЫСОТА ЭТОЙ РАМКИ
            hotspots: [
                { id: '5a', position: { top: '50%', left: '35%' }, product: { name: 'Кровать "Лофт"', size: '180x200 см', price: '72 000 ₽' }}
            ]
        },
        {
            id: 6,
            imageUrl: '/images/gallery-6.webp',
            heightClass: 'h-[32rem]', // <-- ВЫСОТА ЭТОЙ РАМКИ
            hotspots: [
                { id: '6a', position: { top: '70%', left: '50%' }, product: { name: 'Стул "Сканди"', size: '45x50x85 см', price: '6 500 ₽' }}
            ]
        }
    ]
};

// --- ИЗМЕНЕНИЕ ЗДЕСЬ: Обновленный компонент Hotspot ---
const Hotspot = ({ position, product }) => (
    // Этот контейнер ТЕПЕРЬ виден на мобильных (opacity-100),
    // скрывается на десктопе (md:opacity-0)
    // и ПО-ПРЕЖНЕМУ появляется при наведении на десктопе (group-hover:opacity-100)
    <div
        // --- ВОТ ЭТА СТРОКА ИЗМЕНЕНА ---
        className="absolute opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 group/hotspot"
        style={{ top: position.top, left: position.left, transform: 'translate(-50%, -50%)' }}
    >
        {/* Это сама белая точка, которая видна и мерцает */}
        <div className="w-4 h-4 bg-white rounded-full cursor-pointer flex items-center justify-center">
            {/* Анимация пинга */}
            <div className="w-6 h-6 bg-white rounded-full animate-ping"></div>
        </div>

        {/* Это всплывающее окно, которое ПОЯВЛЯЕТСЯ при наведении на точку (group-hover/hotspot) */}
        {/* Его логика не менялась, на мобильном оно появится при тапе на точку */}
        <div className="absolute bottom-full mb-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl p-3 opacity-0 group-hover/hotspot:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            <p className="font-bold text-sm">{product.name}</p>
            <p className="text-xs text-gray-500">{product.size}</p>
            <p className="font-bold text-sm mt-1">{product.price}</p>
        </div>
    </div>
);

// --- ИСПРАВЛЕННЫЙ КОМПОНЕНТ GalleryItem ---
const GalleryItem = ({ item }) => (
    // Этот div является основной группой (group), на которую реагируют точки
    <div className={`relative rounded-lg overflow-hidden group bg-sand ${item.heightClass}`}>
        <img src={item.imageUrl} alt={`Gallery item ${item.id}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0">
            {item.hotspots.map(spot => (
                <Hotspot key={spot.id} position={spot.position} product={spot.product} />
            ))}
        </div>
    </div>
);
// Основной компонент секции
const MoodboardSection = () => {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Дизайнерские подборки
                    </h2>
                    <p className="mt-2 text-lg text-gray-500">
                        Готовые решения и уникальные предметы
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="flex flex-col gap-4">
                        {galleryData.leftColumn.map(item => <GalleryItem key={item.id} item={item} />)}
                    </div>

                    <div className="flex flex-col gap-4">
                        {galleryData.middleColumn.map(item => <GalleryItem key={item.id} item={item} />)}
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        {galleryData.rightColumn.map(item => <GalleryItem key={item.id} item={item} />)}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MoodboardSection;