import * as postService from "../services/postService.js";

export const createPost = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  const propertyId = req.params.propertyId;
  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }
  const { postType } = req.body;
  if (!postType) {
    return res.status(400).json({ message: "Post type is required" });
  }
  if (postType !== "sell" && postType !== "rent") {
    return res.status(400).json({ message: "Invalid post type" });
  }
  try {
    const response = await postService.createPost(token, propertyId, postType);
    if (response.success) {
      return res.status(201).json({ message: response.message });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error creating new post:", error);
    return res
      .status(500)
      .json({ message: "Failed to create post. Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  const postId = req.params.postId;
  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }
  try {
    const response = await postService.deletePost(token, postId);
    if (response.success) {
      return res.status(200).json({ message: response.message });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete post. Internal Server Error" });
  }
};

export const getPublishedPosts = async (req, res) => {
  try {
    const response = await postService.getPublishedPosts();
    if (response.success) {
      return res.status(200).json({ posts: response.posts });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error fetching published posts:", error);
    return res
      .status(500)
      .json({
        message: "Failed to fetch published posts. Internal Server Error",
      });
  }
};

export const getUserPosts = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  try {
    const response = await postService.getUserPosts(token);
    if (response.success) {
      return res.status(200).json({ posts: response.posts });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch user posts. Internal Server Error" });
  }
};

export const updatePostType = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  const postId = req.params.postId;
  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }
  const { postType } = req.body;
  if (!postType) {
    return res.status(400).json({ message: "Post type is required" });
  }
  if (postType !== "sell" && postType !== "rent") {
    return res.status(400).json({ message: "Invalid post type. Must be 'sell' or 'rent'" });
  }
  try {
    const response = await postService.updatePostType(token, postId, postType);
    if (response.success) {
      return res.status(200).json({ message: response.message });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error updating post type:", error);
    return res
      .status(500)
      .json({ message: "Failed to update post type. Internal Server Error" });
  }
};
