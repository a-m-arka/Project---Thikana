import { featuredProperties } from '../data/properties';

const imageFor = (property) => {
  try {
    const images =
      typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
    return images?.find((image) => image.url)?.url || featuredProperties[0].image;
  } catch {
    return featuredProperties[0].image;
  }
};

export const toCardProperty = (property) => ({
  id: property.post_id || property.property_id,
  property_id: property.property_id,
  post_id: property.post_id || null,
  user_id: property.user_id,
  owner_name: property.owner_name,
  description: property.description,
  title: property.title,
  city: property.city,
  address: property.address,
  area: property.area || null,
  total_floors: property.total_floors ?? 0,
  total_rooms: property.total_rooms ?? 0,
  price: Number(property.price).toLocaleString(),
  type: property.type?.slice(0, 1).toUpperCase() + property.type?.slice(1),
  postType: property.post_type
    ? property.post_type.slice(0, 1).toUpperCase() + property.post_type.slice(1)
    : 'Not posted',
  image: imageFor(property),
  images:
    typeof property.images === 'string'
      ? (() => {
          try {
            return JSON.parse(property.images);
          } catch {
            return [];
          }
        })()
      : property.images || [],
});
