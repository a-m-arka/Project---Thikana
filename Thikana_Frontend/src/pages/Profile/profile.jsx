import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './profile.scss';
export default function Profile() {
  const { apiUrl, user, updateUser, authenticatedFetch } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    address: user?.address || '',
  });
  const [message, setMessage] = useState('');
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await authenticatedFetch(`${apiUrl}/user/get-user-data`);
        const data = await response.json();

        if (data.data) {
          updateUser(data.data);
          setForm({
            name: data.data.name || '',
            email: data.data.email || '',
            phone: data.data.phone_number || '',
            address: data.data.address || '',
          });
        }
      } catch {
        // Preserve the original silent failure behavior.
      }
    };

    loadUserData();
  }, [apiUrl, authenticatedFetch]);
  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const r = await authenticatedFetch(`${apiUrl}/user/edit-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      updateUser({ ...user, ...form, phone_number: form.phone });
      setMessage(data.message);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="page profile-page">
      <p className="eyebrow">Account settings</p>
      <h1>My Profile</h1>
      <p className="profile-page__lead">
        Keep your contact information current so interested members can reach you.
      </p>
      <form onSubmit={submit}>
        <div className="profile-avatar">{(form.name || 'U')[0].toUpperCase()}</div>
        <div className="form-grid">
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Phone number
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label>
            Address
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
        </div>
        {message && <p className="notice">{message}</p>}
        <button className="button" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
