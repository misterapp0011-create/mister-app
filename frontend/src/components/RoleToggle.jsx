const ROLES = [
  { value: 'customer', label: "I'm a Customer", hint: 'Book trusted pros' },
  { value: 'contractor', label: "I'm a Contractor", hint: 'Get hired for jobs' },
];

export default function RoleToggle({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ROLES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange(r.value)}
          className={`rounded-xl border px-3 py-4 text-left transition ${
            value === r.value
              ? 'border-accent bg-accent/10'
              : 'border-navy-500 bg-navy-700 hover:border-navy-300'
          }`}
        >
          <div className="text-sm font-semibold text-white">{r.label}</div>
          <div className="text-xs text-navy-200">{r.hint}</div>
        </button>
      ))}
    </div>
  );
}
