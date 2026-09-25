import { useCallback, useEffect, useState } from 'react';

import {
  HiOutlineArrowUpOnSquare,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
} from 'react-icons/hi2';

import { useAuth } from '../../context/AuthContext';

import PropertyCard from '../../components/PropertyCard/propertyCard';
import Loader from '../../components/Loader/loader';

import { toCardProperty } from '../../utils/propertyDisplay';

import './myProperties.scss';

const emptyForm = {
  title: '',
  address: '',
  city: '',
  price: '',
  type: 'flat',
  description: '',
};

export default function MyProperties() {
  const { apiUrl, authenticatedFetch } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [registeringProperty, setRegisteringProperty] = useState(false);
  const [editingProperty, setEditingProperty] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  const [editingId, setEditingId] = useState(null);

  const [postingPropertyId, setPostingPropertyId] = useState(null);
  const [postType, setPostType] = useState('rent');

  const loadProperties = useCallback(async () => {
    setLoading(true);

    try {
      const response = await authenticatedFetch(`${apiUrl}/property/user-properties`);

      const data = await response.json();

      setProperties(data.properties || []);
    } catch {
      setMessage(
        'Could not load your properties. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authenticatedFetch]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (editingId) {
        setEditingProperty(true);

        response = await authenticatedFetch(
          `${apiUrl}/property/update-property/${editingId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          }
        );
      } else {
        setRegisteringProperty(true);

        const data = new FormData();

        Object.entries(form).forEach(([key, value]) => {
          data.append(key, value);
        });

        files.forEach((file) => {
          data.append('files', file);
        });

        response = await authenticatedFetch(
          `${apiUrl}/property/register-property`,
          {
            method: 'POST',
            body: data,
          }
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setMessage(result.message);

      closeForm();

      loadProperties();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setRegisteringProperty(false);
      setEditingProperty(false);
    }
  };

  const editProperty = (property) => {
    setEditingId(property.property_id);

    setForm({
      title: property.title || '',
      address: property.address || '',
      city: property.city || '',
      price: property.price || '',
      type: property.type || 'flat',
      description: property.description || '',
    });

    setFiles([]);
    setMessage('');
    setShowForm(true);
  };

  const deleteProperty = async (property) => {
    if (
      !window.confirm(
        `Delete “${property.title}”? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await authenticatedFetch(
        `${apiUrl}/property/delete-property/${property.property_id}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setMessage(result.message);

      loadProperties();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFiles([]);
  };

  const createPost = async (property) => {
    try {
      const response = await authenticatedFetch(
        `${apiUrl}/post/create-post/${property.property_id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postType }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setMessage(result.message);
      setPostingPropertyId(null);

      loadProperties();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="page properties-page">
      <div className="properties-page__header">
        <div style={{ marginBottom: '15px' }}>
          <p className="eyebrow">Your listings</p>

          <h1>My Properties</h1>

          <p>
            Manage property details, photos, and listing status in one
            place.
          </p>
        </div>

        <button
          className="button"
          onClick={() =>
            showForm ? closeForm() : setShowForm(true)
          }
        >
          <HiOutlinePlus />
          Add Property
        </button>
      </div>

      {showForm && (
        <form className="property-form" onSubmit={submit}>
          <h2>
            {editingId ? 'Edit property' : 'Add a property'}

            <span
              onClick={closeForm}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  closeForm();
                }
              }}
            >
              <HiOutlineXMark />
            </span>
          </h2>

          <div className="form-grid">
            <label>
              Title

              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Address

              <input
                required
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
              />
            </label>

            <label>
              City

              <input
                required
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Price

              <input
                type="number"
                required
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Property type

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
              >
                <option value="flat">Flat</option>
                <option value="house">House</option>
                <option value="commercial">Commercial</option>
              </select>
            </label>

            {!editingId && (
              <label>
                Images (up to 10)

                <input
                  type="file"
                  required
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setFiles(
                      [...e.target.files].slice(0, 10)
                    )
                  }
                />
              </label>
            )}
          </div>

          <label>
            Description

            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </label>

          <button
            className="button"
            disabled={registeringProperty || editingProperty}
          >
            {editingId
              ? editingProperty
                ? 'Saving...'
                : 'Save changes'
              : registeringProperty
                ? 'Registering...'
                : 'Register property'}
          </button>
        </form>
      )}

      {message && <p className="notice">{message}</p>}

      {loading ? (
        <Loader
          width="100%"
          height="300px"
          text="Loading your properties"
        />
      ) : properties.length ? (
        <div className="property-grid my-property-grid">
          {properties.map((p) => (
            <PropertyCard
              key={p.property_id}
              property={toCardProperty(p)}
              actions={
                <>
                  {p.post_id ? (
                    <span className="property-card__posted">
                      Posted for {p.post_type}
                    </span>
                  ) : postingPropertyId === p.property_id ? (
                    <div className="property-card__post-controls">
                      <select
                        value={postType}
                        onChange={(event) =>
                          setPostType(event.target.value)
                        }
                      >
                        <option value="rent">Rent</option>
                        <option value="sell">Sell</option>
                      </select>

                      <button
                        onClick={() => createPost(p)}
                      >
                        Confirm post
                      </button>

                      <button
                        onClick={() =>
                          setPostingPropertyId(null)
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setPostType('rent');
                        setPostingPropertyId(p.property_id);
                      }}
                      title={`Post ${p.title}`}
                    >
                      <HiOutlineArrowUpOnSquare />
                      Post
                    </button>
                  )}

                  <button
                    onClick={() => editProperty(p)}
                    title={`Edit ${p.title}`}
                  >
                    <HiOutlinePencilSquare />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProperty(p)}
                    title={`Delete ${p.title}`}
                  >
                    <HiOutlineTrash />
                    Delete
                  </button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No properties yet</h2>

          <p>
            Add your first property to start managing your listing.
          </p>

          <button
            className="button"
            onClick={() => setShowForm(true)}
          >
            Add Property
          </button>
        </div>
      )}
    </div>
  );
}