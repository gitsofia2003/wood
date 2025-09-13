import React, { useState } from 'react';
import Slider from 'react-slick';

// --- ВАЖНО: Убедитесь, что стили для слайдера подключены ---
// --- Вы можете добавить эти строки сюда, если их нет в вашем главном файле (App.js или index.js) ---
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const ProductCard = ({ product }) => {
    // Состояние для отслеживания наведения курсора на карточку
    const [isHovered, setIsHovered] = useState(false);

    // Настройки для слайдера
    const sliderSettings = {
        dots: true, // Показываем точки для навигации
        infinite: true, // Бесконечный цикл
        speed: 500, // Скорость анимации
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: isHovered, // Автопроигрывание включается только при наведении
        autoplaySpeed: 2000, // Задержка между слайдами 2 секунды
        arrows: false, // Убираем стрелки, чтобы не загромождать карточку
        fade: true, // Плавное затухание вместо листания
    };

    // Проверяем, есть ли изображения
    const hasImages = product.images && product.images.length > 0;
    const mainImage = hasImages ? product.images[0] : 'https://via.placeholder.com/300x300.png?text=Фото+нет';

    return (
        // Добавляем обработчики наведения на всю карточку
        <div 
            className="bg-white group cursor-pointer flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="bg-sand p-2 rounded-md transition-shadow duration-300 group-hover:shadow-xl h-64 flex items-center justify-center">
                {/* Если у товара больше одного фото, показываем слайдер */}
                {hasImages && product.images.length > 1 ? (
                    <Slider {...sliderSettings} className="w-full h-full">
                        {product.images.map((image, index) => (
                            <div key={index} className="h-64 flex items-center justify-center">
                                <img src={image} alt={`${product.name} - фото ${index + 1}`} className="max-w-full max-h-full object-contain"/>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    // Если фото одно или их нет, показываем статичную картинку
                    <img src={mainImage} alt={product.name} className="max-w-full max-h-full object-contain"/>
                )}
            </div>
            <div className="pt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <hr className="my-2 border-gray-200"/>
                <p className="text-xl font-bold text-gray-800 my-2">{product.price}</p>
                <hr className="my-2 border-gray-200"/>
                <p className="text-xs text-gray-500 mt-2">габариты Д х Ш х В:</p>
                <p className="text-sm text-gray-700 font-medium">{product.dimensions}</p>
            </div>
        </div>
    );
};

export default ProductCard;