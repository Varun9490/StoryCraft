'use client';

import { createContext, useContext, useReducer, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'storycraft_cart';

function cartReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.items.find(
                (i) => i.product._id === action.payload.product._id
            );
            if (existing) {
                const maxQty = action.payload.product.stock || 99;
                return {
                    ...state,
                    items: state.items.map((i) =>
                        i.product._id === action.payload.product._id
                            ? { ...i, quantity: Math.min(i.quantity + 1, maxQty) }
                            : i
                    ),
                };
            }
            return { ...state, items: [...state.items, { product: action.payload.product, quantity: 1 }] };
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter((i) => i.product._id !== action.payload),
            };
        case 'UPDATE_QUANTITY': {
            if (action.payload.quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter((i) => i.product._id !== action.payload.productId),
                };
            }
            return {
                ...state,
                items: state.items.map((i) =>
                    i.product._id === action.payload.productId
                        ? { ...i, quantity: action.payload.quantity }
                        : i
                ),
            };
        }
        case 'CLEAR_CART':
            return { ...state, items: [] };
        case 'TOGGLE_DRAWER':
            return { ...state, isOpen: !state.isOpen };
        case 'SET_DRAWER':
            return { ...state, isOpen: action.payload };
        case 'HYDRATE':
            return { ...state, items: action.payload };
        default:
            return state;
    }
}

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    dispatch({ type: 'HYDRATE', payload: parsed });
                }
            }
        } catch { }
        setHydrated(true);
    }, []);

    // Persist to localStorage on changes
    useEffect(() => {
        if (hydrated) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
            } catch { }
        }
    }, [state.items, hydrated]);

    const cartCount = state.items.reduce((acc, i) => acc + i.quantity, 0);
    const cartTotal = state.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ ...state, dispatch, cartCount, cartTotal, hydrated }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
