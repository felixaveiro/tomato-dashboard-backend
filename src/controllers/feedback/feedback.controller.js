import {
  createFeedbackService,
  getAllFeedbacksService,
  getFeedbackByIdService,
  deleteFeedbackService
} from '../../services/feedback.service.js'
import Response from '../../utils/response.js'


export const createFeedback = async (req, res) => {
  try {
    if (!req.farmerId) {
      return Response.error(res, 'Only farmers can submit feedback', 403)
    }

    const { comment, category, adviceId } = req.body
    let { detectionId } = req.body

    if (!comment || !category) {
      return Response.error(res, 'comment and category are required', 400)
    }

    if (adviceId) {
      const advice = await prisma.advice.findUnique({
        where: { id: adviceId },
        select: { detectionId: true }
      })

      if (!advice) {
        return Response.error(res, 'Advice not found', 404)
      }

      detectionId = advice.detectionId
    }

    if (!detectionId) {
      return Response.error(
        res,
        'detectionId is required (or must come from advice)',
        400
      )
    }

    const feedback = await createFeedbackService({
      detectionId,
      comment,
      category,
      adviceId,
      farmerId: req.farmerId
    })

    return Response.success(res, feedback, 'Feedback submitted successfully', 201)
  } catch (err) {
    return Response.error(res, err.message || 'Failed to submit feedback')
  }
}

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await getAllFeedbacksService()
    return Response.success(res, feedbacks, 'Feedbacks retrieved successfully')
  } catch (err) {
    return Response.error(res, err.message || 'Failed to fetch feedbacks')
  }
}

export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params
    const feedback = await getFeedbackByIdService(id)
    return Response.success(res, feedback, 'Feedback retrieved successfully')
  } catch (err) {
    return Response.error(res, err.message || 'Feedback not found', 404)
  }
}

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params
    const user = {
      id: req.userId,
      farmerId: req.farmerId,
      role: req.userRole
    }

    await deleteFeedbackService(id, user)
    return Response.success(
      res,
      { success: true },
      'Feedback deleted successfully'
    )
  } catch (err) {
    const status =
      err.message === 'Feedback not found'
        ? 404
        : err.message.includes('permission') ? 403 : 500
    return Response.error(
      res,
      err.message || 'Failed to delete feedback',
      status
    )
  }
}
