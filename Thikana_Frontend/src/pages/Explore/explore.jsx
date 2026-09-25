import { useEffect, useMemo, useState } from 'react';

import PropertyCard from '../../components/PropertyCard/propertyCard';
import SearchBox from '../../components/SearchBox/searchBox';
import { useAuth } from '../../context/AuthContext';
import { bangladeshCities } from '../../data/cities';
import { toCardProperty } from '../../utils/propertyDisplay';

import './explore.scss';

import Loader from '../../components/Loader/loader';

export default function Explore({ onMessageOwner }) {
  const { apiUrl, user } = useAuth();

  const [filters, setFilters] = useState({
    city: '',
    type: '',
    postType: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

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

  const properties = useMemo(
    () =>
      listedProperties.filter(
        (p) =>
          Number(p.user_id) !== Number(user?.user_id) &&
          (!searchTerm || (p.title || '').toLowerCase().includes(searchTerm.trim().toLowerCase())) &&
          (!filters.city || p.city === filters.city) &&
          (!filters.type || p.type === filters.type) &&
          (!filters.postType || p.postType === filters.postType)
      ),
    [filters, listedProperties, searchTerm, user?.user_id]
  );

  return (
    <div className="page explore">
      <div className="page-title">
        <p className="eyebrow">Find your place</p>
        <h1>Explore properties</h1>
        <p>Browse the latest spaces available to rent or buy.</p>
      </div>

      <SearchBox
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by property name"
      />

      <section className="filters">
        <select
          value={filters.city}
          onChange={(e) =>
            setFilters({ ...filters, city: e.target.value })
          }
        >
          <option value="">Any city</option>
          {bangladeshCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value })
          }
        >
          <option value="">Any type</option>
          <option>Flat</option>
          <option>House</option>
          <option>Commercial</option>
        </select>

        <select
          value={filters.postType}
          onChange={(e) =>
            setFilters({ ...filters, postType: e.target.value })
          }
        >
          <option value="">Rent or sell</option>
          <option>Rent</option>
          <option>Sell</option>
        </select>

        <button
          onClick={() => {
            setFilters({
              city: '',
              type: '',
              postType: '',
            });
            setSearchTerm('')
          }}
        >
          Clear filters
        </button>
      </section>

      {loading ? (
        <Loader
          width="100%"
          height="300px"
          text="Loading Properties"
        />
      ) : (
        <>
          <p className="results-label">
            {properties.length} properties found
          </p>

          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onMessageOwner={onMessageOwner}
              />
            ))}
          </div>

          {!properties.length && (
            <div className="empty-state">
              No properties match these filters. Try a different search.
            </div>
          )}
        </>
      )}
    </div>
  );
}
