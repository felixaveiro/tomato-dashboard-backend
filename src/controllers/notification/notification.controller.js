import NotificationService from "../../services/Notification.service.js";
import Response from "../../utils/response.js";

const NotificationController = {
  async list(req, res) {
    try {
      const notifications = await NotificationService.list(req.userId);
      return Response.success(res, notifications, "Notifications fetched");
    } catch (err) {
      return Response.error(res, err, err.message);
    }
  },

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const result = await NotificationService.markAsRead(
        id,
        req.userId,
        req.userRole
      );
      return Response.success(res, result, "Notification marked as read");
    } catch (err) {
      return Response.error(res, err, err.message);
    }
  },

  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;

      // Only allow ADMIN to fetch any user's notifications
      if (req.userId !== userId && req.userRole !== "ADMIN") {
        return Response.forbidden(
          res,
          "You are not allowed to access this user's notifications"
        );
      }

      const notifications = await NotificationService.getByUserId(userId);
      return Response.success(res, notifications, "User notifications fetched");
    } catch (err) {
      return Response.error(res, err, err.message);
    }
  },

  async markAllAsRead(req, res) {
    try {
      const result = await NotificationService.markAllAsRead(req.userId);
      return Response.success(res, result, "All notifications marked as read");
    } catch (err) {
      return Response.error(res, err, err.message);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await NotificationService.delete(id, req.userId, req.userRole);
      return Response.success(res, {}, "Notification deleted");
    } catch (err) {
      return Response.error(res, err, err.message);
    }
  },

  async deleteAll(req, res) {
    try {
      console.log("________________________________________________deleting al notifications_____________________________________")
      await NotificationService.deleteAll(req.userId);
      return Response.success(res, {}, "All notifications deleted");
    } catch (err) {
      return Response.error(res, err, err.message);
    }
  }
};

export default NotificationController;
