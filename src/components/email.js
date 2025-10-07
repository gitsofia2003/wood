import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { Link } from 'react-router-dom';

// Компонент формы, который отправляет email
const ContactFormSection = () => {
    const form = useRef();
    const [statusMessage, setStatusMessage] = useState("");

    const sendEmail = (e) => {
        e.preventDefault();
        setStatusMessage("Отправка...");

        // Ваши данные из EmailJS
        const serviceID = 'service_wn4qgl4';
        const templateID = 'template_frgvxu8';
        const publicKey = '9NNTZ6weg4hCxKc7P';

        emailjs.sendForm(serviceID, templateID, form.current, publicKey)
            .then((result) => {
                setStatusMessage("Сообщение успешно отправлено!");
                form.current.reset();
            }, (error) => {
                setStatusMessage("Ошибка. Попробуйте снова.");
            });
    };

    return (
        <section id="contact-form" className="py-16 md:py-24 bg-sand">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/3 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-800">Сделаем расчёт вашего проекта</h2>
                        <p className="text-lg text-gray-600 mt-2">в течение 1 дня</p>
                    </div>
                    <div className="lg:w-2/3 w-full">
                        <form ref={form} onSubmit={sendEmail} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Ф.И.О." name="from_name" required className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"/>
                            <input type="tel" placeholder="+7 (___) ___-__-__" name="phone_number" required className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"/>
                            <textarea placeholder="Опишите подробности заказа" name="message" rows="3" required className="md:col-span-2 w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"></textarea>
                            <div className="md:col-span-2 flex flex-col md:flex-row justify-between items-center">
                                <button type="submit" className="w-full md:w-auto py-3 px-8 bg-gray-800 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 transition duration-300">Отправить данные</button>
                                <p className="text-xs text-gray-500 mt-4 md:mt-0 max-w-xs text-center md:text-left">Подтверждая заявку, вы соглашаетесь с условиями <Link to="/privacy-policy" className="underline hover:text-gray-800">политики конфиденциальности</Link></p>
                            </div>
                            {statusMessage && <p className="md:col-span-2 text-center mt-4">{statusMessage}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactFormSection;