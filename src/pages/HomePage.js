import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import ContactFormSection from './email';

import MoodboardSection from '../components/MoodboardSection';
import CategoryFilter from '../components/CategoryFilter';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ===================================================================================
// 1. Компоненты для кастомных стрелок (ТОЛЬКО для десктопа)
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
// ===================================================================================
const mainSlidesData = [
    { type: 'simple', id: 'banner1', bgColor: 'bg-blue-100', title: 'Мебель на отлично!', subtitle: 'Всё для учёбы и работы', image: '/images/banner-1-bg.jpg' },
    { type: 'nested-horizontal', id: 'banner2', bgColor: 'bg-orange-100', title: 'Уют в каждой комнате', subtitle: 'Листайте, чтобы увидеть больше', nestedSlides: [{ id: 'b2s1', image: '/images/nested-1.jpg' }, { id: 'b2s2', image: '/images/nested-2.jpg' }, { id: 'b2s3', image: '/images/nested-3.jpg' }] },
    { type: 'nested-vertical', id: 'banner3', bgColor: 'bg-teal-100', title: 'Новая коллекция', subtitle: 'Вертикальный взгляд на стиль', nestedSlides: [{ id: 'b3s1', image: '/images/new-vertical-1.jpg' }, { id: 'b3s2', image: '/images/new-vertical-2.jpg' }, { id: 'b3s3', image: '/images/new-vertical-3.jpg' }] }
];

// ===================================================================================
// 3. Кастомный хук `useIsMobile`
// ===================================================================================
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);
    const handleResize = useCallback(() => {
        setIsMobile(window.innerWidth < breakpoint);
    }, [breakpoint]);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    return isMobile;
};

