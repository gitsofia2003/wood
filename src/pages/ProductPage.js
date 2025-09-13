// src/pages/ProductPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import CallbackModal from '../components/CallbackModal'; // Импортируем модальное окно

const ProductPage = () => {
    const { productId } = useParams(); // Получаем ID товара из URL
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [discount, setDiscount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для модального окна

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            const docRef = doc(db, "products", productId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const productData = { id: docSnap.id, ...docSnap.data() };
                setProduct(productData);

                // Расчет скидки
                if (productData.originalPrice && productData.price) {
                    const original = parseFloat(String(productData.originalPrice).replace(/[^0-9]/g, ''));
                    const sale = parseFloat(String(productData.price).replace(/[^0-9]/g, ''));
                    if (original > sale) {
                        setDiscount(Math.round(((original - sale) / original) * 100));
                    }
                }
            } else {
                console.log("Товар не найден!");
            }
            setIsLoading(false);
        };

        fetchProduct();
    }, [productId]);
    
    // Настройки для главного слайдера
    const sliderSettings = {
        dots: true,
        fade: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
    };

    if (isLoading) return <div className="text-center py-20">Загрузка...</div>;
    if (!product) return <div className="text-center py-20">Товар не найден</div>;

    return (
        <>
            <main className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Левая колонка: Фотографии */}
                    <div className="w-full">
                         <Slider {...sliderSettings}>
                            {product.images.map((img, index) => (
                                <div key={index}>
                                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-auto object-cover rounded-lg"/>
                                </div>
                            ))}
                        </Slider>
                    </div>

                    {/* Правая колонка: Информация */}
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>
                        <p className="text-lg text-gray-500 mt-2">{product.category}</p>
                        
                        {discount > 0 && (
                            <span className="inline-block bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full mt-4">
                                Скидка {discount}%
                            </span>
                        )}

                        <div className="flex items-baseline gap-4 my-6">
                            {discount > 0 ? (
                                <>
                                    <span className="text-2xl text-gray-400 line-through">{product.originalPrice}</span>
                                    <span className="text-4xl font-bold text-red-600">{product.price}</span>
                                </>
                            ) : (
                                <span className="text-4xl font-bold text-gray-800">{product.price}</span>
                            )}
                        </div>

                        {product.description && (
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Описание</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
                            </div>
                        )}

                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="mt-8 w-full py-4 px-8 bg-gray-800 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 transition duration-300"
                        >
                            Запросить обратный звонок
                        </button>
                    </div>
                </div>
            </main>

            {/* Модальное окно */}
            {isModalOpen && (
                <CallbackModal 
                    product={product} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </>
    );
};

export default ProductPage;