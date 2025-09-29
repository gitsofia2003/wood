import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, query, where, writeBatch } from "firebase/firestore";

// Импорты для загрузки в Selectel S3
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import CategoryFilter, { categories } from '../components/CategoryFilter';
import MaterialFilter from '../components/MaterialFilter';

// --- Вспомогательные компоненты и функции ---

function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div className={`${className} z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 transition-opacity`} style={{ ...style, right: '15px' }} onClick={onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
    );
}

function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div className={`${className} z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 transition-opacity`} style={{ ...style, left: '15px' }} onClick={onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </div>
    );
}

const availableMaterials = [ { name: "Вишня", color: "#6D282B" }, { name: "Бук", color: "#DAB88F" }, { name: "Сандал", color: "#B07953" } ];
const formatNumberWithSpaces = (value) => { if (!value) return ''; const n = value.replace(/[^0-9]/g, ''); return n.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
const handleFirestoreError = (error) => { if (error.code === 'permission-denied') { alert("Доступ запрещен."); } else { console.error("Ошибка Firestore: ", error); alert("Произошла ошибка."); } };

const DuplicateFileModal = ({ conflict, onResolve }) => {
    const [isApplyToAllChecked, setIsApplyToAllChecked] = useState(false);
    if (!conflict) return null;
    const { file } = conflict;
    const handleResolve = (choice) => { onResolve({ choice, applyToAll: isApplyToAllChecked }); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-bold mb-4">Найден дубликат</h3>
                <p className="mb-4">Файл с именем <span className="font-semibold">{file.name}</span> уже существует. Что делать?</p>
                <div className="flex items-center mb-6">
                    <input id="applyToAll" type="checkbox" checked={isApplyToAllChecked} onChange={(e) => setIsApplyToAllChecked(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <label htmlFor="applyToAll" className="ml-2 block text-sm text-gray-900">Применить ко всем</label>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={() => handleResolve('skip')} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Пропустить</button>
                    <button onClick={() => handleResolve('replace')} className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700">Заменить</button>
                </div>
            </div>
        </div>
    );
};

// --- Конфигурация S3 клиента для Selectel ---
const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME;
const REGION = process.env.REACT_APP_S3_REGION;
const ACCESS_KEY = process.env.REACT_APP_S3_ACCESS_KEY;
const SECRET_KEY = process.env.REACT_APP_S3_SECRET_KEY;

const s3Client = new S3Client({
    endpoint: `https://s3.${REGION}.storage.selcloud.ru`,
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
    },
    forcePathStyle: true,
});

// --- Функция загрузки файла в Selectel ---
const uploadFileToS3 = async (file) => {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const fileBuffer = await file.arrayBuffer();
    const params = {
        Bucket: BUCKET_NAME, Key: fileName, Body: fileBuffer, ContentType: file.type, ACL: 'public-read',
    };
    try {
        await s3Client.send(new PutObjectCommand(params));
        return `https://${BUCKET_NAME}.${REGION}.selstorage.ru/${fileName}`;
    } catch (error) {
        console.error("Ошибка при загрузке в S3:", error);
        throw error;
    }
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
    const [conflict, setConflict] = useState(null);
    const [showLargePreview, setShowLargePreview] = useState(false);
    const [isBatchPublish, setIsBatchPublish] = useState(false);

    useEffect(() => {
        if (editingProduct && !isDraft && imagePreviews.length > 0) { setShowLargePreview(true); } else { setShowLargePreview(false); }
    }, [editingProduct, isDraft, imagePreviews]);

    useEffect(() => {
        const original = parseFloat(String(newProduct.originalPrice).replace(/[^0-9]/g, ''));
        const sale = parseFloat(String(newProduct.price).replace(/[^0-9]/g, ''));
        if (original > 0 && sale > 0 && original > sale) { setDiscount(Math.round(((original - sale) / original) * 100)); } else { setDiscount(0); }
    }, [newProduct.price, newProduct.originalPrice]);

    const fetchProducts = async () => {
        setIsLoading(true);
        const productSnapshot = await getDocs(collection(db, "products"));
        setProducts(productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setIsLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);
    
    useEffect(() => {
        return () => { imagePreviews.forEach(preview => { if (preview.startsWith('blob:')) { URL.revokeObjectURL(preview); } }); };
    }, [imagePreviews]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'price' || name === 'originalPrice') {
            setNewProduct(p => ({ ...p, [name]: formatNumberWithSpaces(value) }));
        } else {
            setNewProduct(p => ({ ...p, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length === 0) return;
        setImageFiles(prev => [...prev, ...newFiles]);
        setImagePreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
        e.target.value = null;
    };

    const handleRemoveImage = (indexToRemove) => {
        const urlToRemove = imagePreviews[indexToRemove];
        if (urlToRemove.startsWith('blob:')) {
            const fileIndex = imagePreviews.filter(p => p.startsWith('blob:')).findIndex(p => p === urlToRemove);
            setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
            URL.revokeObjectURL(urlToRemove);
        }
        setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name || '',
            price: formatNumberWithSpaces(product.price ? String(product.price).replace(/[^0-9]/g, '') : ''),
            originalPrice: formatNumberWithSpaces(product.originalPrice ? String(product.originalPrice).replace(/[^0-9]/g, '') : ''),
            category: product.category || '',
            dimensions: product.dimensions ? String(product.dimensions).replace(/\s*см/i, '') : '',
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
        setShowLargePreview(false); 
        setIsBatchPublish(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isBatchUpload) { await handleBatchSubmit(); return; }
        if (!isDraft && !newProduct.category) { alert("Для публикации выберите Категорию."); return; }
        if (imagePreviews.length === 0) { alert("Добавьте хотя бы одно изображение."); return; }
        setIsUploading(true);
        setUploadProgress('Загрузка изображений...');
        try {
            let imageUrls = editingProduct ? imagePreviews.filter(p => !p.startsWith('blob:')) : [];
            if (imageFiles.length > 0) {
                const uploadPromises = imageFiles.map(file => uploadFileToS3(file));
                const newImageUrls = await Promise.all(uploadPromises);
                imageUrls = [...imageUrls, ...newImageUrls];
            }
            setUploadProgress('Сохранение данных...');
            const productData = {
                name: newProduct.name || '', // Имя остается, но может быть пустым
                price: newProduct.price ? formatNumberWithSpaces(newProduct.price) + ' ₽' : 'Цена по запросу',
                originalPrice: newProduct.originalPrice ? formatNumberWithSpaces(newProduct.originalPrice) + ' ₽' : '',
                category: newProduct.category,
                dimensions: newProduct.dimensions ? `${newProduct.dimensions.trim()} см` : '',
                material: newProduct.material || '',
                description: newProduct.description || '',
                images: imageUrls,
                status: isDraft ? 'draft' : 'published',
                originalFilename: imageFiles.length > 0 ? imageFiles[0].name : (editingProduct?.originalFilename || '')
            };
            if (editingProduct) {
                await updateDoc(doc(db, "products", editingProduct.id), productData);
            } else {
                await addDoc(collection(db, "products"), productData);
            }
            cancelEdit();
            fetchProducts();
        } catch (error) { handleFirestoreError(error); } finally { setIsUploading(false); setUploadProgress(''); }
    };
    
    const handleBatchSubmit = async () => {
        if (imageFiles.length === 0) { alert("Выберите фото для массовой загрузки."); return; }
        if (isBatchPublish && !newProduct.category) { alert("Для массовой публикации выберите категорию."); return; }
        setIsUploading(true);
        let successfulUploads = 0, skippedUploads = 0, replacedUploads = 0;
        const failedFiles = [];
        let batchConflictDecision = null;

        for (const [index, file] of imageFiles.entries()) {
            setUploadProgress(`Обработка ${index + 1} из ${imageFiles.length}...`);
            try {
                const q = query(collection(db, "products"), where("originalFilename", "==", file.name));
                const existingFileSnapshot = await getDocs(q);
                if (!existingFileSnapshot.empty) {
                    let userChoice = batchConflictDecision;
                    if (!userChoice) { 
                        const userDecision = await new Promise(resolve => setConflict({ file, resolve }));
                        setConflict(null);
                        userChoice = userDecision.choice; 
                        if (userDecision.applyToAll) { batchConflictDecision = userChoice; }
                    }
                    if (userChoice === 'skip') { skippedUploads++; continue; }
                    if (userChoice === 'replace') {
                        setUploadProgress(`Замена ${file.name}...`);
                        const imageUrl = await uploadFileToS3(file);
                        const docRef = doc(db, "products", existingFileSnapshot.docs[0].id);
                        await updateDoc(docRef, { images: [imageUrl], originalFilename: file.name });
                        replacedUploads++;
                        continue; 
                    }
                }
                setUploadProgress(`Загрузка ${file.name}...`);
                const imageUrl = await uploadFileToS3(file);
                const productData = {
                    name: newProduct.name ? `${newProduct.name} - ${file.name.replace(/\.[^/.]+$/, "")}` : '', // Имя по умолчанию пустое
                    price: newProduct.price ? formatNumberWithSpaces(newProduct.price) + ' ₽' : 'Цена по запросу',
                    category: newProduct.category,
                    description: newProduct.description || '',
                    dimensions: newProduct.dimensions || 'Размеры по запросу',
                    material: newProduct.material || '',
                    images: [imageUrl],
                    status: isBatchPublish ? 'published' : 'draft',
                    originalFilename: file.name
                };
                await addDoc(collection(db, "products"), productData);
                successfulUploads++;
            } catch (error) { console.error(error); failedFiles.push(file.name); }
        }
        alert(`Загрузка завершена!\nУспешно: ${successfulUploads}\nЗаменено: ${replacedUploads}\nПропущено: ${skippedUploads}\nОшибки: ${failedFiles.length}`);
        setIsUploading(false);
        cancelEdit();
        fetchProducts();
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Удалить этот товар?")) {
            try { await deleteDoc(doc(db, "products", productId)); fetchProducts(); } catch (error) { handleFirestoreError(error); }
        }
    };
    
    const handleToggleSelection = (id, listType) => {
        const setSelection = listType === 'published' ? setSelectedPublished : setSelectedDrafts;
        setSelection(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = (listType, productList) => {
        const setSelection = listType === 'published' ? setSelectedPublished : setSelectedDrafts;
        const currentSelection = listType === 'published' ? selectedPublished : selectedDrafts;
        if (currentSelection.length === productList.length && productList.length > 0) { setSelection([]); } else { setSelection(productList.map(p => p.id)); }
    };
    
    const handleUnpublishSelected = async () => {
        if (selectedPublished.length === 0 || !window.confirm(`Снять с публикации ${selectedPublished.length} товаров?`)) return;
        const batch = writeBatch(db);
        selectedPublished.forEach(id => batch.update(doc(db, "products", id), { status: "draft" }));
        await batch.commit();
        setSelectedPublished([]);
        fetchProducts();
    };

    const handleDeleteSelected = async (listType) => {
        const selection = listType === 'published' ? selectedPublished : selectedDrafts;
        if (selection.length === 0 || !window.confirm(`Удалить ${selection.length} товаров?`)) return;
        const batch = writeBatch(db);
        selection.forEach(id => batch.delete(doc(db, "products", id)));
        await batch.commit();
        (listType === 'published' ? setSelectedPublished : setSelectedDrafts)([]);
        fetchProducts();
    };

    const handleCategorySync = async () => {
        if (!window.confirm("Обновить категории у старых товаров?")) return;
        setIsLoading(true);
        const nameMapping = { "Стулья и табуретки": "Стулья и табуреты", "Туалетные женские столики": "Туалетные столики", "Идеи комплектов": "Комплекты", "Тумбы под телевизор": "ТВ тумбы", "Столики для прихожей": "Столы в прихожую" };
        const snapshot = await getDocs(collection(db, "products"));
        const batch = writeBatch(db);
        let updatedCount = 0;
        snapshot.docs.forEach(document => {
            const cat = document.data().category;
            if (nameMapping[cat] && cat !== nameMapping[cat]) {
                batch.update(document.ref, { category: nameMapping[cat] });
                updatedCount++;
            }
        });
        if (updatedCount > 0) { await batch.commit(); alert(`Обновлено ${updatedCount} товаров.`); } else { alert("Товаров для обновления не найдено."); }
        fetchProducts();
        setIsLoading(false);
    };

    const publishedProducts = products.filter(p => p.status !== 'draft' && (activeCategory === 'Все товары' || p.category === activeCategory) && (activeMaterial === 'Все материалы' || p.material === activeMaterial));
    const draftProducts = products.filter(p => p.status === 'draft');
    const sliderSettings = { dots: true, infinite: false, speed: 500, slidesToShow: 1, slidesToScroll: 1, nextArrow: <NextArrow />, prevArrow: <PrevArrow /> };

    return (
        <div className="container mx-auto px-6 py-12">
            <DuplicateFileModal conflict={conflict} onResolve={(res) => conflict?.resolve(res)} />
            <h1 className="text-3xl font-bold mb-8">Админ-панель</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-12">
                <h2 className="text-2xl font-semibold mb-6">{editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="lg:w-1/2 flex flex-col">
                            <label className="block mb-2 text-sm font-medium">Фотографии</label>
                            {imagePreviews.length > 0 ? (
                                <div className="relative mb-4"><Slider {...sliderSettings}>{imagePreviews.map((p, i) => (<div key={i} className="relative"><img src={p} alt={`Preview ${i}`} className="w-full h-96 object-cover rounded-md border" /><button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">&times;</button></div>))}</Slider></div>
                            ) : (
                                <div className="w-full h-96 flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-lg mb-4"><p className="text-gray-400">Изображения не загружены</p></div>
                            )}
                            <input id="image-upload" type="file" onChange={handleFileChange} multiple className="block w-full text-sm" />
                        </div>
                        <div className="lg:w-1/2 flex flex-col gap-4">
                            {showLargePreview && (
                                <div className="p-4 border-2 border-dashed border-blue-400 bg-blue-50"><h3 className="text-lg font-semibold mb-2">Предпросмотр публикации:</h3><p className="text-xl font-bold">{newProduct.name || 'Название?'}</p><p className="text-2xl font-bold text-red-600 mt-2">{newProduct.price ? `${newProduct.price} ₽` : 'Цена?'}</p></div>
                            )}
                            <input name="name" value={newProduct.name} onChange={handleInputChange} placeholder="Название товара (необязательно)" className="p-2 border rounded w-full" />
                            <div className="flex gap-4">
                                <input name="originalPrice" value={newProduct.originalPrice} onChange={handleInputChange} placeholder="Старая цена" className="p-2 border rounded w-1/2" />
                                <input name="price" value={newProduct.price} onChange={handleInputChange} placeholder="Цена" className="p-2 border rounded w-1/2" />
                            </div>
                            {discount > 0 && ( <div className="text-center p-2 bg-green-100 text-green-800 rounded-md">Скидка: {discount}%</div> )}
                            <div className="flex gap-4">
                                <select name="category" value={newProduct.category} onChange={handleInputChange} className="p-2 border rounded w-1/2"><option value="">Категория*</option>{categories.filter(c => c.value !== 'Все товары').map(cat => ( <option key={cat.value} value={cat.value}>{cat.name}</option> ))}</select>
                                <input name="dimensions" value={newProduct.dimensions} onChange={handleInputChange} placeholder="Размеры" className="p-2 border rounded w-1/2" />
                            </div>
                            <select name="material" value={newProduct.material} onChange={handleInputChange} className="p-2 border rounded w-full"><option value="">Материал</option>{availableMaterials.map(m => ( <option key={m.name} value={m.name}>{m.name}</option> ))}</select>
                            <textarea name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Описание" rows="6" className="p-2 border rounded w-full"></textarea>
                        </div>
                    </div>
                    <div className="border-t mt-6 pt-6">
                        {!editingProduct && (
                            <div className="flex items-center mb-4"><input id="isBatchUpload" type="checkbox" checked={isBatchUpload} onChange={(e) => setIsBatchUpload(e.target.checked)} className="h-4 w-4" /><label htmlFor="isBatchUpload" className="ml-2">Загрузить каждое фото как отдельный товар</label></div>
                        )}
                        {isBatchUpload ? (
                            <div className="flex items-center mb-6"><input id="isBatchPublish" type="checkbox" checked={isBatchPublish} onChange={(e) => setIsBatchPublish(e.target.checked)} className="h-4 w-4" /><label htmlFor="isBatchPublish" className="ml-2">Опубликовать сразу (требуется категория)</label></div>
                        ) : (
                            <div className="flex items-center mb-6"><input id="isDraft" type="checkbox" checked={isDraft} onChange={(e) => setIsDraft(e.target.checked)} className="h-4 w-4" /><label htmlFor="isDraft" className="ml-2">Сохранить как черновик</label></div>
                        )}
                        <div className="flex items-center gap-4">
                            <button type="submit" disabled={isUploading} className="w-full py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400">{isUploading ? (uploadProgress || 'Загрузка...') : (editingProduct ? 'Сохранить' : 'Добавить')}</button>
                            {editingProduct && ( <button type="button" onClick={cancelEdit} className="w-full py-3 bg-gray-200 rounded-md hover:bg-gray-300">Отмена</button> )}
                        </div>
                    </div>
                </form>
            </div>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Список товаров</h2>
                    <button onClick={handleCategorySync} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700">Синхронизировать категории</button>
                </div>
                <div className="mb-6"><CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} /></div>
                <div className="mb-6 flex justify-center"><MaterialFilter availableMaterials={availableMaterials} activeMaterial={activeMaterial} setActiveMaterial={setActiveMaterial} /></div>
                {isLoading ? <p>Загрузка...</p> : (
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Публикации ({publishedProducts.length})</h3>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleSelectAll('published', publishedProducts)} disabled={publishedProducts.length === 0} className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400">Выделить все</button>
                                    {selectedPublished.length > 0 && ( <> <button onClick={handleUnpublishSelected} className="text-sm font-semibold text-yellow-600 hover:text-yellow-800">Снять с публикации</button> <button onClick={() => handleDeleteSelected('published')} className="text-sm font-semibold text-red-600 hover:text-red-800">Удалить ({selectedPublished.length})</button> </> )}
                                </div>
                            </div>
                            {publishedProducts.length > 0 ? (
                                <div className="space-y-4">{publishedProducts.map(p => ( <div key={p.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"><div className="flex items-center gap-4 flex-grow"><input type="checkbox" className="h-5 w-5" checked={selectedPublished.includes(p.id)} onChange={() => handleToggleSelection(p.id, 'published')} /><img src={p.images?.[0]} alt={p.name || 'Товар'} className="w-16 h-16 object-contain rounded-md" /><div><p className="font-bold">{p.name || p.category}</p><p className="text-sm text-gray-600">{p.category} - {p.price}</p></div></div><div className='flex gap-4'><button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 font-semibold">Редактировать</button><button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700 font-semibold">Удалить</button></div></div> ))}</div>
                            ) : (<p className="text-gray-500">Нет опубликованных товаров, соответствующих фильтрам.</p>)}
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Черновик ({draftProducts.length})</h3>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleSelectAll('drafts', draftProducts)} disabled={draftProducts.length === 0} className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400">Выделить все</button>
                                    {selectedDrafts.length > 0 && ( <button onClick={() => handleDeleteSelected('drafts')} className="text-sm font-semibold text-red-600 hover:text-red-800">Удалить ({selectedDrafts.length})</button> )}
                                </div>
                            </div>
                             {draftProducts.length > 0 ? (
                                <div className="space-y-4">{draftProducts.map(p => ( <div key={p.id} className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400"><div className="flex items-center gap-4 flex-grow"><input type="checkbox" className="h-5 w-5" checked={selectedDrafts.includes(p.id)} onChange={() => handleToggleSelection(p.id, 'drafts')} /><img src={p.images?.[0]} alt={p.name || 'Товар'} className="w-16 h-16 object-contain rounded-md" /><div><p className="font-bold">{p.name || 'Черновик'}</p><p className="text-sm text-gray-600">{p.category || 'Нет категории'} - {p.price}</p></div></div><div className='flex gap-4'><button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 font-semibold">Редактировать</button><button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700 font-semibold">Удалить</button></div></div> ))}</div>
                            ) : ( <p className="text-gray-500">Нет черновиков.</p> )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
