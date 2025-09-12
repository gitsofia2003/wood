import React, { useRef, useEffect, useState, useCallback } from 'react'; // Добавлен useCallback
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import ContactFormSection from './email';

import MoodboardSection from '../components/MoodboardSection';
import CategoryFilter from '../components/CategoryFilter';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ===================================================================================
// 1. Компоненты для кастомных стрелок (Используются ТОЛЬКО в десктопной версии)
//    - Эти стрелки делают навигацию главного слайдера более стильной.
// ===================================================================================
function NextArrow(props) {
    const { className, onClick } = props;
    return (
        <div className={`${className} custom-arrow next-arrow`} onClick={onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </div>
    );
}

function PrevArrow(props) {
    const { className, onClick } = props;
    return (
        <div className={`${className} custom-arrow prev-arrow`} onClick={onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
    );
}

// ===================================================================================
// 2. Данные для главного слайдера (Используются и в десктопной, и в мобильной версии)
//    - Содержат информацию о каждом баннере: тип, цвета, заголовки, изображения.
//    - Для баннеров с галереями (`nested-horizontal`, `nested-vertical`)
//      мобильная версия будет брать только ПЕРВОЕ изображение из `nestedSlides`.
// ===================================================================================
const mainSlidesData = [
    { type: 'simple', id: 'banner1', bgColor: 'bg-blue-100', title: 'Мебель на отлично!', subtitle: 'Всё для учёбы и работы', image: '/images/banner-1-bg.jpg' },
    { type: 'nested-horizontal', id: 'banner2', bgColor: 'bg-orange-100', title: 'Уют в каждой комнате', subtitle: 'Листайте, чтобы увидеть больше', nestedSlides: [{ id: 'b2s1', image: '/images/nested-1.jpg' }, { id: 'b2s2', image: '/images/nested-2.jpg' }, { id: 'b2s3', image: '/images/nested-3.jpg' }] },
    { type: 'nested-vertical', id: 'banner3', bgColor: 'bg-teal-100', title: 'Новая коллекция', subtitle: 'Вертикальный взгляд на стиль', nestedSlides: [{ id: 'b3s1', image: '/images/new-vertical-1.jpg' }, { id: 'b3s2', image: '/images/new-vertical-2.jpg' }, { id: 'b3s3', image: '/images/new-vertical-3.jpg' }] }
];

// ===================================================================================
// 3. Кастомный хук `useIsMobile`
//    - Определяет, является ли текущее устройство мобильным (по ширине экрана).
//    - Переключается между мобильной и десктопной версиями при изменении размера окна.
// ===================================================================================
const useIsMobile = (breakpoint = 768) => { // breakpoint - точка переключения (по умолчанию 768px для MD в Tailwind)
    const [isMobile, setIsMobile] = useState(false); // Изначально предполагаем десктоп, чтобы избежать "прыжка"
                                                    // после загрузки на больших экранах.

    // Используем useCallback, чтобы функция handleResize не менялась на каждый рендер.
    const handleResize = useCallback(() => {
        setIsMobile(window.innerWidth < breakpoint);
    }, [breakpoint]);

    useEffect(() => {
        // Устанавливаем начальное значение после монтирования компонента
        handleResize(); 
        window.addEventListener('resize', handleResize);
        // Очищаем слушатель при размонтировании компонента
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]); // Зависимость от handleResize, которая стабильна благодаря useCallback

    return isMobile;
};

// ===================================================================================
// 4. Основной компонент HomePage
//    - Содержит всю логику и JSX для рендеринга главной страницы.
// ===================================================================================
const HomePage = () => {
    // Определяем, мобильное ли устройство, используя наш хук
    const isMobile = useIsMobile();

    // ===============================================================================
    // Хуки и состояния для ДЕСКТОПНОЙ версии (не выполняются, если isMobile = true)
    // ===============================================================================
    const mainSliderRef = useRef(null); // Ref для доступа к методам главного слайдера (slickNext, slickPause и т.д.)
    const nestedHSliderRef = useRef(null); // Ref для горизонтального вложенного слайдера
    const nestedVSliderRef = useRef(null); // Ref для вертикального вложенного слайдера

    const [currentBannerIndex, setCurrentBannerIndex] = useState(0); // Индекс активного главного баннера
    const [nestedSlideIndex, setNestedSlideIndex] = useState(0);     // Индекс активного слайда в горизонтальной галерее
    const [nestedVerticalSlideIndex, setNestedVerticalSlideIndex] = useState(0); // Индекс активного слайда в вертикальной галерее

    // Логика автоматического переключения ГЛАВНОГО слайдера для "простого" баннера
    // Выполняется только если НЕ мобильная версия
    useEffect(() => {
        if (isMobile) return; // Пропустить, если мобильная версия
        const currentBanner = mainSlidesData[currentBannerIndex];
        let timerId;
        if (currentBanner.type === 'simple') {
            timerId = setTimeout(() => {
                if (mainSliderRef.current) mainSliderRef.current.slickNext();
            }, 5000); // Простой баннер показывается 5 секунд
        }
        return () => clearTimeout(timerId); // Очистка таймера
    }, [currentBannerIndex, isMobile]); // Зависит от индекса баннера и режима (мобильный/десктоп)

    // Логика включения/выключения автопроигрывания ВЛОЖЕННЫХ слайдеров
    // Выполняется только если НЕ мобильная версия
    useEffect(() => {
        if (isMobile) return; // Пропустить, если мобильная версия
        // Включаем autoplay для горизонтального слайдера, только если его родительский баннер активен
        if (nestedHSliderRef.current) {
            if (currentBannerIndex === 1) nestedHSliderRef.current.slickPlay();
            else nestedHSliderRef.current.slickPause();
        }
        // Включаем autoplay для вертикального слайдера, только если его родительский баннер активен
        if (nestedVSliderRef.current) {
            if (currentBannerIndex === 2) nestedVSliderRef.current.slickPlay();
            else nestedVSliderRef.current.slickPause();
        }
    }, [currentBannerIndex, isMobile]); // Зависит от индекса баннера и режима

    // ===============================================================================
    // Настройки для ДЕСКТОПНЫХ слайдеров (не изменялись)
    // ===============================================================================
    const mainSliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <NextArrow />, // Кастомные стрелки
        prevArrow: <PrevArrow />, // Кастомные стрелки
        autoplay: false, // Отключено, управляется вручную через useEffect
        afterChange: (index) => setCurrentBannerIndex(index), // Обновляем индекс текущего главного баннера
        beforeChange: (oldIndex, newIndex) => { // Сбрасываем вложенные слайдеры перед переключением
            // Если переключаемся на баннер с горизонтальной галереей (индекс 1)
            if (newIndex === 1 && nestedHSliderRef.current) nestedHSliderRef.current.slickGoTo(0, true);
            // Если переключаемся на баннер с вертикальной галереей (индекс 2)
            if (newIndex === 2 && nestedVSliderRef.current) nestedVSliderRef.current.slickGoTo(0, true);
        }
    };

    // Настройки для горизонтального вложенного слайдера
    const nestedHorizontalSettings = {
        dots: false,
        infinite: false, // false, чтобы проигрывался 1 раз
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true, // Включается/выключается через useEffect
        autoplaySpeed: 3000, // Каждый слайд показывается 3 секунды
        afterChange: (index) => {
            setNestedSlideIndex(index); // Обновляем индекс активного вложенного слайда
            // Если дошли до последнего слайда, переключаем главный слайдер
            if (index === mainSlidesData[1].nestedSlides.length - 1) { // mainSlidesData[1] - это баннер с горизонтальной галереей
                setTimeout(() => {
                    if (mainSliderRef.current) mainSliderRef.current.slickNext();
                }, 3000); // Ждем 3 секунды, затем переключаем главный
            }
        }
    };

    // Настройки для вертикального вложенного слайдера
    const nestedVerticalSettings = {
        dots: false,
        infinite: false, // false, чтобы проигрывался 1 раз
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        vertical: true,        // Включаем вертикальную прокрутку
        verticalSwiping: true, // Включаем свайп для вертикальной прокрутки
        autoplay: true,        // Включается/выключается через useEffect
        autoplaySpeed: 3000,   // Каждый слайд показывается 3 секунды
        afterChange: (index) => {
            setNestedVerticalSlideIndex(index); // Обновляем индекс активного вложенного слайда
            // Если дошли до последнего слайда, переключаем главный слайдер
            if (index === mainSlidesData[2].nestedSlides.length - 1) { // mainSlidesData[2] - это баннер с вертикальной галереей
                setTimeout(() => {
                    if (mainSliderRef.current) mainSliderRef.current.slickNext();
                }, 3000); // Ждем 3 секунды, затем переключаем главный
            }
        }
    };

    // Динамическая высота рамки для ГОРИЗОНТАЛЬНОГО слайдера (десктоп)
    const frameHeight = nestedSlideIndex === 1 ? 400 : 310;

    // Фиксированные размеры рамки для ВЕРТИКАЛЬНОГО слайдера (десктоп, исходя из 1024x919px картинок + 8px отступа)
    const FIXED_FRAME_WIDTH = 1024 + 16; // 1024px (ширина фото) + 2 * 8px (отступы)
    const FIXED_FRAME_HEIGHT = 919 + 16; // 919px (высота фото) + 2 * 8px (отступы)


    // ===============================================================================
    // 5. Условный рендеринг: Мобильная или Десктопная версия
    //    - Главное условие, которое определяет, какая версия компонента будет отрисована.
    // ===============================================================================
    if (isMobile) {
        // ===========================================================================
        // МОБИЛЬНАЯ ВЕРСИЯ: Упрощенная и оптимизированная для маленьких экранов
        // ===========================================================================
        const mobileSliderSettings = {
            dots: true,
            infinite: true, // Бесконечная прокрутка
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,  // Нет стрелок на мобильных
            autoplay: true, // Автоматическое проигрывание
            autoplaySpeed: 4000, // Каждый слайд показывается 4 секунды
        };

        return (
            <>
                {/* Фильтр категорий (без изменений) */}
                <div className="bg-sand border-b border-gray-200"><div className="container mx-auto"><CategoryFilter isHomePage={true} /></div></div>

                {/* Главный мобильный слайдер: значительно упрощен по сравнению с десктопной версией */}
                <section className="hero-slider-mobile">
                    <Slider {...mobileSliderSettings}>
                        {mainSlidesData.map(banner => {
                            // Для баннеров с галереями берем только первое изображение
                            const imageSrc = banner.type === 'simple' ? banner.image : banner.nestedSlides[0].image;
                            return (
                                <div key={banner.id}>
                                    {/* Каждый слайд - это вертикальный блок: изображение сверху, текст и кнопка снизу */}
                                    <div className={`flex flex-col items-center justify-center text-center p-6 h-[80vh] ${banner.bgColor}`}>
                                        <div className="w-full h-1/2 flex items-center justify-center mb-4">
                                            <img src={imageSrc} alt={banner.title} className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
                                        </div>
                                        <div className="w-full h-1/2 flex flex-col items-center justify-center">
                                            <h1 className="text-3xl font-bold text-gray-800">{banner.title}</h1>
                                            <p className="text-md text-gray-600 mt-2">{banner.subtitle}</p>
                                            <button className="mt-5 px-6 py-2 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700">
                                                <Link to="/catalog" state={{ selectedCategory: 'Все товары' }}>Каталог</Link>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Slider>
                </section>

                {/* Остальные секции страницы (без изменений) */}
                <MoodboardSection />
                <section className="py-12"><div className="container mx-auto px-6">{/* ... здесь содержимое вашей секции "Наша история" ... */}</div></section>
                <ContactFormSection />
            </>
        );

    } else {
        // ===========================================================================
        // ДЕСКТОПНАЯ ВЕРСИЯ: Ваш оригинальный код (АБСОЛЮТНО НЕ ИЗМЕНЕН)
        // ===========================================================================
        return (
            <>
                <div className="bg-sand border-b border-gray-200">
                    <div className="container mx-auto">
                        <CategoryFilter isHomePage={true} />
                    </div>
                </div>
                <section className="hero-slider-complex relative">
                    <Slider ref={mainSliderRef} {...mainSliderSettings}>
                        {mainSlidesData.map(banner => (
                            <div key={banner.id}>
                                <div className={`flex flex-col md:flex-row items-center justify-center p-8 md:p-12 h-[85vh] ${banner.bgColor}`}>
                                    <div className="w-full md:w-1/3 text-center md:text-left mb-8 md:mb-0">
                                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">{banner.title}</h1>
                                        <p className="text-lg text-gray-600 mt-4">{banner.subtitle}</p>
                                        <button className="mt-6 px-6 py-2 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700">
                                            <Link to="/catalog" state={{ selectedCategory: 'Все товары' }}>Каталог</Link>
                                        </button>
                                    </div>
                                    <div className="w-full md:w-2/3 h-full flex items-center justify-center">
                                        {banner.type === 'simple' && (
                                            <img src={banner.image} alt={banner.title} className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
                                        )}
                                        {banner.type === 'nested-horizontal' && (
                                            <div className="flex justify-center items-center h-full w-full">
                                                <div
                                                    className="frame-img bg-white rounded-xl shadow-lg border-4 border-gray-300 flex items-center justify-center"
                                                    style={{ width: 360, height: `${frameHeight}px`, marginLeft: '16px', overflow: 'hidden', transition: 'height 0.4s ease-in-out' }}
                                                >
                                                    <Slider ref={nestedHSliderRef} {...nestedHorizontalSettings} className="w-full h-full">
                                                        {banner.nestedSlides.map(slide => (
                                                            <div key={slide.id}><div style={{ padding: '0 10px', boxSizing: 'border-box' }}><img src={slide.image} alt={slide.id} className="w-full h-full object-cover rounded-lg" /></div></div>
                                                        ))}
                                                    </Slider>
                                                </div>
                                            </div>
                                        )}
                                        {banner.type === 'nested-vertical' && (
                                            <div
                                                className="frame-img bg-white rounded-xl shadow-lg border-4 border-gray-300 flex items-center justify-center"
                                                style={{ width: `${FIXED_FRAME_WIDTH}px`, height: `${FIXED_FRAME_HEIGHT}px`, overflow: 'hidden' }}
                                            >
                                                <Slider ref={nestedVSliderRef} {...nestedVerticalSettings} className="w-full h-full">
                                                    {banner.nestedSlides.map(slide => (
                                                        <div key={slide.id} className="w-full h-full flex items-center justify-center"><img src={slide.image} alt={slide.id} style={{ width: '1024px', height: '919px' }} className="object-contain" /></div>
                                                    ))}
                                                </Slider>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </section>
                <MoodboardSection />
                <section className="py-16 md:py-24"><div className="container mx-auto px-6">{/* ... здесь содержимое вашей секции "Наша история" ... */}</div></section>
                <ContactFormSection />
            </>
        );
    }
};

export default HomePage;