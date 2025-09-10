import React from 'react';

const ProductCard = ({ product }) => (
    <div className="bg-white group cursor-pointer flex flex-col">
        <div className="bg-sand p-2 rounded-md transition-shadow duration-300 group-hover:shadow-xl h-64 flex items-center justify-center">
            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain"/>
        </div>
        <div className="pt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            <hr className="my-2 border-gray-200"/>
            <p className="text-xl font-bold text-gray-800 my-2">{product.price}</p>
            <hr className="my-2 border-gray-200"/>
            <p className="text-xs text-gray-500 mt-2">габариты Д х Ш х В:</p>
            <p className="text-sm text-gray-700 font-medium">{product.dimensions}</p>
        </div>
    </div>
);

export default ProductCard;