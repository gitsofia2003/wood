// src/components/CallbackModal.js

import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

const CallbackModal = ({ product, onClose }) => {
    const form = useRef();
    const [statusMessage, setStatusMessage] = useState("");

    const sendEmail = (e) => {
        e.preventDefault();
        setStatusMessage("Отправка...");

        const serviceID = 'service_wn4qgl4';
        const templateID = 'template_frgvxu8';
        const publicKey = '9NNTZ6weg4hCxKc7P';

        // Формируем детальное сообщение для отправки
        const messageContent = `
            Запрос на обратный звонок по товару:
            --------------------------------------
            Название: ${product.name}
            Цена: ${product.price}
            Размеры: ${product.dimensions || 'не указаны'}
            Цвет: ${product.color || 'не указан'}
            Ссылка на товар: ${window.location.href}
            --------------------------------------
        `;
        
        // Создаем скрытое поле с этим сообщением
        const hiddenMessageInput = document.createElement('input');
        hiddenMessageInput.type = 'hidden';
        hiddenMessageInput.name = 'message';
        hiddenMessageInput.value = messageContent;
        form.current.appendChild(hiddenMessageInput);


        emailjs.sendForm(serviceID, templateID, form.current, publicKey)
            .then(() => {
                setStatusMessage("Заявка успешно отправлена! Мы скоро с вами свяжемся.");
                setTimeout(() => {
                    onClose(); // Закрываем окно через 3 секунды
                }, 3000);
            }, (error) => {
                setStatusMessage("Ошибка отправки. Пожалуйста, попробуйте снова.");
            });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                <h3 className="text-2xl font-bold mb-2">Обратный звонок</h3>
                <p className="text-gray-600 mb-6">Оставьте ваши данные, и мы свяжемся с вами для уточнения деталей по товару "{product.name}".</p>
                
                <form ref={form} onSubmit={sendEmail}>
                    <div className="space-y-4">
                        <input type="text" placeholder="Ваше имя" name="from_name" required className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"/>
                        <input type="tel" placeholder="Номер телефона" name="phone_number" required className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"/>
                        <button type="submit" className="w-full py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700">Отправить</button>
                    </div>
                    {statusMessage && <p className="text-center mt-4">{statusMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default CallbackModal;