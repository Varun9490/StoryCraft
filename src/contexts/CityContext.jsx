'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CityContext = createContext(null);

const VALID_CITIES = ['Visakhapatnam', 'Hyderabad', 'Chennai', 'Kolkata'];
const STORAGE_KEY = 'storycraft_city';

export function CityProvider({ children }) {
    const [selectedCity, setSelectedCity] = useState('Visakhapatnam');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && VALID_CITIES.includes(saved)) {
                setSelectedCity(saved);
            }
        } catch { }
        setMounted(true);
    }, []);

    const setCity = (city) => {
        if (VALID_CITIES.includes(city)) {
            setSelectedCity(city);
            try {
                localStorage.setItem(STORAGE_KEY, city);
            } catch { }
        }
    };

    return (
        <CityContext.Provider value={{ selectedCity, setCity, mounted, cities: VALID_CITIES }}>
            {children}
        </CityContext.Provider>
    );
}

export function useCity() {
    const context = useContext(CityContext);
    if (!context) throw new Error('useCity must be used within CityProvider');
    return context;
}
