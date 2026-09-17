import { Link } from 'react-router-dom';

import { useEffect, useMemo, useState } from 'react';

import {
  HiArrowRight,
  HiOutlineBuildingOffice2,
  HiOutlineKey,
  HiOutlineMapPin,
} from 'react-icons/hi2';

import PropertyCard from '../../components/PropertyCard/propertyCard';

import Loader from '../../components/Loader/loader';

import { useAuth } from '../../context/AuthContext';

import { toCardProperty } from '../../utils/propertyDisplay';

import './home.scss';

export default function Home({ onMessageOwner }) {
  const { apiUrl, user } = useAuth();

  const [listedProperties, setListedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/post/posts`);
        const data = await response.json();

        if (response.ok) {
          setListedProperties((data.posts || []).map(toCardProperty));
        }
      } catch {
        // Preserve the original silent failure behavior.
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [apiUrl]);

  const visibleProperties = useMemo(
    () =>
      listedProperties.filter(
        (property) =>
          Number(property.user_id) !== Number(user?.user_id)
      ),
    [listedProperties, user?.user_id]
  );

  return (
    <div className="page home">
      <section className="home__welcome">
        <div>
          <p className="eyebrow">Welcome to Thikana</p>

          <h1>Find a space that fits your life.</h1>

          <p>
            Explore homes and spaces from trusted members across
            Bangladesh.
          </p>

          <Link to="/app/explore" className="button">
            Explore properties <HiArrowRight />
          </Link>
        </div>

        <div className="home__stats">
          <span>
            <HiOutlineBuildingOffice2 />
            <strong>500+</strong>
            <small>Active listings</small>
          </span>

          <span>
            <HiOutlineMapPin />
            <strong>20+</strong>
            <small>Cities covered</small>
          </span>

          <span>
            <HiOutlineKey />
            <strong>Simple</strong>
            <small>Property management</small>
          </span>
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Fresh picks</p>
            <h2>Recently listed</h2>
          </div>

          <Link to="/app/explore">
            View all <HiArrowRight />
          </Link>
        </div>

        {loading ? (
          <Loader
            width="100%"
            height="250px"
            text="Loading properties"
          />
        ) : (
          <div className="property-grid">
            {visibleProperties.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onMessageOwner={onMessageOwner}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
