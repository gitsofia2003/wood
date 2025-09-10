import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";

// --- КОНФИГУРАЦИЯ IMGBB ---
// Я вставил ваш API ключ
const IMGBB_API_KEY = "a3b4e8feb7a0fba8a78002fdb5304fc0";
// ------------------------------------

const AdminPage = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', dimensions: '' });
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const fetchProducts = async () => {
        setIsLoading(true);
        const productSnapshot = await getDocs(collection(db, "products"));
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            alert("Пожалуйста, выберите изображение для товара.");
            return;
        }
        if (IMGBB_API_KEY === "ВАШ_API_КЛЮЧ") {
            alert("Ошибка: не настроен ключ API для загрузки изображений.");
            return;
        }
        setIsUploading(true);
        
        try {
            // 1. Загружаем фото в ImgBB
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error('Ошибка загрузки изображения');
            }
            
            const data = await response.json();
            const imageUrl = data.data.url; // Получаем ссылку на фото

            // 2. Добавляем данные о товаре в Firestore
            await addDoc(collection(db, "products"), {
                ...newProduct,
                image: imageUrl,
            });

            setNewProduct({ name: '', price: '', category: '', dimensions: '' });
            setImageFile(null);
            document.getElementById('image-upload').value = null;
            alert("Товар успешно добавлен!");
            fetchProducts();
        } catch (error) {
            console.error("Ошибка при добавлении товара: ", error);
            alert("Произошла ошибка. Попробуйте снова.");
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Вы уверены, что хотите удалить этот товар?")) {
            try {
                await deleteDoc(doc(db, "products", productId));
                alert("Товар удален!");
                fetchProducts();
            } catch (error) {
                console.error("Ошибка при удалении товара: ", error);
            }
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-8">Админ-панель</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-12">
                <h2 className="text-2xl font-semibold mb-4">Добавить новый товар</h2>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input name="name" value={newProduct.name} onChange={handleInputChange} placeholder="Название товара" required className="p-2 border rounded"/>
                    <input name="price" value={newProduct.price} onChange={handleInputChange} placeholder="Цена (например, 15 200 ₽)" required className="p-2 border rounded"/>
                    <input name="category" value={newProduct.category} onChange={handleInputChange} placeholder="Категория (например, Стулья)" required className="p-2 border rounded"/>
                    <input name="dimensions" value={newProduct.dimensions} onChange={handleInputChange} placeholder="Размеры (например, 45 x 50 x 95 см)" required className="p-2 border rounded"/>
                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium">Фотография товара</label>
                        <input id="image-upload" type="file" onChange={handleFileChange} required className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"/>
                    </div>
                    <button type="submit" disabled={isUploading} className="md:col-span-2 w-full py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400">
                        {isUploading ? 'Загрузка...' : 'Добавить товар'}
                    </button>
                </form>
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-4">Список товаров</h2>
                {isLoading ? <p>Загрузка...</p> : (
                    <div className="space-y-4">
                        {products.map(product => (
                            <div key={product.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
                                <div className="flex items-center gap-4">
                                    <img src={product.image} alt={product.name} className="w-16 h-16 object-contain rounded-md bg-white"/>
                                    <div>
                                        <p className="font-bold">{product.name}</p>
                                        <p className="text-sm text-gray-600">{product.category} - {product.price}</p>
                                    </div>
                                </div>
                                <div>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700 font-semibold">Удалить</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;