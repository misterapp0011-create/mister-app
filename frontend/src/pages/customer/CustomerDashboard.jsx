import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import ContractorCard from '../../components/ContractorCard.jsx';
import TextField from '../../components/TextField.jsx';
import { fetchContractors } from '../../services/contractorApi.js';

export default function CustomerDashboard() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [trade, setTrade] = useState('');

  // All trades seen so far, kept across filtered fetches so the dropdown
  // doesn't shrink to just whatever the current filter returned.
  const [allTrades, setAllTrades] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setError('');
        try {
          const data = await fetchContractors({
            q: search || undefined,
            trade: trade || undefined,
          });
          if (cancelled) return;
          setContractors(data);
          setAllTrades((prev) => {
            const bySlug = new Map(prev.map((t) => [t.slug, t]));
            for (const c of data) {
              bySlug.set(c.trade_slug, { slug: c.trade_slug, name: c.trade_name });
            }
            return Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name));
          });
        } catch (err) {
          if (!cancelled) setError(err.response?.data?.error || 'Failed to load contractors.');
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => {
        cancelled = true;
      };
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, trade]);

  const emptyState = useMemo(
    () => !loading && !error && contractors.length === 0,
    [loading, error, contractors]
  );

  return (
    <DashboardShell title="Find a pro" subtitle="Browse contractors by trade and location.">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <TextField
            placeholder="Search by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
          className="rounded-xl border border-navy-500 bg-navy-700 px-4 py-3 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        >
          <option value="">All trades</option>
          {allTrades.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-navy-200">Loading contractors...</p>}

      {error && (
        <div className="rounded-2xl border border-dashed border-red-400/50 p-6 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {emptyState && (
        <div className="rounded-2xl border border-dashed border-navy-500 p-8 text-center text-sm text-navy-200">
          No contractors match your search.
        </div>
      )}

      {!loading && !error && contractors.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {contractors.map((contractor) => (
            <ContractorCard key={contractor.id} contractor={contractor} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
