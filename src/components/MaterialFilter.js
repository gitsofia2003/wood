// src/components/MaterialFilter.js

import React from 'react';

const MaterialFilter = ({ availableMaterials, activeMaterial, setActiveMaterial }) => {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 mr-2">Материал:</span>
            {['Все материалы', ...availableMaterials].map(material => (
                <button
                    key={material}
                    onClick={() => setActiveMaterial(material)}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200
                        ${activeMaterial === material
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {material}
                </button>
            ))}
        </div>
    );
};

export default MaterialFilter;