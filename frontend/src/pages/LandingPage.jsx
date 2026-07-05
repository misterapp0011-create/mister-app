import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-navy px-6 py-10">
      <div className="mx-auto w-full max-w-sm pt-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Canada-wide</p>
        <h1 className="mt-2 text-4xl font-black text-white">Mister</h1>
        <p className="mt-4 text-navy-100">
          Book trusted trade pros. Chat, negotiate a price, and track your contractor live —
          all in one app.
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm space-y-3 pb-6">
        <Link to="/register">
          <Button>Get started</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">I already have an account</Button>
        </Link>
      </div>
    </div>
  );
}
