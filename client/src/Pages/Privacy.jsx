import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-12 px-4 transition-colors duration-300">
      <div className="relative max-w-3xl w-full bg-white dark:bg-gray-800 shadow-md border dark:border-gray-700 rounded-xl p-8 transition-colors duration-300">
        <Link 
          to="/" 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-6">Privacy Policy</h1>
        <div className="text-gray-700 dark:text-gray-300 space-y-4">
          <p>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use ClientPitch AI.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create or modify your account, or contact us. This includes your name, email address, and company details.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">2. How We Use Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, as well as to communicate with you.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">3. Data Security</h2>
          <p>
            We implement reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.
          </p>
        </div>
      </div>
    </div>
  );
}
