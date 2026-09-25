import { pool } from "../config/db.js";
import propertyQueries from "../queries/propertyQueries.js";

export const addNewProperty = async (userId, property) => {
  const query = propertyQueries.addNewProperty;
  const values = [
    userId,
    property.title,
    property.address,
    property.city,
    property.price,
    property.type,
    property.description,
  ];

  try {
    const [result] = await pool.query(query, values);
    return { success: true, propertyId: result.insertId };
  } catch (error) {
    console.error("Error adding property in database:", error);
    return {
      success: false,
      message: "Error adding property in database",
      error: error,
    };
  }
};

export const deleteProperty = async (propertyId) => {
  const query = propertyQueries.deleteProperty;
  const values = [propertyId];

  try {
    await pool.query(query, values);
    return { success: true, message: "Property deleted successfully" };
  } catch (error) {
    console.error("Error deleting property from database:", error);
    return {
      success: false,
      message: "Error deleting property from database",
      error: error,
    };
  }
};

export const updateProperty = async (propertyId, property) => {
  const query = propertyQueries.updateProperty;
  const values = [
    property.title,
    property.address,
    property.city,
    property.price,
    property.type,
    property.description,
    propertyId,
  ];

  try {
    await pool.query(query, values);
    return { success: true, message: "Property updated successfully" };
  } catch (error) {
    console.error("Error updating property in database:", error);
    return {
      success: false,
      message: "Error updating property in database",
      error: error,
    };
  }
};

export const addPropertyImage = async (propertyId, imageUrl, publicId) => {
  const query = propertyQueries.addPropertyImage;
  const values = [propertyId, imageUrl, publicId];

  try {
    await pool.query(query, values);
    return { success: true, message: "Image added to database successfully" };
  } catch (error) {
    console.error("Error adding property image to database:", error);
    return {
      success: false,
      message: "Error adding property image to database",
      error: error,
    };
  }
};

export const deletePropertyImage = async (publicId) => {
  const query = propertyQueries.deletePropertyImage;
  const values = [publicId];

  try {
    await pool.query(query, values);
    return { success: true, message: "Image deleted database successfully" };
  } catch (error) {
    console.error("Error deleting property image from database:", error);
    return {
      success: false,
      message: "Error deleting property image from database",
      error: error,
    };
  }
};

export const getPropertyImageIds = async (propertyId) => {
  const query = propertyQueries.getPropertyImageIds;
  const values = [propertyId];

  try {
    const [images] = await pool.query(query, values);
    const imageIds = images.map((image) => image.cloudinary_public_id);
    return { success: true, imageIds };
  } catch (error) {
    console.error("Error fetching property images from database:", error);
    return {
      success: false,
      message: "Error fetching property images from database",
      error: error,
    };
  }
};

export const getAllPropertiesOfUser = async (userId) => {
  const query = propertyQueries.getAllPropertiesOfUser;
  const values = [userId];

  try {
    const [properties] = await pool.query(query, values);
    return { success: true, properties };
  } catch (error) {
    console.error("Error fetching properties from database:", error);
    return {
      success: false,
      message: "Error fetching properties from database",
      error: error,
    };
  }
};

export const getAllProperties = async () => {
  try {
    const [properties] = await pool.query(propertyQueries.getAllProperties);
    return { success: true, properties };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { success: false, message: "Error fetching properties", error };
  }
};

export const getPropertyById = async (propertyId) => {
  try {
    const [properties] = await pool.query(propertyQueries.getPropertyById, [
      propertyId,
    ]);
    return properties.length
      ? { success: true, property: properties[0] }
      : { success: false, message: "Property not found" };
  } catch (error) {
    console.error("Error fetching property:", error);
    return { success: false, message: "Error fetching property", error };
  }
};

export const checkUserPropertyOwnership = async (userId, propertyId) => {
  const query = propertyQueries.checkUserPropertyOwnership;
  const values = [propertyId, userId];

  try {
    const [result] = await pool.query(query, values);
    return { success: true, ownership: result[0].count > 0 };
  } catch (error) {
    console.error("Error checking property ownership in database:", error);
    return {
      success: false,
      message: "Error checking ownership of property",
      error: error,
    };
  }
};

export const checkPropertyImageOwnership = async (propertyId, imageId) => {
  const query = propertyQueries.checkPropertyImageOwnership;
  const values = [propertyId, imageId];

  try {
    const [result] = await pool.query(query, values);
    return { success: true, ownership: result[0].imageCount > 0 };
  } catch (error) {
    console.error("Error checking image ownership in database:", error);
    return {
      success: false,
      message: "Error checking ownership of image",
      error: error,
    };
  }
};

export const getOwnedPropertyImage = async (publicId, userId) => {
  const query = propertyQueries.getOwnedPropertyImage;
  const values = [publicId, userId];

  try {
    const [images] = await pool.query(query, values);
    return { success: true, image: images[0] || null };
  } catch (error) {
    console.error("Error checking image ownership in database:", error);
    return {
      success: false,
      message: "Error checking ownership of image",
      error,
    };
  }
};

export const countPropertyImages = async (propertyId) => {
  const query = propertyQueries.countPropertyImages;
  const values = [propertyId];

  try {
    const [result] = await pool.query(query, values);
    return { success: true, imageCount: result[0].image_count };
  } catch (error) {
    console.error("Error counting property images in database:", error);
    return {
      success: false,
      message: "Error counting property images",
      error: error,
    };
  }
};
