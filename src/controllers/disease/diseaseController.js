import prisma from '../../models/prismaClient.js'
import {
  createDiseaseService,
  getAllDiseasesService,
  getDiseaseByIdService,
  updateDiseaseService,
  deleteDiseaseService
} from '../../services/disease.service.js'
import Response from '../../utils/response.js'

export const createDisease = async (req, res) => {
  try {
    console.log('Received request to create disease:', req.body)
    const disease = await createDiseaseService(req.body)
    return Response.success(res, disease, 'Disease created successfully', 201)
  } catch (error) {
    console.error('Error in createDisease:', error)
    return Response.error(res, error.message, 'Failed to create disease', 500)
  }
}

export const getAllDiseases = async (req, res) => {
  try {
    const diseases = await getAllDiseasesService()
    return Response.success(res, diseases, 'Diseases fetched successfully')
  } catch (error) {
    console.error('Error in getAllDiseases:', error)
    return Response.error(res, error.message, 'Failed to fetch diseases', 500)
  }
}

export const getDiseaseById = async (req, res) => {
  try {
    const { id } = req.params
    const disease = await await prisma.disease.findUnique({
      where: { id },
      include: {
        medicines: true,
        detections: {
          select: {
            id: true,
            image: true,
            confidence: true,
            detectedAt: true,
            latitude: true,
            longitude: true,
            farmer: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    username: true
                  }
                }
              }
            }
          }
        },
        diseaseStats: {
          include: {
            region: {
              select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true
              }
            }
          }
        }
      }
    })

    if (!disease) {
      return Response.notFound(res, 'Disease not found')
    }

    return Response.success(res, disease, 'Disease fetched successfully')
  } catch (error) {
    console.error('Error in getDiseaseById:', error)
    return Response.error(res, error.message, 'Failed to fetch disease', 500)
  }
}

export const updateDisease = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    // Step 1: Fetch the existing disease
    const existing = await prisma.disease.findUnique({ where: { id } })
    if (!existing) {
      return Response.error(res, 'Disease not found', 404)
    }

    // Step 2: Detect changes in important fields
    const fieldsToWatch = [
      'symptoms',
      'treatment',
      'severity',
      'description',
      'scientificName'
    ]
    const changes = fieldsToWatch.filter(
      field => data[field] && data[field] !== existing[field]
    )

    // Step 3: Call update service
    const updatedDisease = await updateDiseaseService(id, data)

    // Step 4: If important fields changed, create notifications
    if (changes.length > 0) {
      const detections = await prisma.detection.findMany({
        where: { diseaseId: id },
        select: { farmer: { select: { userId: true } } },
        distinct: ['farmerId']
      })

      const userIds = [...new Set(detections.map(d => d.farmer.userId))]

      const notifications = userIds.map(userId => ({
        userId,
        title: `Update on ${updatedDisease.name}`,
        message: `The disease "${updatedDisease.name}" has updated: ${changes.join(
          ', '
        )}`
      }))

      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications })
      }
    }

    return Response.success(
      res,
      updatedDisease,
      'Disease updated successfully'
    )
  } catch (error) {
    console.error('Error in updateDisease:', error)
    return Response.error(res, error.message, 'Failed to update disease', 500)
  }
}

export const deleteDisease = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await deleteDiseaseService(id)
    return Response.success(res, deleted, 'Disease deleted successfully')
  } catch (error) {
    console.error('Error in deleteDisease:', error)
    return Response.error(res, error.message, 'Failed to delete disease', 500)
  }
}
