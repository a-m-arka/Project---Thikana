import prisma from "../config/prisma.js";
import { getUserFromToken } from "../utils/authUtils.js";

export const createPost = async (token, propertyId, postType) => {
  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const propId = Number(propertyId);

    // 1. Verify property ownership
    const property = await prisma.properties.findFirst({
      where: {
        property_id: propId,
        user_id: user.user_id,
      },
    });

    if (!property) {
      return { success: false, message: "User doesn't have such property" };
    }

    // 2. Check if property has already been posted
    const existingPost = await prisma.posts.findFirst({
      where: { property_id: propId },
    });

    if (existingPost) {
      return {
        success: false,
        message: "This property has already been posted",
      };
    }

    // 3. Create post with Prisma
    await prisma.posts.create({
      data: {
        property_id: propId,
        user_id: user.user_id,
        post_type: postType,
      },
    });

    return { success: true, message: "Post created successfully" };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, message: "Error creating post", error };
  }
};

export const deletePost = async (token, postId) => {
  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const pId = Number(postId);

    // 1. Verify post existence
    const post = await prisma.posts.findUnique({
      where: { post_id: pId },
    });

    if (!post) {
      return { success: false, message: "No such post exists" };
    }

    // 2. Verify post belongs to the user
    if (post.user_id !== user.user_id) {
      return { success: false, message: "User does not have such post" };
    }

    // 3. Delete post
    await prisma.posts.delete({
      where: { post_id: pId },
    });

    return { success: true, message: "Post deleted successfully" };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, message: "Error deleting post", error };
  }
};

export const getPublishedPosts = async () => {
  try {
    const posts = await prisma.posts.findMany({
      orderBy: [
        { created_at: "desc" },
        { post_id: "desc" },
      ],
      include: {
        users: {
          select: { name: true },
        },
        properties: {
          include: {
            property_images: true,
          },
        },
      },
    });

    // Format output to match the shape the frontend components expect
    const formattedPosts = posts.map((post) => ({
      post_id: post.post_id,
      post_type: post.post_type,
      created_at: post.created_at,
      property_id: post.property_id,
      user_id: post.user_id,
      owner_name: post.users?.name || null,
      title: post.properties?.title || "",
      address: post.properties?.address || "",
      city: post.properties?.city || "",
      price: post.properties?.price || null,
      type: post.properties?.type || null,
      description: post.properties?.description || "",
      area: post.properties?.area ? Number(post.properties.area) : null,
      total_floors: post.properties?.total_floors ?? 0,
      total_rooms: post.properties?.total_rooms ?? 0,
      views: post.properties?.views ?? 0,
      images: (post.properties?.property_images || []).map((img) => ({
        url: img.image_url,
        publicId: img.cloudinary_public_id,
      })),
    }));

    return { success: true, posts: formattedPosts };
  } catch (error) {
    console.error("Error fetching published posts:", error);
    return { success: false, message: "Error fetching published posts", error };
  }
};

export const getUserPosts = async (token) => {
  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const posts = await prisma.posts.findMany({
      where: { user_id: user.user_id },
      orderBy: [
        { created_at: "desc" },
        { post_id: "desc" },
      ],
      include: {
        users: {
          select: { name: true },
        },
        properties: {
          include: {
            property_images: true,
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      post_id: post.post_id,
      post_type: post.post_type,
      created_at: post.created_at,
      property_id: post.property_id,
      user_id: post.user_id,
      owner_name: post.users?.name || null,
      title: post.properties?.title || "",
      address: post.properties?.address || "",
      city: post.properties?.city || "",
      price: post.properties?.price || null,
      type: post.properties?.type || null,
      description: post.properties?.description || "",
      area: post.properties?.area ? Number(post.properties.area) : null,
      total_floors: post.properties?.total_floors ?? 0,
      total_rooms: post.properties?.total_rooms ?? 0,
      views: post.properties?.views ?? 0,
      images: (post.properties?.property_images || []).map((img) => ({
        url: img.image_url,
        publicId: img.cloudinary_public_id,
      })),
    }));

    return { success: true, posts: formattedPosts };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return { success: false, message: "Error fetching user posts", error };
  }
};

export const updatePostType = async (token, postId, postType) => {
  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const pId = Number(postId);
    if (!["sell", "rent"].includes(postType)) {
      return { success: false, message: "Invalid post type. Must be 'sell' or 'rent'" };
    }

    const post = await prisma.posts.findUnique({
      where: { post_id: pId },
    });

    if (!post) {
      return { success: false, message: "No such post exists" };
    }

    if (post.user_id !== user.user_id) {
      return { success: false, message: "User does not have such post" };
    }

    await prisma.posts.update({
      where: { post_id: pId },
      data: { post_type: postType },
    });

    return { success: true, message: "Post type updated successfully" };
  } catch (error) {
    console.error("Error updating post type:", error);
    return { success: false, message: "Error updating post type", error };
  }
};
