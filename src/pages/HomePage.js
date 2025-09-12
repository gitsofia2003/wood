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
        <div
            className={`${className} custom-arrow next-arrow`}
            onClick={onClick}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </div>
    );
}

function PrevArrow(props) {
    const { className, onClick } = props;
    return (
        <div
            className={`${className} custom-arrow prev-arrow`}
            onClick={onClick}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
    );
}

// --- Данные для главного слайдера (без изменений) ---
const mainSlidesData = [
    {
        type: 'simple',
        id: 'banner1',
        bgColor: 'bg-blue-100',
        title: 'Мебель на отлично!',
        subtitle: 'Всё для учёбы и работы со скидками',
        image: '/images/banner-1-bg.jpg'
    },
    {
        type: 'nested-horizontal',
        id: 'banner2',
        bgColor: 'bg-orange-100',
        title: 'Уют в каждой комнате',
        subtitle: 'Листайте, чтобы увидеть больше',
        nestedSlides: [
            { id: 'b2s1', image: '/images/nested-1.jpg' },
            { id: 'b2s2', image: '/images/nested-2.jpg' },
            { id: 'b2s3', image: '/images/nested-3.jpg' },
        ]
    },
    {
        type: 'nested-vertical',
        id: 'banner3',
        bgColor: 'bg-teal-100',
        title: 'Новая коллекция',
        subtitle: 'Вертикальный взгляд на стиль',
        nestedSlides: [
            { id: 'b3s1', image: '/images/nested-vertical-1.jpg' },
            { id: 'b3s2', image: '/images/nested-vertical-2.jpg' },
            { id: 'b3s3', image: '/images/nested-vertical-3.jpg' },
        ]
    }
];

const HomePage = () => {
    const mainSliderRef = useRef(null);
    const nestedHSliderRef = useRef(null);
    const nestedVSliderRef = useRef(null);

    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [nestedSlideIndex, setNestedSlideIndex] = useState(0);
    const [nestedVerticalSlideIndex, setNestedVerticalSlideIndex] = useState(0);

    // Вся логика с useEffect и настройками слайдеров остается прежней
    useEffect(() => {
        const currentBanner = mainSlidesData[currentBannerIndex];
        let timerId;
        if (currentBanner.type === 'simple') {
            timerId = setTimeout(() => {
                if (mainSliderRef.current) {
                    mainSliderRef.current.slickNext();
                }
            }, 5000);
        }
        return () => clearTimeout(timerId);
    }, [currentBannerIndex]);

    useEffect(() => {
        if (nestedHSliderRef.current) {
            if (currentBannerIndex === 1) {
                nestedHSliderRef.current.slickPlay();
            } else {
                nestedHSliderRef.current.slickPause();
            }
        }
        if (nestedVSliderRef.current) {
            if (currentBannerIndex === 2) {
                nestedVSliderRef.current.slickPlay();
            } else {
                nestedVSliderRef.current.slickPause();
            }
        }
    }, [currentBannerIndex]);

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
            if (newIndex === 1 && nestedHSliderRef.current) {
                nestedHSliderRef.current.slickGoTo(0, true);
            }
            if (newIndex === 2 && nestedVSliderRef.current) {
                nestedVSliderRef.current.slickGoTo(0, true);
            }
        }
    };

    const nestedHorizontalSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true, 
        autoplaySpeed: 3000,
        afterChange: (index) => {
            setNestedSlideIndex(index);
            if (index === mainSlidesData[1].nestedSlides.length - 1) {
                nestedHSliderRef.current.slickPause();
                setTimeout(() => {
                    if (mainSliderRef.current) {
                        mainSliderRef.current.slickNext();
                    }
                }, 3000);
            }
        }
    };

    const nestedVerticalSettings = {
        dots: false,
        infinite: true,
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
                nestedVSliderRef.current.slickPause();
                setTimeout(() => {
                    if (mainSliderRef.current) {
                        mainSliderRef.current.slickNext();
                    }
                }, 3000);
            }
        }
    };
    
    // Эти константы теперь используются только для десктопной версии
    const frameHeight = nestedSlideIndex === 1 ? 400 : 310;
    const FIXED_FRAME_WIDTH = 1024 + 16;
    const FIXED_FRAME_HEIGHT = 919 + 16;

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
                            <div className={`flex flex-col md:flex-row items-center justify-center p-4 md:p-12 h-auto md:min-h-[90vh] ${banner.bgColor}`}>
                                <div className="w-full md:w-1/3 text-center md:text-left mb-8 md:mb-0">
                                    <h1 className="text-3xl md:text-5xl font-bold text-gray-800">{banner.title}</h1>
                                    <p className="text-lg text-gray-600 mt-4">{banner.subtitle}</p>
                                    <button className="mt-6 px-6 py-2 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700">
                                        <Link to="/catalog" state={{ selectedCategory: 'Все товары' }}>Каталог</Link>
                                    </button>
                                </div>
                                <div className="w-full md:w-2/3 h-[50vh] md:h-full flex items-center justify-center">
                                    {banner.type === 'simple' && (
                                        <img src={banner.image} alt={banner.title} className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
                                    )}
                                    {banner.type === 'nested-horizontal' && (
                                        <div className="flex justify-center items-center h-full w-full">
                                            <div
                                                className="bg-white rounded-xl shadow-lg border-4 border-gray-300 flex items-center justify-center w-full md:w-auto"
                                                style={{
                                                    width: window.innerWidth >= 768 ? 360 : undefined,
                                                    height: `${frameHeight}px`,
                                                    marginLeft: window.innerWidth >= 768 ? '16px' : '0',
                                                    overflow: 'hidden',
                                                    transition: 'height 0.4s ease-in-out'
                                                }}
                                            >
                                                <Slider {...nestedHorizontalSettings} className="w-full h-full">
                                                    {banner.nestedSlides.map(slide => (
                                                        <div key={slide.id}>
                                                            <div style={{ padding: '0 10px', boxSizing: 'border-box' }}>
                                                                <img
                                                                    src={slide.image}
                                                                    alt={slide.id}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </Slider>
                                            </div>
                                        </div>
                                    )}
                                    {banner.type === 'nested-vertical' && (
                                        <>
                                            <div className="w-full md:hidden">
                                                 <Slider {...nestedHorizontalSettings} className="w-full">
                                                    {banner.nestedSlides.map(slide => (
                                                        <div key={slide.id}>
                                                            <img
                                                                src={slide.image}
                                                                alt={slide.id}
                                                                className="w-full h-auto object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </Slider>
                                            </div>
                                            <div
                                                className="hidden md:flex frame-img bg-white rounded-xl shadow-lg border-4 border-gray-300 items-center justify-center"
                                                style={{
                                                    width: `${FIXED_FRAME_WIDTH}px`,
                                                    height: `${FIXED_FRAME_HEIGHT}px`,
                                                    overflow: 'hidden',
                                                    transition: 'width 0.4s ease-in-out, height 0.4s ease-in-out'
                                                }}
                                            >
                                                <Slider ref={nestedVSliderRef} {...nestedVerticalSettings} className="w-full h-full">
                                                    {banner.nestedSlides.map(slide => (
                                                        <div key={slide.id} className="w-full h-full flex items-center justify-center">
                                                            <img
                                                                src={slide.image}
                                                                alt={slide.id}
                                                                style={{
                                                                    width: '1024px',
                                                                    height: '919px',
                                                                }}
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    ))}
                                                </Slider>
                                            </div>
                                        </>
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