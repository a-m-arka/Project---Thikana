import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bangladeshCities } from '../../data/cities';
import './editProperty.scss';

const emptyForm = {
  title: '',
  address: '',
  city: '',
  price: '',
  type: 'flat',
  description: '',
};

const parseImages = (images) => {
  if (typeof images === 'string') {
    try {
      return JSON.parse(images).filter((image) => image?.url);
    } catch {
      return [];
    }
  }

  return Array.isArray(images) ? images.filter((image) => image?.url) : [];
};

export default function EditProperty() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { apiUrl, authenticatedFetch } = useAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const remainingSlots = useMemo(() => Math.max(0, 10 - images.length), [images.length]);

  const loadProperty = useCallback(async () => {
    const response = await fetch(`${apiUrl}/property/properties/${propertyId}`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Unable to load this property');

    const property = data.property;
    setForm({
      title: property.title || '',
      address: property.address || '',
      city: property.city || '',
      price: property.price || '',
      type: property.type || 'flat',
      description: property.description || '',
    });
    setImages(parseImages(property.images));
  }, [apiUrl, propertyId]);

  useEffect(() => {
    loadProperty()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadProperty]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveDetails = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await authenticatedFetch(
        `${apiUrl}/property/update-property/${propertyId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Unable to save property');
      setMessage(data.message || 'Property details saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addImages = async (event) => {
    const selectedFiles = [...event.target.files].slice(0, remainingSlots);
    event.target.value = '';
    if (!selectedFiles.length) return;

    setUploading(true);
    setMessage('');
    setError('');

    try {
      const body = new FormData();
      selectedFiles.forEach((file) => body.append('files', file));
      const response = await authenticatedFetch(
        `${apiUrl}/property/add-new-images/${propertyId}`,
        { method: 'POST', body },
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Unable to add images');
      await loadProperty();
      setMessage(data.message || 'Images added successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (image) => {
    if (!image.publicId || !window.confirm('Delete this image?')) return;

    setDeletingImage(image.publicId);
    setMessage('');
    setError('');

    try {
      const response = await authenticatedFetch(
        `${apiUrl}/property/delete-images/${propertyId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageIds: [image.publicId] }),
        },
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Unable to delete image');
      setImages((current) => current.filter((item) => item.publicId !== image.publicId));
      setMessage(data.message || 'Image deleted successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingImage(null);
    }
  };

  if (loading) return <div className="page edit-property__state">Loading property...</div>;
  if (error && !form.title) return <div className="page edit-property__state">{error}</div>;

  return (
    <div className="page property-details edit-property">
      <Link className="property-details__back" to="/app/my-properties">
        <HiOutlineArrowLeft /> Back to my properties
      </Link>

      <header className="property-details__header">
        <div>
          <p className="eyebrow">Edit listing</p>
          <h1>{form.title || 'Property details'}</h1>
          <p className="property-details__location">Update the information buyers and renters see.</p>
        </div>
      </header>

      {(message || error) && (
        <p className={error ? 'notice edit-property__notice edit-property__notice--error' : 'notice edit-property__notice'}>
          {error || message}
        </p>
      )}

      <form className="edit-property__form" onSubmit={saveDetails}>
        <section className="property-details__section">
          <h2>Property details</h2>
          <div className="edit-property__fields">
            <label>
              Title
              <input value={form.title} onChange={(event) => updateField('title', event.target.value)} required />
            </label>
            <label>
              Address
              <input value={form.address} onChange={(event) => updateField('address', event.target.value)} required />
            </label>
            <label>
              City
              <select value={form.city} onChange={(event) => updateField('city', event.target.value)} required>
                <option value="">Select a city</option>
                {bangladeshCities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </label>
            <label>
              Price
              <input type="number" value={form.price} onChange={(event) => updateField('price', event.target.value)} required />
            </label>
            <label>
              Property type
              <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
                <option value="flat">Flat</option>
                <option value="house">House</option>
                <option value="commercial">Commercial</option>
              </select>
            </label>
          </div>
          <label className="edit-property__description">
            Description
            <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} required />
          </label>
          <button className="button" disabled={saving}>
            <HiOutlineCheck /> {saving ? 'Saving...' : 'Save details'}
          </button>
        </section>
      </form>

      <section className="property-details__section">
        <div className="edit-property__section-heading">
          <div>
            <h2>Photos</h2>
            <p>{images.length} of 10 images</p>
          </div>
          {remainingSlots > 0 && <span>{remainingSlots} slots remaining</span>}
        </div>

        <div className="edit-property__gallery">
          {images.map((image, index) => (
            <div className="edit-property__image" key={image.publicId || image.url}>
              <img src={image.url} alt={`${form.title} ${index + 1}`} />
              <button
                type="button"
                className="edit-property__delete-image"
                onClick={() => deleteImage(image)}
                disabled={deletingImage === image.publicId || image.pending}
                title="Delete image"
              >
                <HiOutlineTrash />
              </button>
            </div>
          ))}

          {remainingSlots > 0 && (
            <button
              type="button"
              className="edit-property__add-image"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Add images"
            >
              <HiOutlinePlus />
              <span>{uploading ? 'Uploading...' : 'Add image'}</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          className="edit-property__file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={addImages}
        />
      </section>
    </div>
  );
}
