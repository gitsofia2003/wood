import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} z-10 w-8 h-8 flex items-center justify-center bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            style={{ ...style, right: '10px' }}
            onClick={onClick}
        >
            <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        if (product.originalPrice && product.price) {
            const original = parseFloat(String(product.originalPrice).replace(/[^0-9]/g, ''));
            const sale = parseFloat(String(product.price).replace(/[^0-9]/g, ''));
            if (original > sale) {
                setDiscount(Math.round(((original - sale) / original) * 100));
            } else {
                setDiscount(0);
            }
        } else {
            setDiscount(0);
        }
    }, [product.originalPrice, product.price]);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: isHovered,
        autoplaySpeed: 2000,
        fade: true,
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };

    const hasImages = product.images && product.images.length > 0;
    const mainImage = hasImages ? product.images[0] : 'https://via.placeholder.com/300x300.png?text=Фото+нет';

    return (
        <Link to={`/product/${product.id}`}>
            <div 
                className="bg-white group flex flex-col h-full" // убираем cursor-pointer, добавляем h-full
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
            {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: Добавлены префиксы md: --- */}
                <div className="relative group transition-shadow duration-300 h-64 flex items-center justify-center overflow-hidden md:bg-white md:p-2 md:rounded-md md:group-hover:shadow-xl">
                    {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                            -{discount}%
                        </div>
                    )}
                    
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
                    <hr className="my-2 border-gray-200"/>
                    <div className="text-xl font-bold text-gray-800 my-2 h-8 flex justify-center items-center">
                        {discount > 0 ? (
                            <div className="flex justify-center items-baseline gap-2">
                                <span className="text-gray-400 line-through text-base font-normal">{product.originalPrice}</span>
                                <span className="text-red-600">{product.price}</span>
                            </div>
                        ) : (
                            <span>{product.price}</span>
                        )}
                    </div>
                    <hr className="my-2 border-gray-200"/>
                    <p className="text-xs text-gray-500 mt-2">габариты Д х Ш х В:</p>
                    <p className="text-sm text-gray-700 font-medium">{product.dimensions}</p>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;