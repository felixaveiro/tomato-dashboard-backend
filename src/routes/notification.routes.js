import express from "express";
import { Authenticate } from "../utils/jwtfunctions.js";


import NotificationController from "../controllers/notification/notification.controller.js";

const notificationsRouter = express.Router();

notificationsRouter.get("/", Authenticate, NotificationController.list);
notificationsRouter.get(
  "/user/:userId",
  Authenticate,
  NotificationController.getUserNotifications
);
notificationsRouter.patch(
  "/:id/read",
  Authenticate,
  NotificationController.markAsRead
);
notificationsRouter.patch(
  "/mark-all-read",
  Authenticate,
  NotificationController.markAllAsRead
);
notificationsRouter.delete(
  "/:id/delete",
  Authenticate,
  NotificationController.delete
);
notificationsRouter.delete(
  "/deleteAll",
  Authenticate,
  NotificationController.deleteAll
);

export default notificationsRouter;
