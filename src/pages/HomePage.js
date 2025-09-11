import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import ContactFormSection from './email';

import MoodboardSection from '../components/MoodboardSection';
import CategoryFilter from '../components/CategoryFilter';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// --- Компоненты для кастомных стрелок (без изменений) ---
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

// --- НОВЫЕ ДАННЫЕ ДЛЯ СЛАЙДЕРА ---
// Порядок изменен и добавлено свойство 'duration'
const mainSlidesData = [
    {
        type: 'simple',
        id: 'banner1',
        bgColor: 'bg-blue-100',
        title: 'Мебель на отлично!',
        subtitle: 'Всё для учёбы и работы со скидками',
        image: '/images/banner-1-bg.jpg',
        duration: 5000, // Показывается 5 секунд
    },
    {
        type: 'nested-vertical', // Теперь второй баннер - вертикальный
        id: 'banner2',
        bgColor: 'bg-teal-100',
        title: 'Новая коллекция',
        subtitle: 'Вертикальный взгляд на стиль',
        duration: 9000, // 3 картинки по 3 секунды = 9 секунд
        nestedSlides: [
            { id: 'b2s1', image: '/images/nested-vertical-1.jpg', width: 370, height: 400 },
            { id: 'b2s2', image: '/images/nested-vertical-2.jpg', width: 350, height: 350 },
            { id: 'b2s3', image: '/images/nested-vertical-3.jpg', width: 320, height: 420 },
        ]
    },
    {
        type: 'nested-horizontal', // Третий баннер - горизонтальный
        id: 'banner3',
        bgColor: 'bg-orange-100',
        title: 'Уют в каждой комнате',
        subtitle: 'Листайте, чтобы увидеть больше',
        duration: 9000, // 3 картинки по 3 секунды = 9 секунд
        nestedSlides: [
            { id: 'b3s1', image: '/images/nested-1.jpg' },
            { id: 'b3s2', image: '/images/nested-2.jpg' },
            { id: 'b3s3', image: '/images/nested-3.jpg' },
        ]
    }
];

const HomePage = () => {
    const mainSliderRef = useRef(null);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [nestedVerticalSlideIndex, setNestedVerticalSlideIndex] = useState(0);

    // --- НОВАЯ ЦЕНТРАЛИЗОВАННАЯ ЛОГИКА УПРАВЛЕНИЯ ---
    useEffect(() => {
        // Находим текущий активный баннер по его индексу
        const currentBanner = mainSlidesData[currentBannerIndex];
        
        // Устанавливаем таймер для переключения на следующий главный слайд
        const timerId = setTimeout(() => {
            if (mainSliderRef.current) {
                mainSliderRef.current.slickNext();
            }
        }, currentBanner.duration); // Используем 'duration' из данных

        // Очищаем таймер при смене слайда или размонтировании компонента
        return () => clearTimeout(timerId);
    }, [currentBannerIndex]); // Этот эффект перезапускается каждый раз, когда меняется главный баннер

    const mainSliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        autoplay: false, // Главный слайдер управляется нашим useEffect, а не встроенным autoplay
        afterChange: (index) => setCurrentBannerIndex(index)
    };
    
    // Базовые настройки для вложенных слайдеров (без autoplay)
    const nestedSliderBaseSettings = {
        dots: false,
        infinite: true, // Ставим true для бесконечной прокрутки внутри
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplaySpeed: 3000,
    };

    // --- УМНОЕ АВТОПРОИГРЫВАНИЕ ---
    // Настройки для вертикального слайдера: autoplay включается, только если он активен (index === 1)
    const nestedVerticalSettings = {
        ...nestedSliderBaseSettings,
        vertical: true,
        verticalSwiping: true,
        autoplay: currentBannerIndex === 1,
        afterChange: (index) => setNestedVerticalSlideIndex(index),
    };

    // Настройки для горизонтального слайдера: autoplay включается, только если он активен (index === 2)
    const nestedHorizontalSettings = {
        ...nestedSliderBaseSettings,
        autoplay: currentBannerIndex === 2,
    };
    
    // Динамический расчет размеров рамки для вертикального слайдера (из прошлого решения)
    const verticalSliderData = mainSlidesData[1];
    const currentVerticalSlide = verticalSliderData.nestedSlides[nestedVerticalSlideIndex];
    const frameWidth = currentVerticalSlide.width + 20;
    const frameHeightVertical = currentVerticalSlide.height + 20;

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
                            <div className={`flex flex-col md:flex-row items-center justify-center p-8 md:p-12 h-[70vh] ${banner.bgColor}`}>
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

                                    {banner.type === 'nested-vertical' && (
                                        <div className="frame-img bg-white rounded-xl shadow-lg border-4 border-gray-300 flex items-center justify-center"
                                            style={{
                                                width: `${frameWidth}px`,
                                                height: `${frameHeightVertical}px`,
                                                overflow: 'hidden',
                                                transition: 'width 0.4s ease-in-out, height 0.4s ease-in-out'
                                            }}
                                        >
                                            <Slider {...nestedVerticalSettings} className="w-full h-full">
                                                {banner.nestedSlides.map(slide => (
                                                    <div key={slide.id} className="w-full h-full flex items-center justify-center">
                                                        <img src={slide.image} alt={slide.id} style={{ width: `${slide.width}px`, height: `${slide.height}px` }} className="object-contain" />
                                                    </div>
                                                ))}
                                            </Slider>
                                        </div>
                                    )}

                                    {banner.type === 'nested-horizontal' && (
                                        <div className="frame-img bg-white rounded-xl shadow-lg border-4 border-gray-300 flex items-center justify-center"
                                            style={{ width: 360, height: 350, overflow: 'hidden' }}
                                        >
                                            <Slider {...nestedHorizontalSettings} className="w-full h-full">
                                                {banner.nestedSlides.map(slide => (
                                                    <div key={slide.id}>
                                                        <div style={{ padding: '0 10px', boxSizing: 'border-box' }}>
                                                            <img src={slide.image} alt={slide.id} className="w-full h-full object-cover rounded-lg" />
                                                        </div>
                                                    </div>
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

            <section className="py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <img src="/images/workshop-photo.jpg" alt="Наша мастерская" className="rounded-lg shadow-xl w-full" />
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Наша история</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">Мы — небольшая студия, где каждый предмет создается вручную с любовью и вниманием к деталям. Наша философия — это сочетание натуральных материалов и современного дизайна для создания уюта в вашем доме.</p>
                            <p className="text-gray-600 leading-relaxed">Мы верим, что искусство должно быть доступным и приносить радость, поэтому тщательно отбираем сюжеты и материалы для наших работ, чтобы они служили вам долгие годы.</p>
                        </div>
                    </div>
                </div>
            </section>

            <ContactFormSection />
        </>
    );
};

export default HomePage;