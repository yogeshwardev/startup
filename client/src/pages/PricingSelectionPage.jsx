import React from "react";
import { CheckCircle2, XCircle, LogOut } from "lucide-react";
import CheckoutButton from "../components/payment/CheckoutButton";
import { useAuth } from "../hooks/useAuth";

const PricingSelectionPage = () => {
  const { user, logout } = useAuth();

  const handleSuccess = (response) => {
    // Manually update local storage since AuthContext initializes from it on full reload
    const storedUser = JSON.parse(localStorage.getItem("campusarena-user") || "{}");
    storedUser.isPaid = true;
    storedUser.planType = response.planType || 'YEARLY';
    localStorage.setItem("campusarena-user", JSON.stringify(storedUser));
    
    window.location.href = "/dashboard";
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-surface text-gray-300">
      {/* Simple Header with Logout */}
      <div className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="font-display font-bold text-xl text-white tracking-tight">CampusArena</div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Complete Your Registration</h1>
          <p className="text-gray-400 text-lg">
            Hi {user?.name}, access the CampusArena dashboard and build your future with us, by completing the process .
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plan 1: Semester Pass */}
          <div className="bg-surface-50 border border-border p-8 rounded-2xl flex flex-col relative transition-transform hover:-translate-y-2">
            <h3 className="text-xl font-bold text-white mb-2">Semester Pass</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">₹499</span>
              <span className="text-gray-400">/ 6 months</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                { text: "Full Compiler Access", included: true },
                { text: "Campus Leaderboards", included: true },
                { text: "Company Specific Tests", included: false },
                { text: "Placement Analytics", included: false },
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  {feature.included ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-600 shrink-0" />
                  )}
                  <span className={feature.included ? "text-gray-300" : "text-gray-500"}>{feature.text}</span>
                </li>
              ))}
            </ul>
            <CheckoutButton 
              amount={49900} 
              planName="Semester Pass"
              onSuccess={handleSuccess}
              className="w-full py-3 rounded-lg font-bold bg-surface-100 hover:bg-surface-200 text-white transition-colors"
            >
              Get Semester Pass
            </CheckoutButton>
          </div>

          {/* Plan 2: Yearly Pass */}
          <div className="bg-surface-50 border border-brand-500/50 p-8 rounded-2xl flex flex-col relative transition-transform hover:-translate-y-2 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-500 to-emerald-400 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Yearly Pass</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">₹799</span>
              <span className="text-gray-400">/ 12 months</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                { text: "Full Compiler Access", included: true },
                { text: "Campus Leaderboards", included: true },
                { text: "Company Specific Tests", included: true },
                { text: "Placement Analytics", included: true },
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
                  <span className="text-gray-300">{feature.text}</span>
                </li>
              ))}
            </ul>
            <CheckoutButton 
              amount={79900} 
              planName="Yearly Pass"
              onSuccess={handleSuccess}
              className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white transition-all shadow-lg"
            >
              Get Yearly Pass
            </CheckoutButton>
          </div>

          {/* Plan 3: Graduation Pass */}
          <div className="bg-surface-50 border border-border p-8 rounded-2xl flex flex-col relative transition-transform hover:-translate-y-2">
            <h3 className="text-xl font-bold text-white mb-2">Graduation Pass</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">₹1599</span>
              <span className="text-gray-400">/ 3 years</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                { text: "Everything in Yearly", included: true },
                { text: "1:1 Mentorship Access", included: true },
                { text: "Resume Reviews", included: true },
                { text: "Priority Support", included: true },
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
                  <span className="text-gray-300">{feature.text}</span>
                </li>
              ))}
            </ul>
            <CheckoutButton 
              amount={159900} 
              planName="Graduation Pass"
              onSuccess={handleSuccess}
              className="w-full py-3 rounded-lg font-bold bg-surface-100 hover:bg-surface-200 text-white transition-colors"
            >
              Get Graduation Pass
            </CheckoutButton>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PricingSelectionPage;
