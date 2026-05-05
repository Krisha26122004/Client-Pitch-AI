import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

const MotionDiv = motion.div;

const Toast = ({ show, message, onClose }) => {
    return (
        <AnimatePresence>
            {show && (
                <MotionDiv
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-6 right-6 z-[9999] flex items-center gap-4 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-[350px]"
                >
                    {/* Icon container */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                        <AlertCircle size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Limit Reached
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                            {message}
                        </p>
                    </div>

                    {/* Close button */}
                    <button 
                        onClick={onClose}
                        className="flex-shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Subtle progress bar at bottom */}
                    <MotionDiv 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 4, ease: "linear" }}
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-red-500/20 rounded-full"
                    />
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

export default Toast;
