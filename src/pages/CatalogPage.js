import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

import { db } from '../firebase';
import { collection, getDocs, query, where } from "firebase/firestore";

const availableMaterials = [
    { name: "Вишня", color: "#6D282B" }, // темно-вишневый
    { name: "Бук", color: "#DAB88F" },   // светло-бежевый
    { name: "Сандал", color: "#B07953" } // теплый коричневый
];

const CatalogPage = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [activeCategory, setActiveCategory] = useState(location.state?.selectedCategory || 'Все товары');
    

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const productsRef = collection(db, "products");
                const q = query(productsRef, where("status", "==", "published"));
                const productSnapshot = await getDocs(q);
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

    useEffect(() => {
        let tempProducts = products;

        // Шаг 1: Фильтрация по категории
        if (activeCategory !== 'Все товары') {
            tempProducts = tempProducts.filter(product => product.category === activeCategory);
        }

        // Шаг 2: Фильтрация по материалу
        

        setFilteredProducts(tempProducts);
    }, [activeCategory,  products]);

    return (
        <main className="container mx-auto px-6 py-12">
            
            
            <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-12">

                {/* --- Левая колонка (основная) - Товары --- */}
                <div className="w-full md:w-3/4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Каталог товаров</h1>
                    {isLoading ? (
                        <div className="text-center py-10">Загрузка товаров...</div>
                    ) : (
                        filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
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
                </div>

                {/* --- Правая колонка (сайдбар) - Фильтр --- */}
                    <div className="w-full md:w-1/4 sticky top-32">
                    <h3 className="text-lg font-semibold mb-1">Категории</h3>
                    <CategoryFilter
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />
                </div>

            </div>
            
        </main>
    );
};

export default CatalogPage;