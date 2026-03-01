'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('kantri_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
                setCartItems([]);
            }
        }
        setIsInitialized(true);
    }, []);

    // Sync to localStorage
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('kantri_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isInitialized]);

    const addToCart = (item, quantity = 1) => {
        setCartItems(prev => {
            // Check if item already exists
            const exists = prev.find(i => i.id === item.id && i.type === item.type);
            if (exists) {
                // If exists, update quantity instead of adding new
                return prev.map(i =>
                    (i.id === item.id && i.type === item.type)
                        ? { ...i, quantity: (i.quantity || 1) + quantity }
                        : i
                );
            }
            return [...prev, { ...item, quantity }];
        });
    };

    const updateQuantity = (id, type, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prev => prev.map(item =>
            (item.id === id && item.type === type)
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const removeFromCart = (id, type) => {
        setCartItems(prev => prev.filter(item => !(item.id === id && item.type === type)));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            subtotal,
            count: cartCount,
            isInitialized
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
