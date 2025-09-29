import React, {  useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, query, where, writeBatch } from "firebase/firestore";

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import CategoryFilter, { categories } from '../components/CategoryFilter';
import MaterialFilter from '../components/MaterialFilter';

// Стилизованные стрелки для слайдера
function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 transition-opacity`}
            style={{ ...style, right: '15px' }}
            onClick={onClick}
        >
            {/* ДОБАВЛЕНА SVG ИКОНКА */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </div>
    );
}

function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 transition-opacity`}
            style={{ ...style, left: '15px' }}
            onClick={onClick}
        >
            {/* ДОБАВЛЕНА SVG ИКОНКА */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
    );
}

const IMGBB_API_KEY = "bb1b30e68a10640df0cea07e56446401";
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

// Компонент модального окна для решения конфликтов
const DuplicateFileModal = ({ conflict, onResolve }) => {
    // Внутреннее состояние для чекбокса, чтобы не зависеть от родителя
    const [isApplyToAllChecked, setIsApplyToAllChecked] = useState(false);
    
    if (!conflict) return null;

    const { file } = conflict;

    const handleResolve = (choice) => {
        // Возвращаем объект с выбором и состоянием галочки
        onResolve({ choice, applyToAll: isApplyToAllChecked });
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
                        checked={isApplyToAllChecked}
                        onChange={(e) => setIsApplyToAllChecked(e.target.checked)}
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
    const [conflict, setConflict] = useState(null);
    const [showLargePreview, setShowLargePreview] = useState(false);
    const [isBatchPublish, setIsBatchPublish] = useState(false);

    useEffect(() => {
        // Логика показа большого превью при подготовке черновика к публикации
        if (editingProduct && !isDraft && imagePreviews.length > 0) {
            setShowLargePreview(true);
        } else {
            setShowLargePreview(false);
        }
    }, [editingProduct, isDraft, imagePreviews]);


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
        setShowLargePreview(false); 
    };

    const handleBatchSubmit = async () => {
        if (imageFiles.length === 0) {
            alert("Пожалуйста, выберите фотографии для массовой загрузки.");
            return;
        }

        if (isBatchPublish && !newProduct.category) {
            alert("Для массовой публикации необходимо выбрать категорию в форме.");
            setIsUploading(false);
            return;
        }

        setIsUploading(true);
        const totalFiles = imageFiles.length;
        let successfulUploads = 0;
        let skippedUploads = 0;
        let replacedUploads = 0; 
        const failedFiles = [];
        
        let batchConflictDecision = null;

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        for (const [index, file] of imageFiles.entries()) {
            setUploadProgress(`Обработка ${index + 1} из ${totalFiles}...`);
            
            try {
                const q = query(collection(db, "products"), where("originalFilename", "==", file.name));
                const existingFileSnapshot = await getDocs(q);
                
                if (!existingFileSnapshot.empty) {
                    let userChoice = batchConflictDecision;

                    if (!userChoice) { 
                        const userDecision = await new Promise(resolve => {
                            setConflict({ file, existingDoc: existingFileSnapshot.docs[0], resolve });
                        });
                        
                        setConflict(null);
                        
                        userChoice = userDecision.choice; 
                        if (userDecision.applyToAll) {
                            batchConflictDecision = userChoice;
                        }
                    }

                    if (userChoice === 'skip') {
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
                        
                        await updateDoc(productRef, {
                            images: [imageUrl],
                            originalFilename: file.name
                        });
                        
                        replacedUploads++;
                        continue; 
                    }
                }

                setUploadProgress(`Загрузка ${file.name}...`);
                const formData = new FormData();
                formData.append('image', file);
                const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
                const result = await res.json();

                if (!result.success) {
                    throw new Error(`Ошибка ImgBB для файла ${file.name}: ${result.error.message}`);
                }
                const imageUrl = result.data.url;
                
                // --- ИЗМЕНЕНИЕ ЗДЕСЬ: Логика создания данных о товаре ---
                const productData = {
                    // Если имя в шаблоне пустое, генерируем его из категории и имени файла
                    name: newProduct.name 
                        ? `${newProduct.name} - ${file.name.replace(/\.[^/.]+$/, "")}` 
                        : `${newProduct.category} - ${file.name.replace(/\.[^/.]+$/, "")}`,
                    
                    // Если цена в шаблоне пустая, ставим "Цена по запросу"
                    price: newProduct.price ? formatNumberWithSpaces(newProduct.price) + ' ₽' : 'Цена по запросу',
                    
                    // Категория берется из формы (мы уже проверили, что она есть)
                    category: newProduct.category,

                    // Другие данные берем из шаблона или ставим заглушки
                    description: newProduct.description || '',
                    dimensions: newProduct.dimensions || 'Размеры по запросу',
                    material: newProduct.material || '',
                    images: [imageUrl],

                    // Статус зависит от новой галочки
                    status: isBatchPublish ? 'published' : 'draft',
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

        if (!editingProduct && imageFiles.length > 0) {
            for (const file of imageFiles) {
                const q = query(collection(db, "products"), where("originalFilename", "==", file.name));
                const existingFileSnapshot = await getDocs(q);
                if (!existingFileSnapshot.empty) {
                    alert(`Ошибка: Файл с именем "${file.name}" уже существует в базе. Пожалуйста, переименуйте файл или выберите другой, чтобы избежать дубликатов.`);
                    return;
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

    const handleCategorySync = async () => {
        if (!window.confirm("Эта операция обновит категории у старых товаров до актуальных названий. Это может занять некоторое время. Продолжить?")) {
            return;
        }

        alert("Начинаю синхронизацию. Пожалуйста, не закрывайте страницу...");
        setIsLoading(true);

        // Здесь мы указываем, какие старые названия на какие новые нужно поменять
        // Вы можете добавлять сюда другие пары, если проблема повторится
        const nameMapping = {
            "Стулья и табуретки": "Стулья и табуреты", // Пример: старое название -> новое
            "Туалетные женские столики": "Туалетные столики",
            "Идеи комплектов": "Комплекты",
            "Тумбы под телевизор": "ТВ тумбы",
            "Столики для прихожей": "Столы в прихожую",
            // Добавьте другие, если нужно
        };

        try {
            const productsRef = collection(db, "products");
            const snapshot = await getDocs(productsRef);
            const batch = writeBatch(db);
            let updatedCount = 0;

            snapshot.docs.forEach(document => {
                const product = document.data();
                const currentCategory = product.category;

                // Если категория товара есть в нашем списке "старых" названий
                if (nameMapping[currentCategory]) {
                    const newCategory = nameMapping[currentCategory];
                    // И если она действительно отличается от новой
                    if (currentCategory !== newCategory) {
                        const docRef = doc(db, "products", document.id);
                        batch.update(docRef, { category: newCategory });
                        updatedCount++;
                    }
                }
            });

            if (updatedCount > 0) {
                await batch.commit();
                alert(`Синхронизация завершена! Обновлено ${updatedCount} товаров.`);
            } else {
                alert("Синхронизация завершена. Товаров для обновления не найдено.");
            }

            fetchProducts(); // Обновляем список товаров на странице
        } catch (error) {
            console.error("Ошибка синхронизации:", error);
            alert("Произошла ошибка во время синхронизации. Подробности в консоли.");
        } finally {
            setIsLoading(false);
        }
    };

    const publishedProducts = products.filter(p => {
        if (p.status === 'draft') return false;
        const categoryMatch = activeCategory === 'Все товары' || p.category === activeCategory;
        const materialMatch = activeMaterial === 'Все материалы' || p.material === activeMaterial;
        return categoryMatch && materialMatch;
    });

    const draftProducts = products.filter(p => p.status === 'draft');

    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <DuplicateFileModal
                conflict={conflict}
                onResolve={(resolution) => conflict?.resolve(resolution)}
            />

            <h1 className="text-3xl font-bold mb-8">Админ-панель</h1>
            {/* ИЗМЕНЕНИЕ: Полностью новый блок формы */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-12">
                <h2 className="text-2xl font-semibold mb-6">{editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Левая колонка - Фотографии */}
                        <div className="lg:w-1/2 flex flex-col">
                            <label className="block mb-2 text-sm font-medium">Фотографии товара</label>
                            {imagePreviews.length > 0 ? (
                                <div className="relative mb-4">
                                    <Slider {...sliderSettings}>
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img src={preview} alt={`Предпросмотр ${index + 1}`} className="w-full h-96 object-cover rounded-md border bg-gray-100" />
                                                <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold leading-none hover:bg-red-700 transition-colors z-20">&times;</button>
                                            </div>
                                        ))}
                                    </Slider>
                                </div>
                            ) : (
                                <div className="w-full h-96 flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-lg mb-4">
                                    <p className="text-gray-400">Изображения не загружены</p>
                                </div>
                            )}
                            <input id="image-upload" type="file" onChange={handleFileChange} multiple className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
                        </div>

                        {/* Правая колонка - Информация о товаре */}
                        <div className="lg:w-1/2 flex flex-col gap-4">
                            {showLargePreview && (
                                <div className="p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Предпросмотр публикации:</h3>
                                    <p className="text-xl font-bold text-gray-900">{newProduct.name || 'Название еще не указано'}</p>
                                    <p className="text-2xl font-bold text-red-600 mt-2">{newProduct.price ? (newProduct.price + ' ₽') : 'Цена не указана'}</p>
                                </div>
                            )}
                            <input name="name" value={newProduct.name} onChange={handleInputChange} placeholder="Название товара (шаблон для масс)" className="p-2 border rounded w-full" />
                            <div className="flex gap-4">
                                <input name="originalPrice" value={newProduct.originalPrice} onChange={handleInputChange} placeholder="Старая цена (шаблон)" className="p-2 border rounded w-1/2" />
                                <input name="price" value={newProduct.price} onChange={handleInputChange} placeholder="Цена со скидкой (шаблон)" className="p-2 border rounded w-1/2" />
                            </div>
                            {discount > 0 && ( <div className="text-center p-2 bg-green-100 text-green-800 rounded-md"> Рассчитанная скидка: **{discount}%** </div> )}
                            <div className="flex gap-4">
                                <select name="category" value={newProduct.category} onChange={handleInputChange} className="p-2 border rounded w-1/2">
                                    <option value="" disabled>Выберите категорию</option>
                                    {categories.filter(c => c.value !== 'Все товары').map(cat => ( <option key={cat.value} value={cat.value}>{cat.name}</option> ))}
                                </select>
                                <input name="dimensions" value={newProduct.dimensions} onChange={handleInputChange} placeholder="Размеры (шаблон)" className="p-2 border rounded w-1/2" />
                            </div>
                            <select name="material" value={newProduct.material} onChange={handleInputChange} className="p-2 border rounded w-full">
                                <option value="">Материал (необязательно)</option>
                                {availableMaterials.map(materialObj => (
                                    <option key={materialObj.name} value={materialObj.name}>{materialObj.name}</option>
                                ))}
                            </select>
                            <textarea name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Описание (шаблон)" rows="6" className="p-2 border rounded w-full"></textarea>
                        </div>
                    </div>

                    {/* Кнопки и чекбоксы под колонками */}
                    {/* Кнопки и чекбоксы под колонками */}
                    <div className="border-t mt-6 pt-6">
                        {/* Галочка для включения режима массовой загрузки */}
                        {!editingProduct && (
                            <div className="flex items-center mb-4">
                                <input id="isBatchUpload" type="checkbox" checked={isBatchUpload} onChange={(e) => setIsBatchUpload(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="isBatchUpload" className="ml-2 block text-sm font-bold text-gray-700">Загрузить каждое фото как отдельный товар</label>
                            </div>
                        )}

                        {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ --- */}
                        {/* В зависимости от режима, показываем РАЗНЫЕ галочки */}
                        {isBatchUpload ? (
                            // Новая галочка, которая появляется ТОЛЬКО при массовой загрузке
                            <div className="flex items-center mb-6">
                                <input id="isBatchPublish" type="checkbox" checked={isBatchPublish} onChange={(e) => setIsBatchPublish(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="isBatchPublish" className="ml-2 block text-sm text-gray-700">Опубликовать сразу (требуется категория)</label>
                            </div>
                        ) : (
                            // Старая галочка, которая показывается ТОЛЬКО при одиночной загрузке
                            <div className="flex items-center mb-6">
                                <input id="isDraft" type="checkbox" checked={isDraft} onChange={(e) => setIsDraft(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="isDraft" className="ml-2 block text-sm text-gray-700">Сохранить как черновик</label>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <button type="submit" disabled={isUploading} className="w-full py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition-colors">
                                {isUploading ? (uploadProgress || 'Загрузка...') : (editingProduct ? 'Сохранить изменения' : 'Добавить товар')}
                            </button>
                            {editingProduct && ( <button type="button" onClick={cancelEdit} className="w-full py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Отмена</button> )}
                        </div>
                    </div>
                </form>
            </div>
            
            <div>
                <h2 className="text-2xl font-semibold mb-4">Список товаров</h2>
                {/* --- НОВАЯ КНОПКА --- */}
                        <button 
                            onClick={handleCategorySync}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Синхронизировать категории
                        </button>
                    
                <div className="mb-6"><CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} /></div>
                <div className="mb-6 flex justify-center"><MaterialFilter availableMaterials={availableMaterials} activeMaterial={activeMaterial} setActiveMaterial={setActiveMaterial} /></div>
                
                {isLoading ? <p>Загрузка...</p> : (
                    <div className="space-y-8">
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