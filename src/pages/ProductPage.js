import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import CallbackModal from '../components/CallbackModal';
import CategoryFilter from '../components/CategoryFilter';
import AvailableMaterials from '../components/AvailableMaterials';

// ИЗМЕНЕНИЕ: Карта цветов COLOR_MAP больше не нужна, так как мы используем материалы.
// Мы ее полностью удаляем.

// Компоненты для стрелок остаются без изменений
function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 transition-opacity`}
            style={{ ...style, right: '20px' }}
            onClick={onClick}
        ><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
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
    const [showCategories, setShowCategories] = useState(false);
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [discount, setDiscount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [mainSlider, setMainSlider] = useState(null);
    const [thumbSlider, setThumbSlider] = useState(null);

    useEffect(() => {
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
        slidesToShow: 1, slidesToScroll: 1, arrows: true, fade: true, asNavFor: thumbSlider, nextArrow: <NextArrow />, prevArrow: <PrevArrow />,
    };
    const thumbSliderSettings = {
        slidesToShow: 4, slidesToScroll: 1, asNavFor: mainSlider, dots: false, arrows: false, centerMode: false, focusOnSelect: true, vertical: true, verticalSwiping: true,
    };

    if (isLoading) return <div className="text-center py-20">Загрузка...</div>;
    if (!product) return <div className="text-center py-20">Товар не найден</div>;

    return (
        <>
            <div className="hidden lg:block bg-sand border-b border-gray-200">
                
                    
                
            </div>

            <main className="container mx-auto px-6 py-12">
                <div className="lg:hidden mb-4">
                    <button 
                        onClick={() => setShowCategories(!showCategories)}
                        className="w-full text-left font-semibold text-gray-600 p-2 border-b-2"
                    >
                        {product.category}
                        <span className={`float-right transition-transform ${showCategories ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {showCategories && (
                        <div className="py-4">
                            <CategoryFilter isHomePage={true} />
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col lg:flex-row lg:items-center gap-12">
                    <div className="lg:w-3/4 overflow-hidden">
                        {/* ИЗМЕНЕНИЕ: Вот та самая обертка.
                        - Классы lg:max-w-4xl и lg:mx-auto сработают ТОЛЬКО на экранах 'lg' и больше.
                        - На мобильных устройствах эти классы будут проигнорированы, и контейнер останется 100% ширины.
                        */}
                        <div className="flex gap-4 lg:max-w-4xl lg:mx-auto">
                            <div className="w-24 flex-shrink-0">
                                <Slider {...thumbSliderSettings} ref={slider => setThumbSlider(slider)}>
                                    {product.images.map((img, index) => (
                                        <div key={index} className="p-1 cursor-pointer">
                                            <img src={img} alt={`thumbnail ${index + 1}`} className="w-full h-auto object-cover rounded-md border"/>
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                            <div className="w-full overflow-hidden relative">
                                <Slider {...mainSliderSettings} ref={slider => setMainSlider(slider)}>
                                    {product.images.map((img, index) => (
                                        <div key={index} className="px-2">
                                            <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-auto max-h-[40vh] object-contain rounded-lg" loading="lazy" />
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        </div>
                    </div>

                    {/* --- MOBILE: отдельный упрощённый порядок */}
                    <div className="lg:hidden w-full">
                        <div className="flex items-start justify-between">
                            {discount > 0 && (
                                <span className="ml-4 inline-block bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                    Скидка {discount}%
                                </span>
                            )}
                        </div>

                        {/* ИЗМЕНЕНИЕ: Отображаем материал вместо цвета */}
                        <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                            <span>{product.category}</span>
                            {product.material && (
                                <>
                                    <span>&bull;</span>
                                    <span className="text-gray-700">{product.material}</span>
                                </>
                            )}
                        </div>

                        <div className="flex items-baseline gap-4 my-4">
                            {discount > 0 ? (
                                <>
                                    <span className="text-lg text-gray-400 line-through">{product.originalPrice}</span>
                                    <span className="text-2xl font-bold text-red-600">{product.price}</span>
                                </>
                            ) : (
                                <span className="text-2xl font-bold text-gray-800">{product.price}</span>
                            )}
                        </div>

                        {product.description && (
                            <div className="mt-2">
                                <h3 className="text-xl font-semibold mb-2">Описание</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
                            </div>
                        )}
                        <AvailableMaterials/>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 w-full py-4 px-8 bg-gray-800 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 transition duration-300"
                        >
                            Запросить звонок
                        </button>
                    </div>

                    {/* --- DESKTOP: оригинальный блок */}
                    <div className="hidden lg:block lg:w-1/4 lg:pl-8">
                        <p className="text-lg text-gray-500 mt-2">{product.category}</p>

                        {/* ИЗМЕНЕНИЕ: Отображаем материал вместо цвета */}
                        {product.material && (
                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-sm text-gray-600">Материал:</span>
                                <span className="text-sm text-gray-800 font-semibold">{product.material}</span>
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
                        <AvailableMaterials/>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="mt-8 w-full py-4 px-8 bg-gray-800 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 transition duration-300"
                        >
                            Запросить звонок
                        </button>
                    </div>
                </div>
            </main>

            {similarProducts.length > 0 && (
                <section className="bg-sand py-4 mt-8">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Похожие товары</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
                            {similarProducts.map(p => {
                                const original = p.originalPrice ? parseFloat(String(p.originalPrice).replace(/[^0-9]/g, '')) : 0;
                                const price = p.price ? parseFloat(String(p.price).replace(/[^0-9]/g, '')) : 0;
                                const d = original > price ? Math.round(((original - price) / original) * 100) : 0;
                                return (
                                    <Link key={p.id} to={`/product/${p.id}`} className="block">
                                        <div className="relative w-36 h-36 rounded-md overflow-hidden bg-white shadow-sm">
                                            <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                                            {d > 0 && (
                                                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">-{d}%</span>
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