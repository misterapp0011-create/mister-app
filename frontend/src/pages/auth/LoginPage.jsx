import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext.jsx';
import TextField from '../../components/TextField.jsx';
import Button from '../../components/Button.jsx';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectAfterAuth = (user) => {
    const dest = location.state?.from?.pathname || `/${user.role}`;
    navigate(dest, { replace: true });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { user } = await login(form);
      redirectAfterAuth(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError('');
    try {
      const { user } = await loginWithGoogle({ idToken: credentialResponse.credential });
      redirectAfterAuth(user);
    } catch (err) {
      if (err.response?.data?.details?.code === 'ROLE_REQUIRED') {
        navigate('/register', { state: { googleIdToken: credentialResponse.credential } });
        return;
      }
      setError(err.response?.data?.error || 'Google sign-in failed.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-navy px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-white">Welcome back</h1>
        <p className="mb-8 text-sm text-navy-200">Sign in to Mister</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-navy-500" />
          <span className="text-xs text-navy-300">OR</span>
          <div className="h-px flex-1 bg-navy-500" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed.')}
            theme="filled_black"
            shape="pill"
          />
        </div>

        <p className="mt-8 text-center text-sm text-navy-200">
          New to Mister?{' '}
          <Link to="/register" className="font-semibold text-accent">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
