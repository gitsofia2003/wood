import React from 'react';

const WarrantyPage = () => {
    return (
        <div className="bg-white py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Гарантия на продукцию</h1>
                <div className="prose prose-lg text-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800">1. Гарантийный срок</h2>
                    <p>
                        На всю продукцию Elvora распространяется гарантия сроком 12 месяцев со дня покупки. Пожалуйста, сохраняйте чек или иной документ, подтверждающий покупку.
                    </p>
                    <h2 className="text-xl font-semibold text-gray-800 mt-6">2. Что покрывает гарантия</h2>
                    <p>
                        Гарантия распространяется на производственные дефекты и дефекты материалов, выявленные в процессе эксплуатации. Мы обязуемся бесплатно отремонтировать или заменить дефектный товар или его часть.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WarrantyPage;