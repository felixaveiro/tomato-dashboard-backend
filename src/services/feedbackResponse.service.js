import prisma from '../models/prismaClient.js'
import { createNotificationForUsers } from '../utils/notificationUtils.js'
const determineStatusFromCategory = category => {
  switch (category) {
    case 'accuracy':
    case 'usability':
      return 'addressed'
    case 'feature':
    case 'bug':
      return 'resolved'
    case 'other':
    default:
      return 'rejected'
  }
}
export const createFeedbackResponseService = async ({
  message,
  feedbackId,
  authorId
}) => {
  try {
    const existing = await prisma.feedbackResponse.findUnique({
      where: { feedbackId }
    })
    if (existing) {
      throw new Error('A response already exists for this feedback.')
    }

    // Include farmer + user info for notification
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        farmer: {
          include: {
            user: {
              select: { id: true }
            }
          }
        },
        category: true // even though you're not selecting this way, it's okay to keep this include
      }
    })

    if (!feedback) {
      throw new Error('Feedback not found.')
    }

    const newStatus = determineStatusFromCategory(feedback.category)

    await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status: newStatus }
    })

    const response = await prisma.feedbackResponse.create({
      data: {
        message,
        feedbackId,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        },
        feedback: {
          select: {
            id: true,
            comment: true,
            category: true,
            status: true
          }
        }
      }
    })

    // 🔔 Notify feedback author (farmer)
    const userId = feedback.farmer?.user?.id
    if (userId) {
      await createNotificationForUsers([userId], {
        title: 'Feedback Response',
        message: 'An agronomist has responded to your feedback.'
      })
    }

    return response
  } catch (error) {
    throw new Error(error.message || 'Failed to create feedback response')
  }
}

export const getAllFeedbackResponsesService = async () => {
  try {
    return await prisma.feedbackResponse.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        },
        feedback: {
          select: {
            id: true,
            comment: true,
            category: true,
            status: true
          }
        }
      }
    })
  } catch (error) {
    throw new Error('Failed to fetch feedback responses')
  }
}

export const getFeedbackResponseByIdService = async id => {
  try {
    const response = await prisma.feedbackResponse.findUnique({
      where: { id },
      include: {
        author: true,
        feedback: true
      }
    })
    if (!response) {
      throw new Error('Feedback response not found')
    }
    return response
  } catch (error) {
    throw new Error(error.message)
  }
}

export const deleteFeedbackResponseService = async id => {
  try {
    return await prisma.feedbackResponse.delete({ where: { id } })
  } catch (error) {
    throw new Error('Failed to delete feedback response or it may not exist')
  }
}
