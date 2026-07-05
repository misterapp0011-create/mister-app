import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-navy pb-20">
      <header className="sticky top-0 z-10 border-b border-navy-700 bg-navy/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-accent">Mister</p>
            <h1 className="text-lg font-bold text-white">{title}</h1>
          </div>
          <button onClick={logout} className="text-xs font-medium text-navy-200 hover:text-white">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 py-6">
        {subtitle && <p className="mb-6 text-sm text-navy-200">{subtitle}</p>}
        {children ?? (
          <div className="rounded-2xl border border-dashed border-navy-500 p-8 text-center">
            <p className="text-sm text-navy-200">
              Signed in as <span className="font-semibold text-white">{user?.fullName}</span> ({user?.role})
            </p>
            <p className="mt-2 text-xs text-navy-300">This dashboard is built out in the next phase.</p>
          </div>
        )}
      </main>
    </div>
  );
}
