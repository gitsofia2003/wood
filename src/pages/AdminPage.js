import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";

import CategoryFilter, { categories } from '../components/CategoryFilter';
import ColorFilter from '../components/ColorFilter';

const IMGBB_API_KEY = "a3b4e8feb7a0fba8a78002fdb5304fc0";
const availableColors = ["Бежевый", "Черный", "Коричневый", "Серый", "Белый", "Красный", "Синий", "Зеленый", "Желтый", "Розовый", "Фиолетовый", "Оранжевый", "Серебристый", "Золотистый"];

const formatNumberWithSpaces = (value) => {
    if (!value) return '';
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const AdminPage = () => {
    // ... все старые useState без изменений
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: '', price: '', originalPrice: '', category: '', dimensions: '', color: '', description: ''
    });
    const [discount, setDiscount] = useState(0);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Все товары');
    const [activeColor, setActiveColor] = useState('Все цвета');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isDraft, setIsDraft] = useState(false);
    
    // ИЗМЕНЕНИЕ 1: Состояния для новой фичи
    const [isBatchUpload, setIsBatchUpload] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    // ИЗМЕНЕНИЕ 2: Автоматически включаем режим "черновика", если выбрана массовая загрузка
    useEffect(() => {
        if (isBatchUpload) {
            setIsDraft(true);
        }
    }, [isBatchUpload]);


    useEffect(() => {
        const original = parseFloat(String(newProduct.originalPrice).replace(/[^0-9]/g, ''));
        const sale = parseFloat(String(newProduct.price).replace(/[^0-9]/g, ''));
        if (original > 0 && sale > 0 && original > sale) {
            setDiscount(Math.round(((original - sale) / original) * 100));
        } else {
            setDiscount(0);
        }
    }, [newProduct.price, newProduct.originalPrice]);

    const fetchProducts = async () => {
        setIsLoading(true);
        const productSnapshot = await getDocs(collection(db, "products"));
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
        setIsLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);
    
    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => {
                if (preview.startsWith('blob:')) {
                    URL.revokeObjectURL(preview);
                }
            });
        };
    }, [imagePreviews]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'price' || name === 'originalPrice') {
            setNewProduct(prevState => ({ ...prevState, [name]: formatNumberWithSpaces(value) }));
        } else {
            setNewProduct(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length === 0) return;
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImageFiles(prevFiles => [...prevFiles, ...newFiles]);
        setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
        e.target.value = null;
    };

    const handleRemoveImage = (indexToRemove) => {
        const urlToRemove = imagePreviews[indexToRemove];
        if (urlToRemove.startsWith('blob:')) {
            const fileIndex = imagePreviews.filter(p => p.startsWith('blob:')).findIndex(p => p === urlToRemove);
            setImageFiles(prevFiles => prevFiles.filter((_, index) => index !== fileIndex));
            URL.revokeObjectURL(urlToRemove);
        }
        setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        const priceForEdit = product.price ? String(product.price).replace(/[^0-9]/g, '') : '';
        const originalPriceForEdit = product.originalPrice ? String(product.originalPrice).replace(/[^0-9]/g, '') : '';
        const dimensionsForEdit = product.dimensions ? String(product.dimensions).replace(/\s*см/i, '') : '';
        setNewProduct({
            name: product.name || '', price: formatNumberWithSpaces(priceForEdit), originalPrice: formatNumberWithSpaces(originalPriceForEdit), category: product.category || '', dimensions: dimensionsForEdit, color: product.color || '', description: product.description || ''
        });
        setImagePreviews(product.images || []);
        setImageFiles([]);
        setIsDraft(product.status === 'draft');
        setIsBatchUpload(false); // Выключаем массовую загрузку в режиме редактирования
        window.scrollTo(0, 0);
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setNewProduct({ name: '', price: '', originalPrice: '', category: '', dimensions: '', color: '', description: '' });
        setImageFiles([]);
        setImagePreviews([]);
        setDiscount(0);
        setIsDraft(false);
        setIsBatchUpload(false); // Сбрасываем и эту галочку
        setUploadProgress(''); // И прогресс
    };

    // ИЗМЕНЕНИЕ 3: Выносим логику массовой загрузки в отдельную функцию для чистоты
    const handleBatchSubmit = async () => {
        if (imageFiles.length === 0) {
            alert("Пожалуйста, выберите фотографии для массовой загрузки.");
            return;
        }

        setIsUploading(true);
        let createdCount = 0;

        try {
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                setUploadProgress(`Загрузка ${i + 1} из ${imageFiles.length}...`);

                // Шаг 1: Загружаем фото на хостинг
                const formData = new FormData();
                formData.append('image', file);
                const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
                const result = await res.json();
                if (!result.data || !result.data.url) {
                    console.warn(`Не удалось загрузить файл ${file.name}, пропускаем.`);
                    continue; // Пропускаем этот файл, если он не загрузился
                }
                const imageUrl = result.data.url;

                // Шаг 2: Готовим данные для нового товара-черновика
                const productData = {
                    name: newProduct.name ? `${newProduct.name} #${i + 1}` : `ЧЕРНОВИК: Товар #${Date.now() + i}`,
                    price: newProduct.price ? formatNumberWithSpaces(newProduct.price) + ' ₽' : 'Цена по запросу',
                    category: newProduct.category || '',
                    description: newProduct.description || '',
                    dimensions: newProduct.dimensions || '',
                    color: newProduct.color || '',
                    images: [imageUrl], // Только одно это фото
                    status: 'draft',
                };

                // Шаг 3: Сохраняем товар в Firestore
                await addDoc(collection(db, "products"), productData);
                createdCount++;
            }
            alert(`Массовая загрузка завершена! Успешно создано ${createdCount} товаров.`);
        } catch (error) {
            console.error("Ошибка при массовой загрузке: ", error);
            alert(`Произошла ошибка. Успешно создано ${createdCount} товаров. Подробности в консоли.`);
        } finally {
            setIsUploading(false);
            cancelEdit();
            fetchProducts();
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Если активна массовая загрузка, используем новую логику и выходим
        if (isBatchUpload) {
            await handleBatchSubmit();
            return;
        }

        // --- Старая логика для одиночного товара ---
        if (!isDraft) {
            if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.dimensions) {
                alert("Для публикации товара, пожалуйста, заполните все обязательные поля: Название, Цена, Категория, Размеры.");
                return;
            }
        }
        if (imagePreviews.length === 0) {
            alert("Товар должен иметь хотя бы одно изображение.");
            return;
        }
        
        setIsUploading(true);
        setUploadProgress('Загрузка изображений...');
        try {
            let imageUrls = editingProduct ? imagePreviews.filter(p => !p.startsWith('blob:')) : [];
            if (imageFiles.length > 0) {
                const uploadPromises = imageFiles.map(file => {
                    const formData = new FormData();
                    formData.append('image', file);
                    return fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData }).then(res => res.json());
                });
                const uploadResults = await Promise.all(uploadPromises);
                const newImageUrls = uploadResults.map(result => result.data.url);
                imageUrls = [...imageUrls, ...newImageUrls];
            }
            setUploadProgress('Сохранение данных...');

            let formattedPrice = String(newProduct.price).replace(/[^0-9]/g, ''); 
            formattedPrice = new Intl.NumberFormat('ru-RU').format(formattedPrice) + ' ₽'; 

            let formattedOriginalPrice = null;
            if (newProduct.originalPrice) {
                formattedOriginalPrice = String(newProduct.originalPrice).replace(/[^0-9]/g, '');
                formattedOriginalPrice = new Intl.NumberFormat('ru-RU').format(formattedOriginalPrice) + ' ₽';
            }

            let formattedDimensions = newProduct.dimensions.trim();
            if (formattedDimensions && !formattedDimensions.toLowerCase().endsWith('см')) {
                formattedDimensions += ' см';
            }

            const productData = {
                name: isDraft && !newProduct.name ? 'ЧЕРНОВИК: Новый товар' : newProduct.name,
                price: isDraft && !newProduct.price ? 'Цена по запросу' : formattedPrice,
                ...(formattedOriginalPrice && { originalPrice: formattedOriginalPrice }),
                category: newProduct.category, dimensions: formattedDimensions,
                ...(newProduct.color && { color: newProduct.color }),
                ...(newProduct.description && { description: newProduct.description }),
                images: imageUrls,
                status: isDraft ? 'draft' : 'published',
            };
            if (editingProduct) {
                const productRef = doc(db, "products", editingProduct.id);
                await updateDoc(productRef, productData);
            } else {
                await addDoc(collection(db, "products"), productData);
            }
            cancelEdit();
            fetchProducts();
        } catch (error) {
            console.error("Ошибка: ", error);
            alert("Произошла ошибка. Подробности в консоли.");
        } finally {
            setIsUploading(false);
            setUploadProgress('');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Вы уверены, что хотите удалить этот товар?")) {
            try {
                await deleteDoc(doc(db, "products", productId));
                fetchProducts();
            } catch (error) { console.error("Ошибка при удалении товара: ", error); }
        }
    };

    const filteredProducts = products.filter(product => {
        const categoryMatch = activeCategory === 'Все товары' || product.category === activeCategory;
        const colorMatch = activeColor === 'Все цвета' || product.color === activeColor;
        return categoryMatch && colorMatch;
    });

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-8">Админ-панель</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-12">
                <h2 className="text-2xl font-semibold mb-4">{editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Поля ввода */}
                    <input name="name" value={newProduct.name} onChange={handleInputChange} placeholder="Название товара (шаблон для масс)" className="p-2 border rounded" />
                    <div />
                    <input name="originalPrice" value={newProduct.originalPrice} onChange={handleInputChange} placeholder="Старая цена (шаблон)" className="p-2 border rounded" />
                    <input name="price" value={newProduct.price} onChange={handleInputChange} placeholder="Цена со скидкой (шаблон)" className="p-2 border rounded" />
                    {discount > 0 && ( <div className="md:col-span-2 text-center p-2 bg-green-100 text-green-800 rounded-md -mt-2"> Рассчитанная скидка: **{discount}%** </div> )}
                    <select name="category" value={newProduct.category} onChange={handleInputChange} className="p-2 border rounded"> <option value="" disabled>Выберите категорию (шаблон)</option> {categories.filter(c => c.value !== 'Все товары').map(cat => ( <option key={cat.value} value={cat.value}>{cat.name}</option> ))} </select>
                    <input name="dimensions" value={newProduct.dimensions} onChange={handleInputChange} placeholder="Размеры (шаблон)" className="p-2 border rounded" />
                    <select name="color" value={newProduct.color} onChange={handleInputChange} className="p-2 border rounded"> <option value="">Цвет (шаблон)</option> {availableColors.map(color => ( <option key={color} value={color}>{color}</option> ))} </select>
                    <textarea name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Описание (шаблон)" rows="4" className="md:col-span-2 p-2 border rounded"></textarea>
                    
                    {/* Загрузка фото */}
                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium">Фотографии товара</label>
                        <input id="image-upload" type="file" onChange={handleFileChange} multiple className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
                        {imagePreviews.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img src={preview} alt={`Предпросмотр ${index + 1}`} className="w-24 h-24 object-cover rounded-md border" />
                                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold leading-none hover:bg-red-700 transition-colors">&times;</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Галочки управления */}
                    {!editingProduct && (
                        <div className="md:col-span-2 flex items-center my-2">
                            <input id="isBatchUpload" type="checkbox" checked={isBatchUpload} onChange={(e) => setIsBatchUpload(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <label htmlFor="isBatchUpload" className="ml-2 block text-sm font-bold text-gray-700">Загрузить каждое фото как отдельный товар</label>
                        </div>
                    )}
                    <div className="md:col-span-2 flex items-center -mt-2">
                        <input id="isDraft" type="checkbox" checked={isDraft} onChange={(e) => setIsDraft(e.target.checked)} disabled={isBatchUpload} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-200" />
                        <label htmlFor="isDraft" className="ml-2 block text-sm text-gray-700">Сохранить как черновик (можно без данных)</label>
                    </div>
                    
                    {/* Кнопки */}
                    <div className="md:col-span-2 flex items-center gap-4">
                        <button type="submit" disabled={isUploading} className="w-full py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition-colors">
                            {isUploading ? (uploadProgress || 'Загрузка...') : (editingProduct ? 'Сохранить изменения' : 'Добавить товар')}
                        </button>
                        {editingProduct && ( <button type="button" onClick={cancelEdit} className="w-full py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Отмена</button> )}
                    </div>
                </form>
            </div>
            
            {/* Список товаров */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Список товаров</h2>
                <div className="mb-6"><CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} /></div>
                <div className="mb-6"><ColorFilter availableColors={availableColors} activeColor={activeColor} setActiveColor={setActiveColor} /></div>
                {isLoading ? <p>Загрузка...</p> : (
                    <div className="space-y-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
                                <div className="flex items-center gap-4">
                                    <img src={product.images ? product.images[0] : 'https://via.placeholder.com/150'} alt={product.name} className="w-16 h-16 object-contain rounded-md bg-white" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold">{product.name}</p>
                                            {product.status === 'draft' && (<span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Черновик</span>)}
                                        </div>
                                        <p className="text-sm text-gray-600">{product.category} - {product.price}</p>
                                    </div>
                                </div>
                                <div className='flex gap-4'>
                                    <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700 font-semibold">Редактировать</button>
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