import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import MaterialFilter from '../components/MaterialFilter';
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
    const [activeMaterial, setActiveMaterial] = useState('Все материалы');

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
        if (activeMaterial !== 'Все материалы') {
            tempProducts = tempProducts.filter(product => product.material === activeMaterial);
        }

        setFilteredProducts(tempProducts);
    }, [activeCategory, activeMaterial, products]);

    return (
        <main className="container mx-auto px-6 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Каталог товаров</h1>
            
            <div className="mb-2">
                <CategoryFilter
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />
            </div>

            <div className="mb-12 flex justify-center">
                <MaterialFilter 
                    availableMaterials={availableMaterials}
                    activeMaterial={activeMaterial}
                    setActiveMaterial={setActiveMaterial}
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