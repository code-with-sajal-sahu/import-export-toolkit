import express from "express";
import { importUsers, exportUsers, getSampleUsers, getUsers } from "../controllers/userController.js";
import { upload } from "../middleware/upload.js";
import {
  importLimiter,
  exportLimiter,
  readLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post(
  "/import",
  importLimiter,
  upload.single("file"),
  importUsers
);

router.get(
  "/export",
  exportLimiter,
  exportUsers
);

router.get(
  "/sample",
  readLimiter,
  getSampleUsers
);

router.get(
  "/",
  readLimiter,
  getUsers
);

export default router;
