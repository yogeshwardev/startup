import React from 'react';
import LegalLayout from '../../layouts/LegalLayout';

const AboutPage = () => {
  return (
    <LegalLayout title="About Us">
      <h2 className="text-xl font-semibold text-white mt-8 mb-4">Our Mission</h2>
      <p>
        At CampusArena, our mission is to empower students with the tools, resources, and competitive environment they need to excel in their careers. We bridge the gap between academic learning and industry expectations.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">Who We Are</h2>
      <p>
        We are a passionate team of educators, technologists, and industry professionals dedicated to revolutionizing campus learning. CC Solutions brings together cutting-edge technology and proven pedagogical methods to create an immersive learning experience.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">What We Offer</h2>
      <ul className="list-disc pl-6 space-y-2 mt-4">
        <li><strong>Integrated Code Compiler:</strong> Practice coding in multiple languages instantly.</li>
        <li><strong>Placement Readiness:</strong> Access company-specific mock tests and interview preparation kits.</li>
        <li><strong>Gamified Learning:</strong> Participate in Department Wars and daily challenges to stay motivated.</li>
        <li><strong>Comprehensive Analytics:</strong> Track your progress with detailed performance metrics.</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">Our Vision</h2>
      <p>
        To become the ultimate launchpad for student careers, transforming every campus into a hub of innovation and excellence where every student is prepared to meet the challenges of the modern tech landscape.
      </p>
    </LegalLayout>
  );
};

export default AboutPage;
