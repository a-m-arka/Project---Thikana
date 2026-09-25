import { HiOutlineChatBubbleLeft, HiOutlineMapPin } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import './propertyCard.scss';
export default function PropertyCard({
  property,
  onMessageOwner,
  actions,
  primaryAction,
  detailsInActions = false,
}) {
  return (
    <article className="property-card">
      <div className="property-card__image">
        <img src={property.image} alt={property.title} />
        <span>{property.postType}</span>
      </div>
      <div className="property-card__body">
        <p className="property-card__type">{property.type}</p>
        <h3>{property.title}</h3>
        <p className="property-card__location">
          <HiOutlineMapPin /> {property.address}, {property.city}
        </p>
        <p className="property-card__price">
          ৳ {property.price}
          <small>{property.postType === 'Rent' ? ' / month' : ''}</small>
        </p>
        <div className="property-card__primary-actions">
          {primaryAction}
          {!detailsInActions && (
            <Link
              className="property-card__details"
              to={`/app/properties/${property.property_id || property.id}`}
            >
              See details
            </Link>
          )}
          {onMessageOwner && (
            <button
              className="property-card__message"
              onClick={() => onMessageOwner(property)}
              disabled={!property.user_id}
              title={
                property.user_id
                  ? `Message ${property.owner_name || 'the owner'}`
                  : 'Owner information is unavailable'
              }
            >
              <HiOutlineChatBubbleLeft /> Message owner
            </button>
          )}
        </div>
        {actions && (
          <div className="property-card__actions">
            {detailsInActions && (
              <Link
                className="property-card__details"
                to={`/app/properties/${property.property_id || property.id}`}
              >
                See details
              </Link>
            )}
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}
