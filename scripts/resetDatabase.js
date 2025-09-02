import prisma from "../src/models/prismaClient.js"


const resetDatabase = async () => {
  try {
    await prisma.advice.deleteMany()
    await prisma.feedback.deleteMany()
    await prisma.detection.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.Agronomist.deleteMany()
    await prisma.farmer.deleteMany()
    await prisma.user.deleteMany()
    await prisma.region.deleteMany()
    await prisma.diseaseStat.deleteMany()
    await prisma.disease.deleteMany()
    await prisma.medicine.deleteMany()

    console.log('✅ Database cleared successfully.')
  } catch (err) {
    console.error('❌ Failed to clear DB:', err)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
