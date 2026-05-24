import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const PrivacyPolicyPage = () => {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}>
      <p>
        At CampusArena ("we," "our," or "us"), your privacy is of utmost importance to us. This Privacy Policy outlines how we collect, use, and protect your personal information in compliance with the Information Technology Act, 2000 and other applicable laws of India.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
      <p>
        We may collect personal information such as your name, email address, phone number, college/university details, and platform usage data when you register and interact with our services.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
      <p>Your information is used to:</p>
      <ul className="list-disc pl-6 space-y-2 mt-4">
        <li>Provide, maintain, and improve our educational services.</li>
        <li>Process your transactions and manage your subscriptions.</li>
        <li>Communicate important updates, announcements, and promotional offers.</li>
        <li>Analyze platform usage to enhance the user experience.</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Data Protection</h2>
      <p>
        We implement robust security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Sharing Your Information</h2>
      <p>
        We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners and trusted affiliates.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at <strong>yogeshwarnd.dev@gmail.com</strong>.
      </p>
    </LegalLayout>
  );
};

export default PrivacyPolicyPage;
