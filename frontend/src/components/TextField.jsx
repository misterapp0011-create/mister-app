export default function TextField({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-navy-100">{label}</span>}
      <input
        className={`w-full rounded-xl border border-navy-500 bg-navy-700 px-4 py-3 text-sm text-white placeholder-navy-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}
