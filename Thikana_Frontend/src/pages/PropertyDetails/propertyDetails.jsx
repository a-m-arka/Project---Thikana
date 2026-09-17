import { useEffect, useState } from 'react';
import { HiOutlineChatBubbleLeft, HiOutlineMapPin } from 'react-icons/hi2';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toCardProperty } from '../../utils/propertyDisplay';
import './propertyDetails.scss';

export default function PropertyDetails({ onMessageOwner }) {
  const { propertyId } = useParams();
  const { apiUrl, user } = useAuth();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const response = await fetch(`${apiUrl}/property/properties/${propertyId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Unable to load this property');
        setProperty(toCardProperty(data.property));
      } catch (err) {
        setError(err.message);
      }
    };

    loadProperty();
  }, [apiUrl, propertyId]);

  if (error) {
    return <div className="page property-details__state">{error}</div>;
  }

  if (!property) {
    return <div className="page property-details__state">Loading property…</div>;
  }

  const isOwner = Number(property.user_id) === Number(user?.user_id);
  const images = property.images.filter((image) => image.url);

  return (
    <div className="page property-details">
      <Link className="property-details__back" to={isOwner ? '/app/my-properties' : '/app/explore'}>
        ← Back to properties
      </Link>
      <header className="property-details__header">
        <div>
          <p className="eyebrow">{property.postType}</p>
          <h1>{property.title}</h1>
          <p className="property-details__location">
            <HiOutlineMapPin /> {property.address}, {property.city}
          </p>
        </div>
        <div className="property-details__price">
          ৳ {property.price}
          {property.postType === 'Rent' && <small> / month</small>}
        </div>
      </header>

      {!isOwner && property.post_id && (
        <button
          className="button property-details__message"
          onClick={() => onMessageOwner(property)}
        >
          <HiOutlineChatBubbleLeft /> Message owner
        </button>
      )}

      <section className="property-details__section">
        <h2>About this property</h2>
        <p>{property.description || 'No description has been added yet.'}</p>
      </section>

      <section className="property-details__section">
        <h2>Property information</h2>
        <dl className="property-details__facts">
          <div>
            <dt>Type</dt>
            <dd>{property.type}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{property.city}</dd>
          </div>
          <div>
            <dt>Listed by</dt>
            <dd>{property.owner_name || 'Property owner'}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{property.postType}</dd>
          </div>
        </dl>
      </section>

      <section className="property-details__section">
        <h2>Photos</h2>
        {images.length ? (
          <div className="property-details__gallery">
            {images.map((image, index) => (
              <img
                key={image.publicId || image.url}
                src={image.url}
                alt={`${property.title} ${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <p>No photos have been added yet.</p>
        )}
      </section>
    </div>
  );
}
