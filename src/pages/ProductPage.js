import React, { useState, useEffect } from 'react'; // ИЗМЕНЕНИЕ: убрали useRef
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import CallbackModal from '../components/CallbackModal';
import ProductCard from '../components/ProductCard';

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
                    {/* Левая колонка: Галерея (увеличили до 2/3) */}
                    <div className="lg:w-2/3 flex gap-4">
                        <div className="w-24 flex-shrink-0">
                            <Slider {...thumbSliderSettings} ref={slider => setThumbSlider(slider)}>
                                {product.images.map((img, index) => (
                                    <div key={index} className="p-1 cursor-pointer">
                                        <img src={img} alt={`thumbnail ${index + 1}`} className="w-full h-auto object-cover rounded-md border"/>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                        <div className="w-full">
                            <Slider {...mainSliderSettings} ref={slider => setMainSlider(slider)}>
                                {product.images.map((img, index) => (
                                    <div key={index}>
                                        <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-auto object-cover rounded-lg"/>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>

                    {/* Правая колонка: Информация (уменьшили до 1/3) */}
                    <div className="lg:w-1/3">
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

            {/* ИЗМЕНЕНИЕ 3: Уменьшены отступы секции */}
            {similarProducts.length > 0 && (
                <section className="bg-sand py-10 mt-10">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Похожие товары</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {similarProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {isModalOpen && <CallbackModal product={product} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default ProductPage;