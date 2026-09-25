import express from "express";
import upload from "../config/multer.js";
import * as propertyController from "../controllers/propertyController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/register-property",
  authenticateToken,
  upload.array("files", 10),
  propertyController.registerProperty,
);
router.delete(
  "/delete-property/:propertyId",
  authenticateToken,
  propertyController.deleteProperty,
);
router.put(
  "/update-property/:propertyId",
  authenticateToken,
  propertyController.updatePropertyDetails,
);
router.post(
  "/add-new-images/:propertyId",
  authenticateToken,
  upload.array("files", 10),
  propertyController.addNewPropertyImages,
);
router.delete(
  "/delete-images/:propertyId",
  authenticateToken,
  propertyController.deletePropertyImages,
);
router.get("/user-properties", authenticateToken, propertyController.getUserProperties);
router.get("/properties", propertyController.getAllProperties);
router.get("/properties/:propertyId", propertyController.getPropertyById);

export default router;
