// src/components/AvailableMaterials.js

import React from 'react';

// Данные о материалах теперь живут здесь
const availableMaterials = [
    { name: "Вишня", color: "#6D282B" },
    { name: "Бук", color: "#DAB88F" },
    { name: "Сандал", color: "#B07953" }
];

const AvailableMaterials = () => {
    return (
        <div className="my-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Возможные материалы:</p>
            <div className="flex items-center gap-4">
                {availableMaterials.map(material => (
                    <div key={material.name} className="flex items-center">
                        <span 
                            className="w-5 h-5 rounded-full border border-gray-300"
                            style={{ backgroundColor: material.color }}
                        ></span>
                        <span className="ml-2 text-sm text-gray-800">{material.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvailableMaterials;