import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-12 px-4 transition-colors duration-300">
      <div className="relative max-w-3xl w-full bg-white dark:bg-gray-800 shadow-md border dark:border-gray-700 rounded-xl p-8 transition-colors duration-300">
        <Link
          to="/"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-6">Terms of Service</h1>
        <div className="text-gray-700 dark:text-gray-300 space-y-4">
          <p>
            Welcome to ClientPitch AI. By using our service, you agree to be bound by the following terms and conditions.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">1. Use of Service</h2>
          <p>
            ClientPitch AI provides a platform for generating client pitches. You agree to use this platform responsibly and legally.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">2. User Accounts</h2>
          <p>
            You are responsible for maintaining the security of your account and password. ClientPitch AI cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">3. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time for any reason, with or without notice.
          </p>
        </div>
      </div>
    </div>
  );
}
