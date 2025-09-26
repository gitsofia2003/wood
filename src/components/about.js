import React from 'react'; // Достаточно импортировать только React, если хуки не используются
import { Link } from 'react-router-dom';

// Определяем функциональный компонент с именем AboutPage
const AboutPage = () => {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <img src="/images/workshop-photo.jpg" alt="Наша мастерская" className="rounded-lg shadow-xl w-full" />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Наша история</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">Мы небольшая студия, где каждый предмет создается вручную с любовью и вниманием к деталям.</p>
                        <p className="text-gray-600 leading-relaxed">Мы верим, что искусство должно быть доступным и приносить радость, поэтому тщательно подходим к выбору материалов и дизайну.</p>
                        {/* Если здесь есть кнопка или ссылка "Узнать больше", она будет тут */}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutPage; 