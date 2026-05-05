const toneClasses = {
  error: "border-red-100 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  info: "border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
};

export default function InlineMessage({ children, className = "", tone = "error" }) {
  if (!children) return null;

  return (
    <p className={`rounded-md border px-3 py-2 text-sm font-medium ${toneClasses[tone] || toneClasses.error} ${className}`}>
      {children}
    </p>
  );
}
