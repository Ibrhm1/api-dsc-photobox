import { Router } from "express";
import { photoSessionsController } from "../controllers/photoSessions.controller.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";

const photoSessionsRoute = Router();

photoSessionsRoute.post("/", photoSessionsController.create);
photoSessionsRoute.get("/gallery", photoSessionsController.getGallery);
photoSessionsRoute.delete("/", authMiddleware, photoSessionsController.remove);

export { photoSessionsRoute };
