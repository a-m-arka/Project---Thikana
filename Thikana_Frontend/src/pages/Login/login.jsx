import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './login.scss';
import logo from '../../assets/Thikana_logo_1.png'
export default function Login() {
  const { token, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  if (token) return <Navigate to="/app/explore" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/app/explore', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link className="auth-brand" to="/">
          <img src={logo} alt="Thikana Logo" />
        </Link>
        <p className="eyebrow">Welcome back</p>
        <h1>Log in to continue</h1>
        <p className="auth-copy">Your property journey is waiting for you.</p>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Your password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="auth-switch">
          New to Thikana? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
