import React, { createContext, useContext, useState } from 'react';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
    const [selectedColor, setSelectedColor] = useState('rgb(34,50,52)');

    return (
        <ColorContext.Provider value={{ selectedColor, setSelectedColor }}>
            {children}
        </ColorContext.Provider>
    );
};

export const useColor = () => {
    return useContext(ColorContext);
};