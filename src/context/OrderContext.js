
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';
import { fetchAlbums, submitOrder } from '../api/grooveApi';

const OrderContext = createContext(null);

const INITIAL_ORDER = {
  items: [],
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
  email: '',
  confirmationNumber: '',
};

export const OrderProvider = ({ children }) => {

  // Load previously saved order
  const [order, setOrder] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cse5234_order_state');

      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Could not load saved order:', e);
    }

    return INITIAL_ORDER;
  });

  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Refresh inventory directly from backend/RDS
  const refreshInventory = React.useCallback(async () => {
    try {
      setInventoryLoading(true);
      const products = await fetchAlbums();

      setOrder((previousOrder) => ({
        ...previousOrder,
        items: products.map((product) => {
          const previousItem = (previousOrder.items || []).find(
            (item) => item.id === product.id
          );

          return {
            ...product,
            quantity: Math.min(
              product.stock,
              Math.max(0, previousItem?.quantity || 0)
            )
          };
        })
      }));

      setInventoryError('');
    } catch (error) {
      console.error('Failed to load inventory:', error);
      setInventoryError(error.message);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  // Automatically save order to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        'cse5234_order_state',
        JSON.stringify(order)
      );
    } catch (e) {
      console.error('Could not save order:', e);
    }
  }, [order]);

  // Update item quantity without exceeding stock
  const updateQuantity = (itemId, qty) => {
    const validQty = Math.max(0, parseInt(qty, 10) || 0);

    setOrder((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.min(validQty, item.stock)
            }
          : item
      )
    }));
  };

  // Add one item to the shopping cart
  const addToCart = (itemId) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.min(
                (item.quantity || 0) + 1,
                item.stock
              )
            }
          : item
      )
    }));
  };

  // Update payment details
  const updatePaymentInfo = (paymentData) => {
    setOrder((prev) => ({
      ...prev,
      ...paymentData,
    }));
  };

  // Update customer shipping information
  const updateShippingInfo = (shippingData) => {
    setOrder((prev) => ({
      ...prev,
      ...shippingData,
      addressLine1:
        shippingData.address_1 ||
        shippingData.addressLine1 || '',
      addressLine2:
        shippingData.address_2 ||
        shippingData.addressLine2 || '',
      address_1:
        shippingData.address_1 ||
        shippingData.addressLine1 || '',
      address_2:
        shippingData.address_2 ||
        shippingData.addressLine2 || '',
    }));
  };

  // Submit an order to the order-processing microservice via API layer
  const completeOrder = async () => {
    setOrderSubmitting(true);
    try {
      const confirmationNumber = await submitOrder(order);
      setOrder((previous) => ({
        ...previous,
        confirmationNumber,
      }));
      // Clear saved order session so next order starts clean
      try {
        sessionStorage.removeItem('cse5234_order_state');
      } catch (e) {
        // ignore
      }
      return confirmationNumber;
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Reset cart, wipe session storage, and pull updated warehouse stock
  const resetOrder = async () => {
    try {
      sessionStorage.removeItem('cse5234_order_state');
    } catch (e) {
      // ignore
    }
    setOrder(INITIAL_ORDER);
    await refreshInventory();
  };

  return (
    <OrderContext.Provider
      value={{
        order,
        setOrder,
        inventoryLoading,
        inventoryError,
        orderSubmitting,
        updateQuantity,
        addToCart,
        updatePaymentInfo,
        updateShippingInfo,
        completeOrder,
        resetOrder,
        refreshInventory,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error(
      'useOrder must be used within an OrderProvider'
    );
  }

  return context;
};
