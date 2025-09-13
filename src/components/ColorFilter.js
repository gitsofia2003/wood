// src/components/ColorFilter.js

import React from 'react';

// Эта карта сопоставляет названия цветов с их HEX-кодами для стилей
const colorMap = {
    "Бежевый": "#F5F5DC",
    "Черный": "#000000",
    "Коричневый": "#A52A2A",
    "Серый": "#808080",
    "Белый": "#FFFFFF",
    "Красный": "#FF0000",
    "Синий": "#0000FF",
    "Зеленый": "#008000",
    "Желтый": "#FFFF00",
    "Розовый": "#FFC0CB",
    "Фиолетовый": "#800080",
    "Оранжевый": "#FFA500",
    "Серебристый": "#C0C0C0",
    "Золотистый": "#FFD700"
};

const ColorFilter = ({ availableColors, activeColor, setActiveColor }) => {
    return (
        <div className="flex flex-wrap justify-center items-center gap-3">
            {/* Кнопка для сброса фильтра */}
            <button
                onClick={() => setActiveColor('Все цвета')}
                className={`flex items-center justify-center w-5 h-5 rounded-full border text-xs font-semibold
                    ${activeColor === 'Все цвета' 
                        ? 'ring-2 ring-offset-2 ring-gray-800' 
                        : 'text-gray-500 hover:border-gray-400'
                    }`}
            >
                Все
            </button>

            {/* Рендерим кружки для каждого цвета */}
            {availableColors.map(colorName => (
                <button
                    key={colorName}
                    onClick={() => setActiveColor(colorName)}
                    title={colorName} // Всплывающая подсказка с названием цвета
                    className={`w-5 h-5 rounded-full border border-gray-300 transition-transform duration-200 hover:scale-110
                        ${activeColor === colorName ? 'ring-2 ring-offset-2 ring-gray-800' : ''}
                    `}
                    style={{ backgroundColor: colorMap[colorName] || '#FFFFFF' }}
                >
                    {/* Пусто, так как текст не нужен */}
                </button>
            ))}
        </div>
    );
};

export default ColorFilter;