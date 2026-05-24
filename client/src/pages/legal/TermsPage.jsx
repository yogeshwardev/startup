import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const TermsPage = () => {
  return (
    <LegalLayout title="Terms of Service" lastUpdated={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}>
      <p>
        Welcome to CampusArena. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our platform.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Use of the Platform</h2>
      <p>
        You are granted a non-exclusive, non-transferable, revocable license to access and use CampusArena strictly in accordance with these terms. As a condition of your use, you warrant that you will not use the platform for any purpose that is unlawful or prohibited by these terms.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Intellectual Property</h2>
      <p>
        All content included on the platform, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the platform, is the property of CC Solutions or its suppliers and protected by copyright and other laws that protect intellectual property and proprietary rights.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Misuse of the Platform</h2>
      <p>
        Any misuse of our intellectual property, unauthorized access to our systems, or disruptive behavior may result in immediate termination of your account and strict legal action under the Information Technology Act.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Modifications to Terms</h2>
      <p>
        We reserve the right, in our sole discretion, to change the Terms under which CampusArena is offered. The most current version of the Terms will supersede all previous versions.
      </p>
    </LegalLayout>
  );
};

export default TermsPage;
