import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import ColorFilter from '../components/ColorFilter'; // --- ИЗМЕНЕНИЕ: Импортируем новый компонент
import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";

// --- ИЗМЕНЕНИЕ: Список цветов, доступных для фильтрации
const availableColors = ["Бежевый", "Черный", "Коричневый", "Серый", "Белый", "Красный", "Синий", "Зеленый", "Желтый", "Розовый", "Фиолетовый", "Оранжевый", "Серебристый", "Золотистый"];

const CatalogPage = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [activeCategory, setActiveCategory] = useState(
        location.state?.selectedCategory || 'Все товары'
    );
    // --- ИЗМЕНЕНИЕ: Добавляем состояние для активного цвета
    const [activeColor, setActiveColor] = useState('Все цвета');

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const productsCollection = collection(db, "products");
                const productSnapshot = await getDocs(productsCollection);
                const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(productList);
            } catch (error) {
                console.error("Ошибка при загрузке товаров: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // --- ИЗМЕНЕНИЕ: Обновляем логику фильтрации
    useEffect(() => {
        let tempProducts = products;

        // Фильтрация по категории
        if (activeCategory !== 'Все товары') {
            tempProducts = tempProducts.filter(product => product.category === activeCategory);
        }

        // Фильтрация по цвету
        if (activeColor !== 'Все цвета') {
            tempProducts = tempProducts.filter(product => product.color === activeColor);
        }

        setFilteredProducts(tempProducts);
    }, [activeCategory, activeColor, products]);

    return (
        <main className="container mx-auto px-6 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Каталог товаров</h1>
            
            <div className="mb-2">
                <CategoryFilter
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />
            </div>

            {/* --- ИЗМЕНЕНИЕ: Добавляем фильтр по цветам */}
            <div className="mb-12">
                <ColorFilter 
                    availableColors={availableColors}
                    activeColor={activeColor}
                    setActiveColor={setActiveColor}
                />
            </div>

            {isLoading ? (
                <div className="text-center py-10">Загрузка товаров...</div>
            ) : (
                filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <p>По вашему запросу товаров не найдено.</p>
                    </div>
                )
            )}
        </main>
    );
};

export default CatalogPage;