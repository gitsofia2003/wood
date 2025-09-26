import React, { useRef, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, query, where, writeBatch } from "firebase/firestore";

import CategoryFilter, { categories } from '../components/CategoryFilter';
import MaterialFilter from '../components/MaterialFilter';

const IMGBB_API_KEY = "c38b7ef21c516acf7c50c35d305a0c4a";
const availableMaterials = [
    { name: "Вишня", color: "#6D282B" },
    { name: "Бук", color: "#DAB88F" },
    { name: "Сандал", color: "#B07953" }
];

const formatNumberWithSpaces = (value) => {
    if (!value) return '';
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const handleFirestoreError = (error) => {
    if (error.code === 'permission-denied') {
        alert("Че самый умный? :) ");
    } else {
        console.error("Произошла ошибка Firestore: ", error);
        alert("Произошла непредвиденная ошибка. Подробности в консоли.");
    }
};

// НОВОЕ: Компонент модального окна для решения конфликтов
const DuplicateFileModal = ({ conflict, onResolve, applyToAll, setApplyToAll }) => {
    if (!conflict) return null;

    const { file } = conflict;

    const handleResolve = (resolution) => {
        onResolve(resolution);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-bold mb-4">Найден дубликат</h3>
                <p className="mb-4">Файл с именем <span className="font-semibold">{file.name}</span> уже существует в базе. Что вы хотите сделать?</p>
                
                <div className="flex items-center mb-6">
                    <input
                        id="applyToAll"
                        type="checkbox"
                        checked={applyToAll}
                        onChange={(e) => setApplyToAll(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="applyToAll" className="ml-2 block text-sm text-gray-900">
                        Применить ко всем последующим дубликатам
                    </label>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => handleResolve('skip')}
                        className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Пропустить
                    </button>
                    <button
                        onClick={() => handleResolve('replace')}
                        className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Заменить
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminPage = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', originalPrice: '', category: '', dimensions: '', material: '', description: '' });
    const [discount, setDiscount] = useState(0);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Все товары');
    const [activeMaterial, setActiveMaterial] = useState('Все материалы');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isDraft, setIsDraft] = useState(false);
    const [isBatchUpload, setIsBatchUpload] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [selectedPublished, setSelectedPublished] = useState([]);
    const [selectedDrafts, setSelectedDrafts] = useState([]);

    // НОВОЕ: Состояние для управления модальным окном конфликтов
    const [conflict, setConflict] = useState(null); // { file, existingDoc, resolve }
    const [applyToAll, setApplyToAll] = useState(false);


    useEffect(() => { if (isBatchUpload) { setIsDraft(true); } }, [isBatchUpload]);

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
            name: product.name || '',
            price: formatNumberWithSpaces(priceForEdit),
            originalPrice: formatNumberWithSpaces(originalPriceForEdit),
            category: product.category || '',
            dimensions: dimensionsForEdit,
            material: product.material || '',
            description: product.description || ''
        });
        setImagePreviews(product.images || []);
        setImageFiles([]);
        setIsDraft(product.status === 'draft');
        setIsBatchUpload(false);
        window.scrollTo(0, 0);
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setNewProduct({ name: '', price: '', originalPrice: '', category: '', dimensions: '', material: '', description: '' });
        setImageFiles([]);
        setImagePreviews([]);
        setDiscount(0);
        setIsDraft(false);
        setIsBatchUpload(false);
        setUploadProgress('');
    };

    // ИЗМЕНЕНИЕ: Полностью переработанная функция массовой загрузки
    const handleBatchSubmit = async () => {
        if (imageFiles.length === 0) {
            alert("Пожалуйста, выберите фотографии для массовой загрузки.");
            return;
        }

        setIsUploading(true);
        const totalFiles = imageFiles.length;
        let successfulUploads = 0;
        let skippedUploads = 0;
        let replacedUploads = 0; // Новый счетчик
        const failedFiles = [];
        
        let batchConflictDecision = null; // null | 'skip' | 'replace'
        setApplyToAll(false); // Сбрасываем чекбокс перед каждой загрузкой

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        for (const [index, file] of imageFiles.entries()) {
            setUploadProgress(`Обработка ${index + 1} из ${totalFiles}...`);
            
            try {
                const q = query(collection(db, "products"), where("originalFilename", "==", file.name));
                const existingFileSnapshot = await getDocs(q);
                let userChoice = null;

                if (!existingFileSnapshot.empty) {
                    if (batchConflictDecision) {
                        userChoice = batchConflictDecision;
                    } else {
                        // "Пауза" для ожидания решения пользователя
                        userChoice = await new Promise(resolve => {
                            setConflict({ file, existingDoc: existingFileSnapshot.docs[0], resolve });
                        });
                        if (applyToAll) {
                            batchConflictDecision = userChoice;
                        }
                        setConflict(null); // Прячем модальное окно
                    }

                    if (userChoice === 'skip') {
                        console.log(`Файл ${file.name} уже существует. Пропускаем по решению пользователя.`);
                        skippedUploads++;
                        continue;
                    }
                    
                    if (userChoice === 'replace') {
                        setUploadProgress(`Замена ${file.name}...`);
                        const formData = new FormData();
                        formData.append('image', file);
                        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
                        const result = await res.json();
                        if (!result.success) throw new Error(`Ошибка ImgBB для файла ${file.name}: ${result.error.message}`);
                        
                        const imageUrl = result.data.url;
                        const existingDocId = existingFileSnapshot.docs[0].id;
                        const productRef = doc(db, "products", existingDocId);
                        
                        // Заменяем массив изображений на новый и обновляем имя файла
                        await updateDoc(productRef, {
                            images: [imageUrl],
                            originalFilename: file.name
                        });
                        
                        replacedUploads++;
                        continue; // Переходим к следующему файлу
                    }
                }

                // Если дубликата нет или пользователь выбрал "заменить", продолжаем как обычно
                setUploadProgress(`Загрузка ${file.name}...`);
                const formData = new FormData();
                formData.append('image', file);
                const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
                const result = await res.json();

                if (!result.success) {
                    throw new Error(`Ошибка ImgBB для файла ${file.name}: ${result.error.message}`);
                }
                const imageUrl = result.data.url;
                
                const productData = {
                    name: newProduct.name ? `${newProduct.name} - ${file.name}` : `ЧЕРНОВИК: ${file.name}`,
                    price: newProduct.price ? formatNumberWithSpaces(newProduct.price) + ' ₽' : 'Цена по запросу',
                    category: newProduct.category || '',
                    description: newProduct.description || '',
                    dimensions: newProduct.dimensions || '',
                    material: newProduct.material || '',
                    images: [imageUrl],
                    status: 'draft',
                    originalFilename: file.name
                };
                await addDoc(collection(db, "products"), productData);
                successfulUploads++;

            } catch (error) {
                console.error(error); 
                failedFiles.push(file.name);
            }
            await delay(300);
        }

        let summaryMessage = `Массовая загрузка завершена!\nУспешно создано: ${successfulUploads} товаров.`;
        if (replacedUploads > 0) {
            summaryMessage += `\nЗаменено существующих: ${replacedUploads}.`;
        }
        if (skippedUploads > 0) {
            summaryMessage += `\nПропущено дубликатов: ${skippedUploads}.`;
        }
        if (failedFiles.length > 0) {
            summaryMessage += `\n\nНе удалось загрузить: ${failedFiles.length} файлов.`;
             if (failedFiles.length > 10) {
                summaryMessage += `\nПОЛНЫЙ СПИСОК СМОТРИТЕ В КОНСОЛИ РАЗРАБОТЧИКА (F12).`;
                console.error("Список файлов, которые не удалось загрузить:", failedFiles);
            } else {
                summaryMessage += `\nСписок: ${failedFiles.join(', ')}`;
            }
        }
        alert(summaryMessage);
        
        setIsUploading(false);
        cancelEdit();
        fetchProducts();
    };

    // ИЗМЕНЕНИЕ: Добавлена проверка на дубликаты для одиночной загрузки
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isBatchUpload) {
            await handleBatchSubmit();
            return;
        }
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

        // Проверка на дубликаты перед загрузкой (только для новых файлов при создании нового товара)
        if (!editingProduct && imageFiles.length > 0) {
            for (const file of imageFiles) {
                const q = query(collection(db, "products"), where("originalFilename", "==", file.name));
                const existingFileSnapshot = await getDocs(q);
                if (!existingFileSnapshot.empty) {
                    alert(`Ошибка: Файл с именем "${file.name}" уже существует в базе. Пожалуйста, переименуйте файл или выберите другой, чтобы избежать дубликатов.`);
                    return; // Прерываем отправку
                }
            }
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
                category: newProduct.category,
                dimensions: formattedDimensions,
                ...(newProduct.material && { material: newProduct.material }),
                ...(newProduct.description && { description: newProduct.description }),
                images: imageUrls,
                status: isDraft ? 'draft' : 'published',
            };
            
            // Сохраняем имя файла только если он один (для будущих проверок)
            if (!editingProduct && imageFiles.length === 1) {
                productData.originalFilename = imageFiles[0].name;
            }

            if (editingProduct) {
                const productRef = doc(db, "products", editingProduct.id);
                await updateDoc(productRef, productData);
            } else {
                await addDoc(collection(db, "products"), productData);
            }
            cancelEdit();
            fetchProducts();
        } catch (error) {
            handleFirestoreError(error);
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
            } catch (error) {
                handleFirestoreError(error);
            }
        }
    };
    
    const handleToggleSelection = (id, listType) => {
        const setSelection = listType === 'published' ? setSelectedPublished : setSelectedDrafts;
        setSelection(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (listType, productList) => {
        const setSelection = listType === 'published' ? setSelectedPublished : setSelectedDrafts;
        const currentSelection = listType === 'published' ? selectedPublished : selectedDrafts;
        if (currentSelection.length === productList.length && productList.length > 0) {
            setSelection([]);
        } else {
            setSelection(productList.map(p => p.id));
        }
    };
    
    const handleUnpublishSelected = async () => {
        if (selectedPublished.length === 0) return;
        if (!window.confirm(`Вы уверены, что хотите снять с публикации ${selectedPublished.length} товаров? Они будут перемещены в черновик.`)) return;
        try {
            const batch = writeBatch(db);
            selectedPublished.forEach(id => {
                const docRef = doc(db, "products", id);
                batch.update(docRef, { status: "draft" });
            });
            await batch.commit();
            setSelectedPublished([]);
            fetchProducts();
        } catch (error) {
            handleFirestoreError(error);
        }
    };

    const handleDeleteSelected = async (listType) => {
        const selection = listType === 'published' ? selectedPublished : selectedDrafts;
        const setSelection = listType === 'published' ? setSelectedPublished : setSelectedDrafts;
        if (selection.length === 0) return;
        if (!window.confirm(`Вы уверены, что хотите удалить ${selection.length} товаров? Это действие необратимо.`)) return;
        try {
            const batch = writeBatch(db);
            selection.forEach(id => {
                const docRef = doc(db, "products", id);
                batch.delete(docRef);
            });
            await batch.commit();
            setSelection([]);
            fetchProducts();
        } catch (error) {
            handleFirestoreError(error);
        }
    };

    const publishedProducts = products.filter(p => {
        if (p.status === 'draft') return false;
        const categoryMatch = activeCategory === 'Все товары' || p.category === activeCategory;
        const materialMatch = activeMaterial === 'Все материалы' || p.material === activeMaterial;
        return categoryMatch && materialMatch;
    });

    const draftProducts = products.filter(p => p.status === 'draft');

    return (
        <div className="container mx-auto px-6 py-12">
            {/* НОВОЕ: Рендер модального окна */}
            <DuplicateFileModal
                conflict={conflict}
                onResolve={(resolution) => conflict?.resolve(resolution)}
                applyToAll={applyToAll}
                setApplyToAll={setApplyToAll}
            />

            <h1 className="text-3xl font-bold mb-8">Админ-панель</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-12">
                <h2 className="text-2xl font-semibold mb-4">{editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ... остальная часть JSX формы без изменений ... */}
                    <input name="name" value={newProduct.name} onChange={handleInputChange} placeholder="Название товара (шаблон для масс)" className="p-2 border rounded" />
                    <div />
                    <input name="originalPrice" value={newProduct.originalPrice} onChange={handleInputChange} placeholder="Старая цена (шаблон)" className="p-2 border rounded" />
                    <input name="price" value={newProduct.price} onChange={handleInputChange} placeholder="Цена со скидкой (шаблон)" className="p-2 border rounded" />
                    {discount > 0 && ( <div className="md:col-span-2 text-center p-2 bg-green-100 text-green-800 rounded-md -mt-2"> Рассчитанная скидка: **{discount}%** </div> )}
                    <select name="category" value={newProduct.category} onChange={handleInputChange} className="p-2 border rounded">
                        <option value="" disabled>Выберите категорию</option>
                        {categories.filter(c => c.value !== 'Все товары').map(cat => ( <option key={cat.value} value={cat.value}>{cat.name}</option> ))}
                    </select>
                    <input name="dimensions" value={newProduct.dimensions} onChange={handleInputChange} placeholder="Размеры (шаблон)" className="p-2 border rounded" />
                    <select name="material" value={newProduct.material} onChange={handleInputChange} className="p-2 border rounded">
                        <option value="">Материал (необязательно)</option>
                        {availableMaterials.map(materialObj => (
                            <option key={materialObj.name} value={materialObj.name}>{materialObj.name}</option>
                        ))}
                    </select>
                    <textarea name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Описание (шаблон)" rows="4" className="md:col-span-2 p-2 border rounded"></textarea>
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
                    <div className="md:col-span-2 flex items-center gap-4">
                        <button type="submit" disabled={isUploading} className="w-full py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition-colors">
                            {isUploading ? (uploadProgress || 'Загрузка...') : (editingProduct ? 'Сохранить изменения' : 'Добавить товар')}
                        </button>
                        {editingProduct && ( <button type="button" onClick={cancelEdit} className="w-full py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Отмена</button> )}
                    </div>
                </form>
            </div>
            
            <div>
                <h2 className="text-2xl font-semibold mb-4">Список товаров</h2>
                <div className="mb-6"><CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} /></div>
                <div className="mb-6 flex justify-center"><MaterialFilter availableMaterials={availableMaterials} activeMaterial={activeMaterial} setActiveMaterial={setActiveMaterial} /></div>
                
                {isLoading ? <p>Загрузка...</p> : (
                    <div className="space-y-8">
                        {/* ... остальная часть JSX со списками товаров без изменений ... */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Публикации ({publishedProducts.length})</h3>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleSelectAll('published', publishedProducts)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400" disabled={publishedProducts.length === 0}>
                                        {selectedPublished.length === publishedProducts.length && publishedProducts.length > 0 ? 'Снять выделение' : 'Выделить все'}
                                    </button>
                                    {selectedPublished.length > 0 && (
                                        <>
                                            <button onClick={handleUnpublishSelected} className="text-sm font-semibold text-yellow-600 hover:text-yellow-800">Снять с публикации</button>
                                            <button onClick={() => handleDeleteSelected('published')} className="text-sm font-semibold text-red-600 hover:text-red-800">Удалить ({selectedPublished.length})</button>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {publishedProducts.length > 0 ? (
                                <div className="space-y-4">
                                    {publishedProducts.map(product => (
                                        <div key={product.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-4 flex-grow">
                                                <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                                                    checked={selectedPublished.includes(product.id)}
                                                    onChange={() => handleToggleSelection(product.id, 'published')}
                                                />
                                                <img src={product.images ? product.images[0] : 'https://via.placeholder.com/150'} alt={product.name} className="w-16 h-16 object-contain rounded-md bg-white ml-4" />
                                                <div><p className="font-bold">{product.name}</p><p className="text-sm text-gray-600">{product.category} - {product.price}</p></div>
                                            </div>
                                            <div className='flex gap-4 flex-shrink-0'>
                                                <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700 font-semibold">Редактировать</button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700 font-semibold">Удалить</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p className="text-gray-500">Нет опубликованных товаров, соответствующих фильтрам.</p>)}
                        </div>

                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Черновик ({draftProducts.length})</h3>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleSelectAll('drafts', draftProducts)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400" disabled={draftProducts.length === 0}>
                                         {selectedDrafts.length === draftProducts.length && draftProducts.length > 0 ? 'Снять выделение' : 'Выделить все'}
                                    </button>
                                    {selectedDrafts.length > 0 && (
                                        <button onClick={() => handleDeleteSelected('drafts')} className="text-sm font-semibold text-red-600 hover:text-red-800">Удалить ({selectedDrafts.length})</button>
                                    )}
                                </div>
                            </div>
                             {draftProducts.length > 0 ? (
                                <div className="space-y-4">
                                    {draftProducts.map(product => (
                                        <div key={product.id} className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg shadow-sm border-l-4 border-yellow-400">
                                            <div className="flex items-center gap-4 flex-grow">
                                                <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                                                    checked={selectedDrafts.includes(product.id)}
                                                    onChange={() => handleToggleSelection(product.id, 'drafts')}
                                                />
                                                <img src={product.images ? product.images[0] : 'https://via.placeholder.com/150'} alt={product.name} className="w-16 h-16 object-contain rounded-md bg-white ml-4" />
                                                <div>
                                                    <div className="flex items-center gap-2"><p className="font-bold">{product.name}</p><span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Черновик</span></div>
                                                    <p className="text-sm text-gray-600">{product.category || 'Нет категории'} - {product.price}</p>
                                                </div>
                                            </div>
                                            <div className='flex gap-4 flex-shrink-0'><button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700 font-semibold">Редактировать</button><button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700 font-semibold">Удалить</button></div>
                                        </div>
                                    ))}
                                </div>
                            ) : ( <p className="text-gray-500">Нет черновиков.</p> )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;