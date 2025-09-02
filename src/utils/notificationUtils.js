// import { PrismaClient } from "@prisma/client"
import prisma from '../models/prismaClient.js'

export const createNotificationForUsers = async (userIds, notificationData) => {
  const uniqueUserIds = [...new Set(userIds)]
  const data = uniqueUserIds.map(userId => ({
    userId,
    title: notificationData.title,
    message: notificationData.message
  }))

  await prisma.notification.createMany({ data })
}
