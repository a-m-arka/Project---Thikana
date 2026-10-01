import { HiOutlineChatBubbleLeft, HiOutlineMapPin, HiOutlineEye } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import './propertyCard.scss';
export default function PropertyCard({
  property,
  onMessageOwner,
  actions,
  primaryAction,
  detailsInActions = false,
  showViews = false,
}) {
  return (
    <article className="property-card">
      <div className="property-card__image">
        <img src={property.image} alt={property.title} />
        <span className="property-card__post-status">{property.postType}</span>
        {showViews && (
          <span className="property-card__views" title={`${property.views ?? 0} views`}>
            <HiOutlineEye /> {property.views ?? 0}
          </span>
        )}
      </div>
      <div className="property-card__body">
        <p className="property-card__type">{property.type}</p>
        <h3>{property.title}</h3>
        <p className="property-card__location">
          <HiOutlineMapPin /> {property.address}, {property.city}
        </p>
        {(property.area || (property.type !== "Plot" && (property.total_rooms > 0 || property.total_floors > 0))) && (
          <div className="property-card__specs">
            {property.area && <span>{property.area} sq ft</span>}
            {property.type !== "Plot" && property.total_rooms > 0 && (
              <span>{property.total_rooms} {property.total_rooms === 1 ? "room" : "rooms"}</span>
            )}
            {property.type !== "Plot" && property.total_floors > 0 && (
              <span>{property.total_floors} {property.total_floors === 1 ? "floor" : "floors"}</span>
            )}
          </div>
        )}
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
