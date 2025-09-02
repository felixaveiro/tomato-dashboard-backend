import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

class NotificationService {
  static async send (userId, message, type = 'INFO') {
    if (!userId || !message) {
      throw new Error(
        'User ID and message are required to send a notification'
      )
    }

    try {
      return await prisma.notification.create({
        data: {
          userId,
          message,
          type
        }
      })
    } catch (err) {
      throw new Error('Failed to send notification: ' + err.message)
    }
  }

  static async list (userId) {
    if (!userId) {
      throw new Error('User ID is required to list notifications')
    }

    try {
      return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    } catch (err) {
      throw new Error('Failed to fetch notifications: ' + err.message)
    }
  }

  static async markAllAsRead (userId) {
    if (!userId) throw new Error('User ID is required')

    try {
      return await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      })
    } catch (err) {
      throw new Error('Failed to mark all as read: ' + err.message)
    }
  }

  static async deleteAll (userId) {
    if (!userId) throw new Error('User ID is required')

    try {
      return await prisma.notification.deleteMany({
        where: { userId }
      })
    } catch (err) {
      throw new Error('Failed to delete all notifications: ' + err.message)
    }
  }

  static async getByUserId (userId) {
    if (!userId) throw new Error('User ID is required')

    try {
      return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    } catch (err) {
      throw new Error('Failed to get user notifications: ' + err.message)
    }
  }
  static async createForAllUsers ({ title, message }) {
    const users = await prisma.user.findMany({ select: { id: true } })

    const notifications = users.map(user => ({
      userId: user.id,
      title,
      message
    }))

    await prisma.notification.createMany({ data: notifications })
  }

  static async markAsRead (notificationId, currentUserId, currentUserRole) {
    if (!notificationId || !currentUserId) {
      throw new Error('Notification ID and user ID are required')
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      throw new Error('Notification not found')
    }

    // Ownership check unless ADMIN
    if (notification.userId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new Error('You are not allowed to mark this notification')
    }

    try {
      return await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      })
    } catch (err) {
      throw new Error('Failed to mark notification as read: ' + err.message)
    }
  }

  static async delete (notificationId, currentUserId, currentUserRole) {
    if (!notificationId || !currentUserId) {
      throw new Error('Notification ID and user ID are required')
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      throw new Error('Notification not found')
    }

    // Ownership check unless ADMIN
    if (notification.userId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new Error('You are not allowed to delete this notification')
    }

    try {
      return await prisma.notification.delete({
        where: { id: notificationId }
      })
    } catch (err) {
      throw new Error('Failed to delete notification: ' + err.message)
    }
  }
}

export default NotificationService
