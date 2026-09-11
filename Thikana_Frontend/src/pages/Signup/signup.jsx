import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../Login/login.scss';
import logo from '../../assets/Thikana_logo_1.png'
export default function Signup() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { state: { message: 'Account created. Please log in.' } });
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
        <p className="eyebrow">Join Thikana</p>
        <h1>Create your account</h1>
        <p className="auth-copy">Start finding, saving, and listing places.</p>
        <form onSubmit={submit}>
          <label>
            Full name
            <input
              name="username"
              required
              value={form.username}
              onChange={change}
              placeholder="Your name"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={change}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Phone number
            <input
              name="phone"
              required
              value={form.phone}
              onChange={change}
              placeholder="01XXXXXXXXX"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={change}
              placeholder="At least 8 characters"
            />
          </label>
          <label>
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={change}
              placeholder="Repeat password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          Already a member? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}