// ===================================================================================
// 4. Основной компонент HomePage
// ===================================================================================
const HomePage = () => {
    const isMobile = useIsMobile();

    // ===============================================================================
    // ОБЩИЕ ХУКИ ДЛЯ ДЕСКТОПА И МОБИЛЬНОГО (объявлены на верхнем уровне)
    // ===============================================================================

    // Хуки и состояния для ДЕСКТОПНОЙ версии
    const mainSliderRef = useRef(null);
    const nestedHSliderRef = useRef(null);
    const nestedVSliderRef = useRef(null);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [nestedSlideIndex, setNestedSlideIndex] = useState(0);
    const [nestedVerticalSlideIndex, setNestedVerticalSlideIndex] = useState(0);

    // Хуки и состояния для МОБИЛЬНОЙ версии
    const mobileMainSliderRef = useRef(null);
    const [mobileCurrentBannerIndex, setMobileCurrentBannerIndex] = useState(0);
    const mobileNestedHSliderRef = useRef(null);
    const mobileNestedVSliderRef = useRef(null);


    // ===============================================================================
    // useEffect'ы для ДЕСКТОПНОЙ версии (не выполняются, если isMobile = true)
    // ===============================================================================
    useEffect(() => {
        if (isMobile) return;
        const currentBanner = mainSlidesData[currentBannerIndex];
        let timerId;
        if (currentBanner.type === 'simple') {
            timerId = setTimeout(() => {
                if (mainSliderRef.current) mainSliderRef.current.slickNext();
            }, 5000);
        }
        return () => clearTimeout(timerId);
    }, [currentBannerIndex, isMobile]);

    useEffect(() => {
        if (isMobile) return;
        if (nestedHSliderRef.current) {
            if (currentBannerIndex === 1) nestedHSliderRef.current.slickPlay();
            else nestedHSliderRef.current.slickPause();
        }
        if (nestedVSliderRef.current) {
            if (currentBannerIndex === 2) nestedVSliderRef.current.slickPlay();
            else nestedVSliderRef.current.slickPause();
        }
    }, [currentBannerIndex, isMobile]);

    // ===============================================================================
    // useEffect'ы для МОБИЛЬНОЙ версии (НЕ выполняются, если isMobile = false)
    // ===============================================================================
    useEffect(() => {
        if (!isMobile) return; // Пропустить, если НЕ мобильная версия

        // Логика автоматического переключения ГЛАВНОГО мобильного слайдера для "простого" баннера
        // Он будет переключать весь контейнер, а внутренние слайдеры будут работать сами
        const currentMobileBanner = mainSlidesData[mobileCurrentBannerIndex];
        let mainMobileTimerId;
        // Если текущий баннер не является "простым" (т.е. содержит вложенные слайдеры),
        // то основной слайдер должен переключиться через 4 секунды (время показа вложенных слайдеров)
        if (currentMobileBanner.type === 'simple') {
             // Для простых баннеров главный слайдер сам переключает себя через 4 секунды
             mainMobileTimerId = setTimeout(() => {
                if (mobileMainSliderRef.current) mobileMainSliderRef.current.slickNext();
             }, 4000); // 4 секунды для простого баннера
        } else {
             // Для баннеров с галереями, мы даем время внутреннему слайдеру прокрутиться
             // и затем переключаем основной, чтобы дать возможность показать все внутренние картинки.
             // Здесь мы просто ставим задержку, которая равна времени проигрывания всех внутренних слайдов + запас
             const totalNestedSlides = currentMobileBanner.nestedSlides.length;
             if (totalNestedSlides > 0) {
                 mainMobileTimerId = setTimeout(() => {
                     if (mobileMainSliderRef.current) mobileMainSliderRef.current.slickNext();
                 }, totalNestedSlides * 3000 + 1000); // (Кол-во слайдов * время слайда) + запас в 1 секунду
             } else {
                 // Если галерея пуста, но баннер типа 'nested', переключаем через 4с
                 mainMobileTimerId = setTimeout(() => {
                     if (mobileMainSliderRef.current) mobileMainSliderRef.current.slickNext();
                 }, 4000);
             }
        }
        
        // Управление автопроигрыванием ВЛОЖЕННЫХ мобильных слайдеров
        // Включаются/выключаются в зависимости от активности родительского главного баннера
        if (mobileNestedHSliderRef.current) {
            if (mobileCurrentBannerIndex === 1) mobileNestedHSliderRef.current.slickPlay();
            else mobileNestedHSliderRef.current.slickPause();
        }
        if (mobileNestedVSliderRef.current) {
            if (mobileCurrentBannerIndex === 2) mobileNestedVSliderRef.current.slickPlay();
            else mobileNestedVSliderRef.current.slickPause();
        }

        return () => clearTimeout(mainMobileTimerId); // Очистка главного мобильного таймера
    }, [mobileCurrentBannerIndex, isMobile]); // Зависит от индекса активного мобильного баннера и режима


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
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        autoplay: false,
        afterChange: (index) => setCurrentBannerIndex(index),
        beforeChange: (oldIndex, newIndex) => {
            if (newIndex === 1 && nestedHSliderRef.current) nestedHSliderRef.current.slickGoTo(0, true);
            if (newIndex === 2 && nestedVSliderRef.current) nestedVSliderRef.current.slickGoTo(0, true);
        }
    };

    const nestedHorizontalSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 3000,
        afterChange: (index) => {
            setNestedSlideIndex(index);
            if (index === mainSlidesData[1].nestedSlides.length - 1) {
                setTimeout(() => {
                    if (mainSliderRef.current) mainSliderRef.current.slickNext();
                }, 3000);
            }
        }
    };

    const nestedVerticalSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        vertical: true,
        verticalSwiping: true,
        autoplay: true,
        autoplaySpeed: 3000,
        afterChange: (index) => {
            setNestedVerticalSlideIndex(index);
            if (index === mainSlidesData[2].nestedSlides.length - 1) {
                setTimeout(() => {
                    if (mainSliderRef.current) mainSliderRef.current.slickNext();
                }, 3000);
            }
        }
    };

    const frameHeight = nestedSlideIndex === 1 ? 400 : 310;
    const FIXED_FRAME_WIDTH = 1024 + 16;
    const FIXED_FRAME_HEIGHT = 919 + 16;

    // ===============================================================================
    // Настройки для МОБИЛЬНЫХ слайдеров
    // ===============================================================================
    // Настройки для ГЛАВНОГО мобильного слайдера (теперь с автопрокруткой!)
    const mobileMainSliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: false, // Отключено, управляется вручную через мобильный useEffect
        afterChange: (index) => setMobileCurrentBannerIndex(index),
    };

    // Базовые настройки для ВЛОЖЕННЫХ мобильных слайдеров
    const mobileNestedSliderBaseSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplaySpeed: 3000,
    };

    const mobileNestedHorizontalSettings = {
        ...mobileNestedSliderBaseSettings,
        autoplay: mobileCurrentBannerIndex === 1,
    };

    const mobileNestedVerticalSettings = {
        ...mobileNestedSliderBaseSettings,
        vertical: true,
        verticalSwiping: true,
        autoplay: mobileCurrentBannerIndex === 2,
    };


    // ===============================================================================
    // 5. Условный рендеринг: Мобильная или Десктопная версия
    // ===============================================================================
    if (isMobile) {
        // ===========================================================================
        // МОБИЛЬНАЯ ВЕРСИЯ: Упрощенная и оптимизированная для маленьких экранов
        // ===========================================================================
        return (
            <>
                {/* Категории убраны из мобильной версии */}
                {/* <div className="bg-sand border-b border-gray-200"><div className="container mx-auto"><CategoryFilter isHomePage={true} /></div></div> */}

                <section className="hero-slider-mobile">
                    <Slider ref={mobileMainSliderRef} {...mobileMainSliderSettings}>
                        {mainSlidesData.map((banner, index) => (
                            <div key={banner.id}>
                                <div className={`flex flex-col items-center justify-center text-center p-6 h-[80vh] ${banner.bgColor}`}>
                                    <div className="w-full h-1/2 flex items-center justify-center mb-4">
                                        {banner.type === 'simple' && (
                                            <img src={banner.image} alt={banner.title} className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
                                        )}
                                        {banner.type === 'nested-horizontal' && (
                                            <div className="w-full h-full flex items-center justify-center rounded-lg shadow-lg overflow-hidden">
                                                <Slider ref={mobileNestedHSliderRef} {...mobileNestedHorizontalSettings} className="w-full h-full">
                                                    {banner.nestedSlides.map(slide => (
                                                        <div key={slide.id} className="w-full h-full flex items-center justify-center">
                                                            <img src={slide.image} alt={slide.id} className="max-h-full max-w-full object-contain" />
                                                        </div>
                                                    ))}
                                                </Slider>
                                            </div>
                                        )}
                                        {banner.type === 'nested-vertical' && (
                                            <div className="w-full h-full flex items-center justify-center rounded-lg shadow-lg overflow-hidden">
                                                <Slider ref={mobileNestedVSliderRef} {...mobileNestedVerticalSettings} className="w-full h-full">
                                                    {banner.nestedSlides.map(slide => (
                                                        <div key={slide.id} className="w-full h-full flex items-center justify-center">
                                                            <img src={slide.image} alt={slide.id} className="max-h-full max-w-full object-contain" />
                                                        </div>
                                                    ))}
                                                </Slider>
                                            </div>
                                        )}
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
                        ))}
                    </Slider>
                </section>

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