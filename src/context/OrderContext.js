
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

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

  // Load inventory from AWS Lambda through API Gateway
  useEffect(() => {
    let active = true;

    async function loadInventory() {
      try {
        const apiUrl = process.env.REACT_APP_INVENTORY_URL;

        if (!apiUrl) {
          throw new Error('Inventory API URL is missing');
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(
            `Inventory API error: ${response.status}`
          );
        }

        const products = await response.json();

        if (!Array.isArray(products)) {
          throw new Error('Invalid inventory response');
        }

        if (!active) return;

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
        if (active) {
          console.error('Failed to load inventory:', error);
          setInventoryError(error.message);
        }
      } finally {
        if (active) {
          setInventoryLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      active = false;
    };
  }, []);

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

  // Submit an order to the order-processing microservice.
  const completeOrder = async () => {
    const apiUrl = process.env.REACT_APP_ORDER_URL;
    if (!apiUrl) {
      throw new Error('Order API URL is missing');
    }

    setOrderSubmitting(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: order.items
            .filter((item) => item.quantity > 0)
            .map(({ id, quantity }) => ({ id, quantity })),
          payment: {
            card_holder_name: order.card_holder_name,
            credit_card_number: order.credit_card_number,
            expir_date: order.expir_date,
            cvvCode: order.cvvCode,
          },
          shipping: {
            name: order.name,
            address_1: order.address_1,
            address_2: order.address_2,
            city: order.city,
            state: order.state,
            zip: order.zip,
          },
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Order API error: ${response.status}`);
      }
      if (!result.confirmationNumber) {
        throw new Error('Order API returned no confirmation number');
      }

      setOrder((previous) => ({
        ...previous,
        confirmationNumber: result.confirmationNumber,
      }));
      return result.confirmationNumber;
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Reset cart while keeping AWS inventory products
  const resetOrder = () => {
    setOrder((prev) => ({
      ...INITIAL_ORDER,
      items: prev.items.map((item) => ({
        ...item,
        quantity: 0
      }))
    }));
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
