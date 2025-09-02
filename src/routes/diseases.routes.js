import express from "express";

import {
  createDisease,
  getAllDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease
} from "../controllers/disease/diseaseController.js";
import { authorizeRoles } from "../middleware/authorizations.js";
import { Authenticate } from "../utils/jwtfunctions.js";
const diseasesRouter = express.Router();
diseasesRouter.post("/", createDisease);
diseasesRouter.get("/", getAllDiseases);
diseasesRouter.get("/:id", getDiseaseById);
diseasesRouter.put(
  "/:id",
  Authenticate,
  authorizeRoles("AGRONOMIST", "ADMIN"),
  updateDisease
);
diseasesRouter.delete(
  "/:id",
  Authenticate,authorizeRoles("AGRONOMIST", "ADMIN"),
  deleteDisease
);

export default diseasesRouter;
