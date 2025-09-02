import * as feedbackResponseService from '../../services/feedbackResponse.service.js'
import Response from '../../utils/response.js'


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

export const createFeedbackResponse = async (req, res) => {
  try {
    const { feedbackId, message } = req.body
    const authorId = req.userId

    if (!feedbackId || !message || !authorId) {
      return Response.badRequest(res, 'Missing required fields')
    }

    const newResponse = await feedbackResponseService.createFeedbackResponseService(
      {
        feedbackId,
        message,
        authorId
      }
    )

    return Response.created(res, newResponse, 'Feedback response created')
  } catch (error) {
    return Response.error(
      res,
      error.message,
      'Failed to create feedback response'
    )
  }
}

export const getAllFeedbackResponses = async (req, res) => {
  try {
    const responses = await feedbackResponseService.getAllFeedbackResponsesService()
    return Response.success(res, responses, 'List of feedback responses')
  } catch (error) {
    return Response.error(
      res,
      error.message,
      'Failed to fetch feedback responses'
    )
  }
}

export const getFeedbackResponseById = async (req, res) => {
  try {
    const response = await feedbackResponseService.getFeedbackResponseByIdService(
      req.params.id
    )
    return Response.success(res, response, 'Feedback response found')
  } catch (error) {
    return Response.notFound(res, error.message)
  }
}

export const deleteFeedbackResponse = async (req, res) => {
  try {
    const deleted = await feedbackResponseService.deleteFeedbackResponseService(
      req.params.id
    )
    return Response.success(res, deleted, 'Feedback response deleted')
  } catch (error) {
    return Response.error(
      res,
      error.message,
      'Failed to delete feedback response'
    )
  }
}
