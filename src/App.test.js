import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

const originalInventoryUrl = process.env.REACT_APP_INVENTORY_URL;
const originalFetch = global.fetch;

beforeEach(() => {
  process.env.REACT_APP_INVENTORY_URL = 'https://inventory.example/items';
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  });
});

afterEach(() => {
  if (originalInventoryUrl === undefined) {
    delete process.env.REACT_APP_INVENTORY_URL;
  } else {
    process.env.REACT_APP_INVENTORY_URL = originalInventoryUrl;
  }
  global.fetch = originalFetch;
});

test('renders the groove storefront', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /classic sound\. pure vinyl\./i })).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByText('Loading featured albums...')).not.toBeInTheDocument();
  });
});
