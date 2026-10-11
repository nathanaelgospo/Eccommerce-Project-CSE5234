import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import Purchase from './components/purchase';
import PaymentEntry from './components/paymentEntry';
import ShippingEntry from './components/shippingEntry';
import ViewOrder from './components/viewOrder';
import Confirmation from './components/Confirmation';
import './App.css';

function App() {
  return (
    <div className="App">
      <OrderProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate replace to="/purchase" />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/purchase/paymentEntry" element={<PaymentEntry />} />
            <Route path="/purchase/shippingEntry" element={<ShippingEntry />} />
            <Route path="/purchase/viewOrder" element={<ViewOrder />} />
            <Route path="/purchase/viewConfirmation" element={<Confirmation />} />
            <Route path="/purchcase/viewConfirmation" element={<Navigate replace to="/purchase/viewConfirmation" />} />
          </Routes>
        </Router>
      </OrderProvider>
    </div>
  );
}

export default App;
