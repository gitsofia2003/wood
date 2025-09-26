// src/pages/ContactPage.js

import React from 'react';
import ContactFormSection from '../components/email'; // Импортируем готовую форму

// Данные для контактов (временные, как вы и просили)
const contactLocations = [
    {
        title: 'Шоу-рум',
        address: 'Санкт-Петербург, Невский пр., 1',
        phone: '+7 (812) 123-45-67',
        // Ссылка для карты генерируется автоматически
        mapUrl: `https://www.google.com/maps/search/?api=1&query=Санкт-Петербург, Невский пр., 1`
    },
    {
        title: 'Производство',
        address: 'Санкт-Петербург, ул. Промышленная, 5',
        phone: '+7 (812) 123-45-68',
        mapUrl: `https://www.google.com/maps/search/?api=1&query=Санкт-Петербург, ул. Промышленная, 5`
    },
    {
        title: 'Центральный офис',
        address: 'Санкт-Петербург, ул. Курляндская, 49',
        phone: '+7 (812) 336-42-46',
        mapUrl: `https://www.google.com/maps/search/?api=1&query=Санкт-Петербург, ул. Курляндская, 49`
    },
];

// Компонент для одной карточки контакта
const ContactCard = ({ location }) => {
    // Форматируем номер для ссылки tel:
    const phoneLink = `tel:${location.phone.replace(/[\s-()]/g, '')}`;

    return (
        <div className="bg-sand p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{location.title}</h3>
            <div className="space-y-4">
                <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{location.address}</span>
                </a>
                <a href={phoneLink} className="flex items-start group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{location.phone}</span>
                </a>
            </div>
        </div>
    );
};


const ContactPage = () => {
    return (
        <div>
            {/* --- Секция 1: Заголовок и контакты --- */}
            <section className="bg-white py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Свяжитесь с нами</h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Мы всегда рады ответить на ваши вопросы, обсудить проект или просто пообщаться. Выберите удобный для вас способ связи.
                        </p>
                    </div>
                    
                    {/* Сетка с адресами */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {contactLocations.map(location => (
                            <ContactCard key={location.title} location={location} />
                        ))}
                    </div>
                </div>
            </section>
            
            {/* --- Секция 2: Форма обратной связи --- */}
            {/* Мы просто используем уже готовый компонент формы */}
            <ContactFormSection />
        </div>
    );
};

export default ContactPage;