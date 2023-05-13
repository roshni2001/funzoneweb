import express from "express";
import {
  addProject,
  getProjectByUserId,
  getspecificProject,
} from "../Controllers/ProjectController.js";

import authMiddleWare from "../Middleware/authMiddleware.js";

const router = express.Router();

router.route("/:id/addproject").post(authMiddleWare, addProject);
router.route("/:id/specificproject").get(authMiddleWare, getspecificProject);
router
  .route("/:id/specificUserproject")
  .get(authMiddleWare, getProjectByUserId);

export default router;
