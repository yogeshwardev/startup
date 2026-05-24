import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const RefundPolicyPage = () => {
  return (
    <LegalLayout title="Refund Policy" lastUpdated={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}>
      <p>
        Thank you for subscribing to CampusArena programs. We strive to ensure that our students receive the highest quality education and support.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. General Policy</h2>
      <p>
        Due to the digital nature of our platform and the immediate access granted to premium content, mock tests, and integrated tools upon purchase, all sales are considered final. We generally do not offer refunds once a subscription pass has been purchased and activated.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Exceptional Circumstances</h2>
      <p>
        We may consider a refund request on a case-by-case basis under the following exceptional circumstances:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-4">
        <li>Duplicate payment processing errors.</li>
        <li>Technical issues on our end that entirely prevent you from accessing the platform for a continuous period of more than 72 hours immediately following your purchase.</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Requesting a Refund</h2>
      <p>
        If you believe you qualify for a refund under our exceptional circumstances, please contact our support team at <strong>yogeshwarnd.dev@gmail.com</strong> within 7 days of your purchase. Please include your order details, registration email, and a clear explanation of the issue.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Processing Refunds</h2>
      <p>
        If your refund is approved, it will be processed, and a credit will automatically be applied to your credit card or original method of payment within 7-14 business days.
      </p>
    </LegalLayout>
  );
};

export default RefundPolicyPage;
