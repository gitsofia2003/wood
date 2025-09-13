import React, { useState } from 'react';
import Slider from 'react-slick';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// --- ИЗМЕНЕНИЕ: Компоненты для кастомных стрелок ---
function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} z-10 w-8 h-8 flex items-center justify-center bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            style={{ ...style, right: '10px' }}
            onClick={onClick}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </div>
    );
}

function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} z-10 w-8 h-8 flex items-center justify-center bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            style={{ ...style, left: '10px' }}
            onClick={onClick}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
    );
}


const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: isHovered,
        autoplaySpeed: 2000,
        fade: true,
        // --- ИЗМЕНЕНИЕ: Включаем стрелки и передаем наши компоненты ---
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };

    const hasImages = product.images && product.images.length > 0;
    const mainImage = hasImages ? product.images[0] : 'https://via.placeholder.com/300x300.png?text=Фото+нет';

    return (
        <div 
            className="bg-white group cursor-pointer flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* --- ИЗМЕНЕНИЕ: Добавлены классы relative, group и overflow-hidden --- */}
            <div className="relative group bg-sand p-2 rounded-md transition-shadow duration-300 group-hover:shadow-xl h-64 flex items-center justify-center overflow-hidden">
                {hasImages && product.images.length > 1 ? (
                    <Slider {...sliderSettings} className="w-full h-full">
                        {product.images.map((image, index) => (
                            <div key={index} className="h-64 flex items-center justify-center">
                                <img src={image} alt={`${product.name} - фото ${index + 1}`} className="max-w-full max-h-full object-contain"/>
                            </div>
                        ))}
                    </Slider>
                ) : (
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