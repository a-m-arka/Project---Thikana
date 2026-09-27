import prisma from "../config/prisma.js";
import { getUserFromToken } from "../utils/authUtils.js";
import * as cloudinaryUtils from "../utils/cloudinaryUtils.js";

export const registerProperty = async (token, property, files) => {
  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const uploadImageResponse =
      await cloudinaryUtils.uploadMultipleImages(files);
    if (!uploadImageResponse.success) {
      return uploadImageResponse;
    }

    // Create property and its associated images in a single atomic transaction
    await prisma.properties.create({
      data: {
        user_id: user.user_id,
        title: property.title,
        address: property.address,
        city: property.city,
        price: property.price,
        type: property.type,
        description: property.description,
        property_images: {
          create: uploadImageResponse.results.map((image) => ({
            image_url: image.url,
            cloudinary_public_id: image.publicId,
          })),
        },
      },
    });

    return { success: true, message: "Property registered successfully" };
  } catch (error) {
    console.error("Error registering property:", error);
    return {
      success: false,
      message: "Error registering property",
      error,
    };
  }
};

export const deleteProperty = async (token, propertyId) => {
  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const propId = Number(propertyId);

    // Verify property ownership and get associated image public IDs
    const property = await prisma.properties.findFirst({
      where: {
        property_id: propId,
        user_id: user.user_id,
      },
      include: {
        property_images: true,
      },
    });

    if (!property) {
      return { success: false, message: "User doesn't have such property" };
    }

    // Delete images from Cloudinary
    const publicIds = property.property_images
      .map((img) => img.cloudinary_public_id)
      .filter(Boolean);

    if (publicIds.length > 0) {
      const deleteImagesResponse =
        await cloudinaryUtils.deleteMultipleImages(publicIds);
      if (!deleteImagesResponse.success) {
        return deleteImagesResponse;
      }
    }

    // Delete property from DB (foreign key cascades remove child records)
    await prisma.properties.delete({
      where: { property_id: propId },
    });

    return { success: true, message: "Property deleted successfully" };
  } catch (error) {
    console.error("Error deleting property:", error);
    return { success: false, message: "Error deleting property", error };
  }
};

export const updatePropertyDetails = async (token, propertyId, newData) => {
  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const propId = Number(propertyId);

    // Verify ownership
    const property = await prisma.properties.findFirst({
      where: {
        property_id: propId,
        user_id: user.user_id,
      },
    });

    if (!property) {
      return { success: false, message: "User doesn't have such property" };
    }

    // Build update object only with defined fields
    const updateData = {};
    if (newData.title !== undefined) updateData.title = newData.title;
    if (newData.address !== undefined) updateData.address = newData.address;
    if (newData.city !== undefined) updateData.city = newData.city;
    if (newData.price !== undefined) updateData.price = newData.price;
    if (newData.type !== undefined) updateData.type = newData.type;
    if (newData.description !== undefined)
      updateData.description = newData.description;

    await prisma.properties.update({
      where: { property_id: propId },
      data: updateData,
    });

    return { success: true, message: "Property updated successfully" };
  } catch (error) {
    console.error("Error updating property:", error);
    return { success: false, message: "Error updating property", error };
  }
};

export const addNewPropertyImages = async (token, propertyId, files) => {
  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const propId = Number(propertyId);

    // Verify ownership
    const property = await prisma.properties.findFirst({
      where: {
        property_id: propId,
        user_id: user.user_id,
      },
    });

    if (!property) {
      return { success: false, message: "User doesn't have such property" };
    }

    // Count existing images
    const currentImageCount = await prisma.property_images.count({
      where: { property_id: propId },
    });

    if (files.length + currentImageCount > 10) {
      return {
        success: false,
        message: "At most 10 images per property allowed",
      };
    }

    const uploadImageResponse =
      await cloudinaryUtils.uploadMultipleImages(files);
    if (!uploadImageResponse.success) {
      return uploadImageResponse;
    }

    // Batch insert new images into DB
    await prisma.property_images.createMany({
      data: uploadImageResponse.results.map((image) => ({
        property_id: propId,
        image_url: image.url,
        cloudinary_public_id: image.publicId,
      })),
    });

    return { success: true, message: "New property images added successfully" };
  } catch (error) {
    console.error("Error adding new property images:", error);
    return {
      success: false,
      message: "Error adding new property images",
      error,
    };
  }
};

