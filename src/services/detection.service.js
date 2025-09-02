import prisma from '../models/prismaClient.js'

export const createDetectionService = async data => {
  if (!data.diseaseName || data.confidence === undefined) {
    throw new Error('diseaseName and confidence are required')
  }
  // Step 2: Find or create the disease
  let disease = await prisma.disease.findFirst({
    where: { name: { equals: data.diseaseName, mode: 'insensitive' } }
  })

  if (!disease) {
    disease = await prisma.disease.create({
      data: {
        name: data.diseaseName,
        description: 'Auto-generated from model'
      }
    })
  }
  // Exclude diseaseName from data
  const { diseaseName, ...rest } = data
  const detectionData = {
    ...rest,
    diseaseId: disease.id
  }
  // Step 3: Create the detection
  const detection = await prisma.detection.create({
    data: detectionData,
    include: {
      disease: true
    }
  })
  return detection
}
export const getDetectionByIdService = async id => {
  const detection = await prisma.detection.findUnique({
    where: { id },
    include: {
      disease: {
        include: {
          medicines: true 
        }
      },
      farmer: {
        include: {
          user: true
        }
      },
      advices: {
        include: {
          agronomist: {
            include: { user: true }
          },
          medicine: true
        }
      },
      feedbacks: true
    }
  })
  return detection
}

export const deleteDetectionService = async id => {
  const deleted = await prisma.detection.delete({
    where: { id }
  })

  return deleted
}
export const getAllDetectionsService = async (farmerId = null) => {
  return await prisma.detection.findMany({
    where: farmerId ? { farmerId } : undefined,
    include: {
      disease: true,
      farmer: { include: { user: true } }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export const getMyDetectionsService = async farmerId => {
  if (!farmerId) {
    throw new Error('Farmer ID is required')
  }
  const detections = await getAllDetectionsService(farmerId)

  // Return detections directly; formatting should be done in controller
  return detections
}
