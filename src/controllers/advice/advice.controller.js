import AdviceService from '../../services/advice.service.js'
import Response from '../../utils/response.js'

class AdviceController {
  async create (req, res) {
    try {
      const agronomistId = req.AgronomistId

      if (!agronomistId) {
        return Response.unauthorized(res, 'Agronomist ID missing from token')
      }

      req.body.agronomistId = req.AgronomistId
      const advice = await AdviceService.createAdvice(req.body)

      return Response.created(res, advice, 'Advice created successfully')
    } catch (error) {
      console.error('Error creating advice:', error.message)
      return Response.error(res, error.message, 'Failed to create advice')
    }
  }
  async getAll (req, res) {
    try {
      const advices = await AdviceService.getAllAdvices()
      return Response.success(res, advices, 'Advice list loaded successfully')
    } catch (error) {
      console.error('Error fetching advice list:', error.message)
      return Response.error(res, error, 'Failed to load advice list')
    }
  }

  async getById (req, res) {
    try {
      const { id } = req.params
      const advice = await AdviceService.getAdviceById(id)
      return Response.success(
        res,
        advice,
        'Advice details retrieved successfully'
      )
    } catch (error) {
      if (error.message === 'Advice not found') {
        return Response.notFound(res, 'Advice not found')
      }
      return Response.error(res, error, 'Failed to retrieve advice details')
    }
  }
  async getByDetectionId (req, res) {
    try {
      const { detectionId } = req.params

      if (!detectionId) {
        return Response.badRequest(res, 'Detection ID is required.')
      }

      const advices = await AdviceService.getAdvicesByDetectionId(detectionId)
      return Response.success(
        res,
        advices,
        'Advices for detection loaded successfully'
      )
    } catch (error) {
      console.error('Error fetching advices by detection:', error.message)
      return Response.error(
        res,
        error.message,
        'Failed to load advices for detection'
      )
    }
  }

  async update (req, res) {
    try {
      const { id } = req.params
      const updated = await AdviceService.updateAdvice(id, req.body)
      return Response.success(res, updated, 'Advice updated successfully')
    } catch (error) {
      if (error.message === 'Advice not found') {
        return Response.notFound(res, 'Advice not found')
      }
      return Response.error(res, error, 'Failed to update advice')
    }
  }

  async delete (req, res) {
    try {
      const { id } = req.params
      await AdviceService.deleteAdvice(id)
      return Response.noContent(res) // 204 No Content for successful delete with no body
    } catch (error) {
      if (error.message === 'Advice not found') {
        return Response.notFound(res, 'Advice not found')
      }
      return Response.error(res, error, 'Failed to delete advice')
    }
  }
}

export default new AdviceController()
