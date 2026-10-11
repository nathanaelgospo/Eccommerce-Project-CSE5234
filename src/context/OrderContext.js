import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext(null);

export const CATALOG_ITEMS = [
  {
    id: 1,
    name: 'Abbey Road',
    subtitle: 'The Beatles',
    genre: 'Rock',
    price: 34.99,
    image: '/covers/abbey-road.jpg',
  },
  {
    id: 2,
    name: 'The Dark Side of the Moon',
    subtitle: 'Pink Floyd',
    genre: 'Progressive Rock',
    price: 39.99,
    image: '/covers/dark-side.jpg',
  },
  {
    id: 3,
    name: 'Kind of Blue',
    subtitle: 'Miles Davis',
    genre: 'Jazz',
    price: 32.50,
    image: '/covers/kind-of-blue.jpg',
  },
  {
    id: 4,
    name: 'Rumours',
    subtitle: 'Fleetwood Mac',
    genre: 'Pop / Rock',
    price: 29.99,
    image: '/covers/rumours.jpg',
  },
  {
    id: 5,
    name: 'Random Access Memories',
    subtitle: 'Daft Punk',
    genre: 'Electronic',
    price: 44.99,
    image: '/covers/random-access-memories.jpg',
  },
];

const INITIAL_ORDER = {
  items: CATALOG_ITEMS.map((item) => ({
    id: item.id,
    name: item.name,
    subtitle: item.subtitle,
    price: item.price,
    quantity: 0,
    image: item.image,
  })),
  credit_card_number: '',
  expir_date: '',
  cvvCode: '',
  card_holder_name: '',
  name: '',
  address_1: '',
  address_2: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  confirmationNumber: '',
};

export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cse5234_order_state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // fallback to initial
    }
    return INITIAL_ORDER;
  });

  // Automatically persist to sessionStorage so refresh & back button never lose data
  useEffect(() => {
    try {
      sessionStorage.setItem('cse5234_order_state', JSON.stringify(order));
    } catch (e) {
      // ignore
    }
  }, [order]);

  const updateQuantity = (itemId, qty) => {
    const validQty = Math.max(0, parseInt(qty, 10) || 0);
    setOrder((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === itemId ? { ...it, quantity: validQty } : it)),
    }));
  };

  const addToCart = (itemId) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === itemId ? { ...it, quantity: (it.quantity || 0) + 1 } : it
      ),
    }));
  };

  const updatePaymentInfo = (paymentData) => {
    setOrder((prev) => ({
      ...prev,
      ...paymentData,
    }));
  };

  const updateShippingInfo = (shippingData) => {
    setOrder((prev) => ({
      ...prev,
      ...shippingData,
      addressLine1: shippingData.address_1 || shippingData.addressLine1 || '',
      addressLine2: shippingData.address_2 || shippingData.addressLine2 || '',
      address_1: shippingData.address_1 || shippingData.addressLine1 || '',
      address_2: shippingData.address_2 || shippingData.addressLine2 || '',
    }));
  };

  const completeOrder = () => {
    const confNumber = 'CH-' + Math.floor(100000 + Math.random() * 900000);
    setOrder((prev) => ({
      ...prev,
      confirmationNumber: confNumber,
    }));
    return confNumber;
  };

  const resetOrder = () => {
    setOrder(INITIAL_ORDER);
    try {
      sessionStorage.removeItem('cse5234_order_state');
    } catch (e) {}
  };

  return (
    <OrderContext.Provider
      value={{
        order,
        setOrder,
        updateQuantity,
        addToCart,
        updatePaymentInfo,
        updateShippingInfo,
        completeOrder,
        resetOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

