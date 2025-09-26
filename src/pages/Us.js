// src/pages/Us.js

import React from 'react';
import { Link } from 'react-router-dom';

// Иконки для секции "Наши ценности"
const ValueIcon = ({ children }) => (
    <div className="flex-shrink-0 w-16 h-16 bg-sand rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {children}
        </svg>
    </div>
);

const UsPage = () => {
    return (
        <div className="bg-white">
            {/* --- Секция 1: Главный экран --- */}
            <section className="relative bg-sand py-20 md:py-32">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-800">История в каждой детали</h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                        Elvora — это не просто мебель. Это философия уюта, созданная вручную из натуральных материалов для вашего дома.
                    </p>
                </div>
            </section>

            {/* --- Секция 2: Наши ценности --- */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Наш подход</h2>
                        <p className="mt-2 text-lg text-gray-500">Три кита, на которых держится наша работа.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {/* Ценность 1 */}
                        <div>
                            <ValueIcon>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.82c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </ValueIcon>
                            <h3 className="text-xl font-semibold text-gray-800 mt-6">Качество материалов</h3>
                            <p className="mt-2 text-gray-600">Мы работаем только с натуральным деревом и качественной фурнитурой, чтобы мебель служила вам десятилетиями.</p>
                        </div>
                        {/* Ценность 2 */}
                        <div>
                            <ValueIcon>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </ValueIcon>
                            <h3 className="text-xl font-semibold text-gray-800 mt-6">Ручная работа</h3>
                            <p className="mt-2 text-gray-600">Каждый предмет создается мастером индивидуально, что позволяет нам контролировать качество на каждом этапе.</p>
                        </div>
                        {/* Ценность 3 */}
                        <div>
                            <ValueIcon>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </ValueIcon>
                            <h3 className="text-xl font-semibold text-gray-800 mt-6">Индивидуальный подход</h3>
                            <p className="mt-2 text-gray-600">Мы готовы адаптировать размеры, цвет и материалы под ваши уникальные потребности и интерьер.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* --- Секция 3: Наша мастерская --- */}
            <section className="bg-sand py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            
                            <img src="/images/workshop-photo.jpg" alt="Наша мастерская" className="rounded-lg shadow-xl w-full" />
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Наша мастерская</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">Это место, где рождаются идеи и воплощаются в жизнь. Мы объединили современные технологии и традиционные методы обработки дерева, чтобы достичь наилучшего результата.</p>
                            <Link to="/catalog" className="mt-4 inline-block font-semibold text-gray-800 border-b-2 border-gray-800 hover:text-gray-600 hover:border-gray-600 transition-colors">
                                Посмотреть наши работы &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default UsPage;