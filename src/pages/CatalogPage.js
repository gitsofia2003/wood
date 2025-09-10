import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";

const CatalogPage = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(
        location.state?.selectedCategory || 'Все товары'
    );

    // Загрузка всех товаров
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

    // Фильтрация товаров при изменении категории
    useEffect(() => {
        if (activeCategory === 'Все товары') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(product => product.category === activeCategory));
        }
    }, [activeCategory, products]);

    return (
        <main className="container mx-auto px-6 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Каталог товаров</h1>
            
            <CategoryFilter
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />

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
                        <p>В этой категории пока нет товаров.</p>
                    </div>
                )
            )}
        </main>
    );
};

export default CatalogPage;