export const deletePropertyImages = async (token, propertyId, imageIds) => {
  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const propId = Number(propertyId);

    // Verify property ownership
    const property = await prisma.properties.findFirst({
      where: {
        property_id: propId,
        user_id: user.user_id,
      },
    });

    if (!property) {
      return { success: false, message: "User doesn't have such property" };
    }

    // Verify the images belong to this property
    const images = await prisma.property_images.findMany({
      where: {
        property_id: propId,
        cloudinary_public_id: { in: imageIds },
      },
    });

    if (images.length !== imageIds.length) {
      return {
        success: false,
        message: "One or more images do not belong to this property",
      };
    }

    // Delete from Cloudinary
    const deleteFromCloudResponse =
      await cloudinaryUtils.deleteMultipleImages(imageIds);
    if (!deleteFromCloudResponse.success) {
      return deleteFromCloudResponse;
    }

    // Delete from Database
    await prisma.property_images.deleteMany({
      where: {
        property_id: propId,
        cloudinary_public_id: { in: imageIds },
      },
    });

    return { success: true, message: "Property images deleted successfully" };
  } catch (error) {
    console.error("Error deleting property images:", error);
    return {
      success: false,
      message: "Error deleting property images",
      error,
    };
  }
};

export const getUserProperties = async (token) => {
  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const properties = await prisma.properties.findMany({
      where: { user_id: user.user_id },
      include: {
        property_images: true,
        posts: {
          orderBy: { post_id: "desc" },
          take: 1,
        },
      },
    });

    const formattedProperties = properties.map((p) => {
      const latestPost = p.posts[0] || null;
      return {
        property_id: p.property_id,
        user_id: p.user_id,
        title: p.title,
        address: p.address,
        city: p.city,
        price: p.price,
        type: p.type,
        description: p.description,
        post_id: latestPost?.post_id || null,
        post_type: latestPost?.post_type || null,
        images: p.property_images.map((img) => ({
          url: img.image_url,
          publicId: img.cloudinary_public_id,
        })),
      };
    });

    return { success: true, properties: formattedProperties };
  } catch (error) {
    console.error("Error fetching user properties:", error);
    return {
      success: false,
      message: "Error fetching user properties",
      error,
    };
  }
};

export const getAllProperties = async () => {
  try {
    const properties = await prisma.properties.findMany({
      orderBy: { property_id: "desc" },
      include: {
        users: { select: { name: true } },
        property_images: true,
      },
    });

    const formattedProperties = properties.map((p) => ({
      property_id: p.property_id,
      user_id: p.user_id,
      owner_name: p.users?.name || null,
      title: p.title,
      address: p.address,
      city: p.city,
      price: p.price,
      type: p.type,
      description: p.description,
      images: p.property_images.map((img) => ({
        url: img.image_url,
        publicId: img.cloudinary_public_id,
      })),
    }));

    return { success: true, properties: formattedProperties };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { success: false, message: "Error fetching properties", error };
  }
};

export const getPropertyById = async (propertyId) => {
  try {
    const propId = Number(propertyId);
    const p = await prisma.properties.findUnique({
      where: { property_id: propId },
      include: {
        users: { select: { name: true } },
        property_images: true,
        posts: {
          orderBy: { post_id: "desc" },
          take: 1,
        },
      },
    });

    if (!p) {
      return { success: false, message: "Property not found" };
    }

    const latestPost = p.posts[0] || null;
    const formattedProperty = {
      property_id: p.property_id,
      user_id: p.user_id,
      owner_name: p.users?.name || null,
      title: p.title,
      address: p.address,
      city: p.city,
      price: p.price,
      type: p.type,
      description: p.description,
      post_id: latestPost?.post_id || null,
      post_type: latestPost?.post_type || null,
      images: p.property_images.map((img) => ({
        url: img.image_url,
        publicId: img.cloudinary_public_id,
      })),
    };

    return { success: true, property: formattedProperty };
  } catch (error) {
    console.error("Error fetching property:", error);
    return { success: false, message: "Error fetching property", error };
  }
};