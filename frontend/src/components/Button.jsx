export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'w-full rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100';
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-dark',
    secondary: 'bg-navy-700 text-white hover:bg-navy-600 border border-navy-500',
    ghost: 'bg-transparent text-navy-100 hover:bg-navy-700',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
