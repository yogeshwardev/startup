import React, { useState } from 'react';
import http from '../../api/http';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutButton = ({ 
  amount, 
  currency = 'INR', 
  planName = 'Premium Pass',
  onSuccess,
  children,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);

  const displayRazorpay = async () => {
    setLoading(true);
    
    // 1. Load Razorpay Script
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 2. Create Order on Backend
      const orderResponse = await http.post('/payment/create-order', {
        amount,
        currency,
        receipt: `receipt_${Date.now()}`
      });

      const { order_id, amount: orderAmount, currency: orderCurrency } = orderResponse.data;

      // 3. Initialize Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use environment variable
        amount: orderAmount.toString(),
        currency: orderCurrency,
        name: 'CampusArena',
        description: planName,
        order_id: order_id,
        handler: async function (response) {
          try {
            // 4. Verify Payment on Backend
            const verifyResponse = await http.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              if (onSuccess) onSuccess(verifyResponse.data);
              else alert('Payment successful and verified!');
            } else {
              alert('Payment verification failed!');
            }
          } catch (err) {
            console.error('Verification Error:', err);
            alert('An error occurred during payment verification.');
          }
        },
        prefill: {
          name: '', // Can be prefilled if user context is available
          email: '',
          contact: ''
        },
        theme: {
          color: '#10b981', // brand-500
        },
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
      });
      
      paymentObject.open();

    } catch (err) {
      console.error('Order Creation Error:', err);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={displayRazorpay} 
      disabled={loading}
      className={className || "px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg disabled:opacity-50"}
    >
      {loading ? 'Processing...' : children || 'Pay Now'}
    </button>
  );
};

export default CheckoutButton;
