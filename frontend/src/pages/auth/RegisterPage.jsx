import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext.jsx';
import TextField from '../../components/TextField.jsx';
import Button from '../../components/Button.jsx';
import RoleToggle from '../../components/RoleToggle.jsx';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pendingGoogleIdToken = location.state?.googleIdToken;

  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function redirectAfterAuth(user) {
    navigate(`/${user.role}${user.hasProfile === false && user.role === 'contractor' ? '/onboarding' : ''}`, {
      replace: true,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { user } = await register({ ...form, role });
      redirectAfterAuth(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function completeGoogleSignup(idToken) {
    setError('');
    try {
      const { user } = await loginWithGoogle({ idToken, role });
      redirectAfterAuth(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-up failed.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-navy px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-white">Create your account</h1>
        <p className="mb-6 text-sm text-navy-200">Join Mister as a customer or contractor</p>

        <div className="mb-6">
          <RoleToggle value={role} onChange={setRole} />
        </div>

        {pendingGoogleIdToken ? (
          <Button onClick={() => completeGoogleSignup(pendingGoogleIdToken)}>
            Continue with Google as {role === 'contractor' ? 'Contractor' : 'Customer'}
          </Button>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                label="Full name"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <TextField
                label="Phone (optional)"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                minLength={8}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating account…' : `Sign up as ${role === 'contractor' ? 'Contractor' : 'Customer'}`}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-navy-500" />
              <span className="text-xs text-navy-300">OR</span>
              <div className="h-px flex-1 bg-navy-500" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(cred) => completeGoogleSignup(cred.credential)}
                onError={() => setError('Google sign-up failed.')}
                theme="filled_black"
                shape="pill"
              />
            </div>
          </>
        )}

        <p className="mt-8 text-center text-sm text-navy-200">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
