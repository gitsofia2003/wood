import React, { useState, useEffect } from 'react'; // ИЗМЕНЕНИЕ: убрали useRef
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import Slider from 'react-slick';
import CallbackModal from '../components/CallbackModal';
import ColorFilter from '../components/ColorFilter';
import CategoryFilter from '../components/CategoryFilter';
import InnerImageZoom from 'react-inner-image-zoom';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";


// карта соответствия названия цвета -> hex (пара значений, можно расширить)
const COLOR_MAP = {
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

// Компоненты для стрелок остаются без изменений
function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 transition-opacity`}
            style={{ ...style, right: '20px' }}
            onClick={onClick}
        ><svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
    );
}

function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 transition-opacity`}
            style={{ ...style, left: '20px' }}
            onClick={onClick}
        ><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></div>
    );
}

const ProductPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [discount, setDiscount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ИЗМЕНЕНИЕ 1: Используем useState вместо useRef для синхронизации слайдеров
    const [mainSlider, setMainSlider] = useState(null);
    const [thumbSlider, setThumbSlider] = useState(null);

    useEffect(() => {
        // Логика загрузки данных остается без изменений
        const fetchProductData = async () => {
            setIsLoading(true);
            setProduct(null);
            setSimilarProducts([]);

            const docRef = doc(db, "products", productId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const productData = { id: docSnap.id, ...docSnap.data() };
                setProduct(productData);

                if (productData.originalPrice && productData.price) {
                    const original = parseFloat(String(productData.originalPrice).replace(/[^0-9]/g, ''));
                    const sale = parseFloat(String(productData.price).replace(/[^0-9]/g, ''));
                    if (original > sale) {
                        setDiscount(Math.round(((original - sale) / original) * 100));
                    }
                }
                
                const q = query(
                    collection(db, "products"), 
                    where("category", "==", productData.category),
                    limit(5)
                );
                const similarSnapshot = await getDocs(q);
                const similarList = similarSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(p => p.id !== productId)
                    .slice(0, 4);
                
                setSimilarProducts(similarList);
            } else {
                console.log("Товар не найден!");
            }
            setIsLoading(false);
        };

        fetchProductData();
    }, [productId]);

    const mainSliderSettings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        fade: true,
        asNavFor: thumbSlider, // Связываем через state
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };

    const thumbSliderSettings = {
        slidesToShow: 4,
        slidesToScroll: 1,
        asNavFor: mainSlider, // Связываем через state
        dots: false,
        arrows: false,
        centerMode: false,
        focusOnSelect: true,
        vertical: true,
        verticalSwiping: true,
    };

    if (isLoading) return <div className="text-center py-20">Загрузка...</div>;
    if (!product) return <div className="text-center py-20">Товар не найден</div>;

    return (
        <>
            <div className="bg-sand border-b border-gray-200">
                <div className="container mx-auto">
                    <CategoryFilter isHomePage={true} />
                </div>
            </div>

            <main className="container mx-auto px-6 py-12">
                <div className="text-sm text-gray-500 mb-8">
                    <Link to="/" className="hover:underline">Главная</Link>
                    <span className="mx-2">/</span>
                    <Link to="/catalog" className="hover:underline">Каталог</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-800">{product.name}</span>
                </div>
                
                {/* ИЗМЕНЕНИЕ 2: Меняем пропорции колонок */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-12">
                    {/* Левая колонка: Галерея (75%) */}
                    <div className="lg:w-3/4 flex gap-4">
                        <div className="w-24 flex-shrink-0">
                           <Slider {...thumbSliderSettings} ref={slider => setThumbSlider(slider)}>
                                {product.images.map((img, index) => (
                                    <div key={index} className="p-1 cursor-pointer">
                                        {/* --- ИСПРАВЛЕНИЕ: Здесь ОБЫЧНАЯ КАРТИНКА (БЕЗ ЛУПЫ) --- */}
                                        <img src={img} alt={`thumbnail ${index + 1}`} className="w-full h-auto object-cover rounded-md border"/>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                        <div className="w-full overflow-hidden relative">
                           <Slider {...mainSliderSettings} ref={slider => setMainSlider(slider)}>
                                {product.images.map((img, index) => (
                                    <div key={index}>
                                        {/* --- ИСПРАВЛЕНИЕ: Здесь КОМПОНЕНТ С ЛУПОЙ --- */}
                                        <InnerImageZoom 
                                            src={img} 
                                            zoomSrc={img}
                                            alt={`${product.name} ${index + 1}`}
                                            zoomType="hover"
                                            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                                        />
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>

                    {/* Правая колонка: Информация (25%) — сдвинута вправо */}
                    <div className="lg:w-1/4 lg:pl-12">
                        <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>
                        <p className="text-lg text-gray-500 mt-2">{product.category}</p>

                        {/* компактный блок цвета (кружок + название) — перед описанием */}
                        {product.color && (
                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-sm text-gray-600">Цвет:</span>
                                <span
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: COLOR_MAP[product.color] || '#E5E7EB' }}
                                    aria-hidden="true"
                                />
                                <span className="text-sm text-gray-700">{product.color}</span>
                            </div>
                        )}

                        {discount > 0 && (
                            <span className="inline-block bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full mt-4">
                                Скидка {discount}%
                            </span>
                        )}
                        <div className="flex items-baseline gap-4 my-6">
                            {discount > 0 ? (
                                <>
                                    <span className="text-xl text-gray-400 line-through">{product.originalPrice}</span>
                                    <span className="text-2xl font-bold text-red-600">{product.price}</span>
                                </>
                            ) : (
                                <span className="text-2xl font-bold text-gray-800">{product.price}</span>
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
                            Запросить звонок
                        </button>
                    </div>
                </div>
            </main>

            {/* ИЗМЕНЕНИЕ 3: Уменьшены отступы секции */}
            {similarProducts.length > 0 && (
                <section className="bg-sand py-4 mt-8">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Похожие товары</h2>

                        {/* Компактная сетка: только картинка + бейдж скидки */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
                            {similarProducts.map(p => {
                                const original = p.originalPrice ? parseFloat(String(p.originalPrice).replace(/[^0-9]/g, '')) : 0;
                                const price = p.price ? parseFloat(String(p.price).replace(/[^0-9]/g, '')) : 0;
                                const d = original > price ? Math.round(((original - price) / original) * 100) : 0;

                                return (
                                    <Link key={p.id} to={`/product/${p.id}`} className="block">
                                        <div className="relative w-36 h-36 rounded-md overflow-hidden bg-white shadow-sm">
                                            <img
                                                src={p.images?.[0]}
                                                alt={p.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {d > 0 && (
                                                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    -{d}%
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {isModalOpen && <CallbackModal product={product} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default ProductPage;