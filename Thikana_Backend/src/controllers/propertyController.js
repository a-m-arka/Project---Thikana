import * as propertyService from "../services/propertyService.js";
import PropertyModel from "../models/propertyModel.js";

export const registerProperty = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  const {
    title,
    address,
    city,
    price,
    type,
    description,
    area,
    total_floors,
    totalFloors,
    total_rooms,
    totalRooms,
  } = req.body;

  if (!title || !address || !city || !price || !type || !description) {
    return res.status(400).json({ message: "Missing required information" });
  }
  if (
    type !== "flat" &&
    type !== "house" &&
    type !== "commercial" &&
    type !== "plot"
  ) {
    return res.status(400).json({ message: "Invalid property type" });
  }

  const rawFloors = total_floors ?? totalFloors;
  const rawRooms = total_rooms ?? totalRooms;

  if (type === "plot") {
    if (
      (rawFloors !== undefined && Number(rawFloors) !== 0) ||
      (rawRooms !== undefined && Number(rawRooms) !== 0)
    ) {
      return res.status(400).json({
        message: "For plot properties, total floors and total rooms must be 0",
      });
    }
  }

  const files = req.files;
  if (!files || !files.length) {
    return res.status(400).json({ message: "At least one image is required" });
  }
  if (files.length > 10) {
    return res.status(400).json({ message: "Maximum 10 images are allowed" });
  }

  const property = new PropertyModel({
    title,
    address,
    city,
    price,
    type,
    description,
    area: area !== undefined && area !== "" ? Number(area) : null,
    totalFloors: type === "plot" ? 0 : (rawFloors !== undefined && rawFloors !== "" ? Number(rawFloors) : 0),
    totalRooms: type === "plot" ? 0 : (rawRooms !== undefined && rawRooms !== "" ? Number(rawRooms) : 0),
  });

  try {
    const response = await propertyService.registerProperty(
      token,
      property,
      files,
    );
    if (response.success) {
      console.log("Property registered successfully");
      return res.status(201).json({ message: response.message });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error registering property:", error);
    return res
      .status(500)
      .json({ message: "Property registration failed. Internal Server Error" });
  }
};

export const deleteProperty = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  const propertyId = req.params.propertyId;
  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }
  try {
    const response = await propertyService.deleteProperty(token, propertyId);
    if (response.success) {
      return res.status(200).json({ message: response.message });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error deleting property:", error);
    return res
      .status(500)
      .json({ message: "Property deletion failed. Internal Server Error" });
  }
};

export const updatePropertyDetails = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  const propertyId = req.params.propertyId;
  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }
  const {
    title,
    address,
    city,
    price,
    type,
    description,
    area,
    total_floors,
    totalFloors,
    total_rooms,
    totalRooms,
  } = req.body;

  if (
    type !== undefined &&
    type !== null &&
    type !== "flat" &&
    type !== "house" &&
    type !== "commercial" &&
    type !== "plot"
  ) {
    return res.status(400).json({ message: "Invalid property type" });
  }

  const rawFloors = total_floors ?? totalFloors;
  const rawRooms = total_rooms ?? totalRooms;

  if (type === "plot") {
    if (
      (rawFloors !== undefined && Number(rawFloors) !== 0) ||
      (rawRooms !== undefined && Number(rawRooms) !== 0)
    ) {
      return res.status(400).json({
        message: "For plot properties, total floors and total rooms must be 0",
      });
    }
  }

  const newProperty = new PropertyModel({
    title,
    address,
    city,
    price,
    type,
    description,
    area: area !== undefined && area !== "" ? (area === null ? null : Number(area)) : undefined,
    totalFloors: rawFloors !== undefined && rawFloors !== "" ? Number(rawFloors) : undefined,
    totalRooms: rawRooms !== undefined && rawRooms !== "" ? Number(rawRooms) : undefined,
  });

  try {
    const response = await propertyService.updatePropertyDetails(
      token,
      propertyId,
      newProperty,
    );
    if (response.success) {
      return res.status(200).json({ message: response.message });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error updating property:", error);
    return res
      .status(500)
      .json({ message: "Failed to update property. Internal Server Error" });
  }
};

export const addNewPropertyImages = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  const propertyId = req.params.propertyId;
  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }
  const files = req.files;
  if (!files || !files.length) {
    return res.status(400).json({ message: "At least one image is required" });
  }
  try {
    const response = await propertyService.addNewPropertyImages(
      token,
      propertyId,
      files,
    );
    if (response.success) {
      return res.status(200).json({ message: response.message });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error adding new images:", error);
    return res
      .status(500)
      .json({ message: "Failed to add new images. Internal Server Error" });
  }
};

export const deletePropertyImages = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  const propertyId = req.params.propertyId;
  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }
  const { imageIds } = req.body;
  if (!imageIds || imageIds.length === 0) {
    return res.status(400).json({ message: "No image ID provided" });
  }
  try {
    const response = await propertyService.deletePropertyImages(
      token,
      propertyId,
      imageIds,
    );
    if (response.success) {
      return res.status(200).json({ message: response.message });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error deleting images:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete images. Internal Server Error" });
  }
};

export const getUserProperties = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  try {
    const response = await propertyService.getUserProperties(token);
    if (response.success) {
      return res.status(200).json({ properties: response.properties });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error fetching user properties:", error);
    return res.status(500).json({
      message: "Failed to fetch user properties. Internal Server Error",
    });
  }
};

export const getAllProperties = async () => {
  try {
    const response = await propertyService.getAllProperties();
    if (response.success) {
      return res.status(200).json({ properties: response.properties });
    }
    return res.status(400).json({ message: response.message });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch properties. Internal Server Error" });
  }
};

export const getPropertyById = async (req, res) => {
  const propertyId = Number.parseInt(req.params.propertyId, 10);
  if (!Number.isInteger(propertyId) || propertyId < 1) {
    return res.status(400).json({ message: "A valid property ID is required" });
  }
  try {
    const response = await propertyService.getPropertyById(propertyId);
    if (response.success) {
      return res.status(200).json({ property: response.property });
    }
    return res.status(404).json({ message: response.message });
  } catch (error) {
    console.error("Error fetching property:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch property. Internal Server Error" });
  }
};
