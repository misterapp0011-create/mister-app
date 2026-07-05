import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center">
      <h1 className="text-3xl font-bold text-white">404</h1>
      <p className="mt-2 text-navy-200">This page doesn't exist.</p>
      <Link to="/" className="mt-6 text-sm font-semibold text-accent">
        Back to home
      </Link>
    </div>
  );
}
