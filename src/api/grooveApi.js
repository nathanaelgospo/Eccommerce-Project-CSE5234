const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * Fetch all albums with remaining stock levels from the backend REST API.
 * Calls GET /api/albums
 */
export async function fetchAlbums() {
  const localUrl = `${API_BASE_URL}/api/albums`;
  const url = process.env.REACT_APP_INVENTORY_URL || localUrl;

  console.log(`[grooveApi] Fetching inventory from: ${url}`);

  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
  } catch (err) {
    if (url !== localUrl) {
      console.warn(`[grooveApi] Remote failed, trying local server: ${localUrl}`);
      response = await fetch(localUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
    } else {
      throw err;
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to load albums (status: ${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format: expected list of albums');
  }

  console.log('[grooveApi] Received albums:', data);
  return data;
}

/**
 * Submit an order to the backend Order Processing REST API.
 * Calls POST /api/orders
 */
export async function submitOrder(orderData) {
  const url = process.env.REACT_APP_ORDER_URL || `${API_BASE_URL}/api/orders`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      items: (orderData.items || [])
        .filter((item) => item.quantity > 0)
        .map(({ id, quantity }) => ({ id, quantity })),
      payment: {
        card_holder_name: orderData.card_holder_name,
        credit_card_number: orderData.credit_card_number,
        expir_date: orderData.expir_date,
        cvvCode: orderData.cvvCode,
        email: orderData.email || '',
      },
      shipping: {
        name: orderData.name,
        address_1: orderData.address_1 || orderData.addressLine1,
        address_2: orderData.address_2 || orderData.addressLine2,
        city: orderData.city,
        state: orderData.state,
        zip: orderData.zip,
        email: orderData.email || `${orderData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      },
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || `Order placement failed (status: ${response.status})`);
  }

  if (!result.confirmationNumber) {
    throw new Error('Server returned no confirmation number');
  }

  return result.confirmationNumber;
}

