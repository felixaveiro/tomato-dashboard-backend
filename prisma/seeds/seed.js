import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { hash } from 'bcrypt'
import { passHashing } from '../../src/utils/passwordfunctions'
const prisma = new PrismaClient()
// Helper functions
function getRandomElement (array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomDate (start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

// Seed data
const diseases = [
  {
    id: 'f54f7a9a-1b72-4aa4-a62f-1deef0c501a1',
    name: 'Tomato___Bacterial_spot',
    scientificName: 'Xanthomonas campestris pv. vesicatoria',
    description:
      'Bacterial disease causing small, dark, water-soaked lesions on leaves and fruits.',
    symptoms: 'Leaf spots, fruit scabbing, yellow halos.',
    severity: 'Moderate to severe',
    prevention: 'Use certified seeds, avoid splashing water on leaves.',
    treatment: 'Apply copper-based sprays and remove infected parts.'
  }
  // ... (include all your existing diseases here)
]

const medicines = [
  {
    name: 'Copper Fungicide',
    description: 'Broad-spectrum fungicide for bacterial and fungal diseases',
    usageInstructions: [
      'Mix 1-2 tablespoons per gallon of water',
      'Apply every 7-10 days',
      'Spray until runoff'
    ]
  },
  {
    name: 'Neem Oil',
    description: 'Organic insecticide and fungicide',
    usageInstructions: [
      'Mix 2 tablespoons per gallon of water',
      'Apply in early morning or late evening',
      'Shake well before use'
    ]
  }
  // ... add more medicines
]

const regions = [
  { name: 'Northern Region', latitude: 9.072264, longitude: 7.491302 },
  { name: 'Southern Region', latitude: 6.524379, longitude: 3.379206 },
  { name: 'Eastern Region', latitude: 6.465422, longitude: 7.546388 },
  { name: 'Western Region', latitude: 6.524379, longitude: 3.379206 }
  // ... add more regions
]

const roles = [
  'FARMER',
  'AGRONOMIST',
  'ADMIN',
  'DEVELOPER',
  'UI_UX',
  'MODERATOR',
  'SUPPORT',
  'RESEARCHER',
  'DATA_ANALYST',
  'TESTER',
  'CONTENT_MANAGER'
]

const feedbackCategories = ['accuracy', 'usability', 'feature', 'bug', 'other']
const feedbackStatuses = ['pending', 'addressed', 'resolved', 'rejected']

async function seed () {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (similar to your devRouter reset)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.advice.deleteMany()
    await prisma.feedback.deleteMany()
    await prisma.detection.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.agronomist.deleteMany()
    await prisma.farmer.deleteMany()
    await prisma.user.deleteMany()
    await prisma.region.deleteMany()
    await prisma.diseaseStat.deleteMany()
    await prisma.disease.deleteMany()
    await prisma.medicine.deleteMany()
    console.log('🧹 Database cleared')
  }

  // Seed Diseases
  await prisma.disease.createMany({
    data: diseases,
    skipDuplicates: true
  })
  console.log(`✅ Seeded ${diseases.length} diseases`)

  // Seed Medicines
  const createdMedicines = await Promise.all(
    medicines.map(medicine => prisma.medicine.create({ data: medicine }))
  )
  console.log(`✅ Seeded ${createdMedicines.length} medicines`)

  // Seed Regions
  const createdRegions = await Promise.all(
    regions.map(region => prisma.region.create({ data: region }))
  )
  console.log(`✅ Seeded ${createdRegions.length} regions`)

  // Seed Users with associated Farmers and Agronomists
  // Seed Users with associated Farmers and Agronomists
  const predefinedUsers = [
    { email: 'admin@example.com', role: 'ADMIN', username: 'Admin User' },
    {
      email: 'agronomist@example.com',
      role: 'AGRONOMIST',
      username: 'Agronomist User'
    },
    { email: 'farmer@example.com', role: 'FARMER', username: 'Farmer User' },
    {
      email: 'developer@example.com',
      role: 'DEVELOPER',
      username: 'Developer User'
    },
    { email: 'uiux@example.com', role: 'UI_UX', username: 'UI/UX Designer' },
    {
      email: 'moderator@example.com',
      role: 'MODERATOR',
      username: 'Moderator'
    },
    {
      email: 'support@example.com',
      role: 'SUPPORT',
      username: 'Support Agent'
    },
    {
      email: 'researcher@example.com',
      role: 'RESEARCHER',
      username: 'Researcher'
    },
    {
      email: 'analyst@example.com',
      role: 'DATA_ANALYST',
      username: 'Data Analyst'
    },
    { email: 'tester@example.com', role: 'TESTER', username: 'QA Tester' },
    {
      email: 'content@example.com',
      role: 'CONTENT_MANAGER',
      username: 'Content Manager'
    }
  ]

  const users = []
  const farmers = []
  const agronomists = []

  for (const userData of predefinedUsers) {
    const region = getRandomElement(createdRegions)
    const hashedPassword = await passHashing('password123')

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        username: userData.username,
        profilePicture: faker.image.avatar()
      }
    })
    users.push(user)

    if (userData.role === 'FARMER') {
      const farmer = await prisma.farmer.create({
        data: {
          userId: user.id,
          regionId: region.id
        }
      })
      farmers.push(farmer)
    } else if (userData.role === 'AGRONOMIST') {
      const agronomist = await prisma.agronomist.create({
        data: {
          userId: user.id,
          name: user.username,
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
          regionId: region.id
        }
      })
      agronomists.push(agronomist)
    }
  }

  console.log(`✅ Seeded ${users.length} predefined users`)
  console.log(
    `👨‍🌾 Farmers: ${farmers.length} | 🌱 Agronomists: ${agronomists.length}`
  )

  // Seed Detections
  const detections = []
  for (let i = 0; i < 30; i++) {
    const detection = await prisma.detection.create({
      data: {
        farmer: { connect: { id: getRandomElement(farmers).id } },
        image: faker.image.urlLoremFlickr({ category: 'plants' }),
        disease: { connect: { id: getRandomElement(diseases).id } },
        confidence: faker.number.float({
          min: 0.5,
          max: 0.99,
          precision: 0.01
        }),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        detectedAt: faker.date.recent()
      }
    })
    detections.push(detection)
  }
  console.log(`✅ Seeded ${detections.length} detections`)

  // Seed DiseaseStats
  const diseaseStats = []
  for (let i = 0; i < 30; i++) {
    const stat = await prisma.diseaseStat.create({
      data: {
        disease: { connect: { id: getRandomElement(diseases).id } },
        region: { connect: { id: getRandomElement(createdRegions).id } },
        occurrence: faker.number.float({ min: 1, max: 100 }),
        date: faker.date.past()
      }
    })
    diseaseStats.push(stat)
  }
  console.log(`✅ Seeded ${diseaseStats.length} disease stats`)

  // Seed Advices
  const advices = []
  for (let i = 0; i < 30; i++) {
    const advice = await prisma.advice.create({
      data: {
        detection: { connect: { id: getRandomElement(detections).id } },
        agronomist: { connect: { id: getRandomElement(agronomists).id } },
        prescription: faker.lorem.paragraph(),
        medicine: { connect: { id: getRandomElement(createdMedicines).id } }
      }
    })
    advices.push(advice)
  }
  console.log(`✅ Seeded ${advices.length} advices`)

  // Seed Feedbacks
  const feedbacks = []
  for (let i = 0; i < 30; i++) {
    const feedback = await prisma.feedback.create({
      data: {
        detection: { connect: { id: getRandomElement(detections).id } },
        farmer: { connect: { id: getRandomElement(farmers).id } },
        category: getRandomElement(feedbackCategories),
        status: getRandomElement(feedbackStatuses),
        comment: faker.lorem.sentence(),
        advice:
          Math.random() > 0.5
            ? { connect: { id: getRandomElement(advices).id } }
            : undefined
      }
    })
    feedbacks.push(feedback)
  }
  console.log(`✅ Seeded ${feedbacks.length} feedbacks`)

  // Seed FeedbackResponses
  const feedbackResponses = []
  for (let i = 0; i < 30; i++) {
    const response = await prisma.feedbackResponse.create({
      data: {
        message: faker.lorem.paragraph(),
        author: { connect: { id: getRandomElement(users).id } },
        feedback: { connect: { id: getRandomElement(feedbacks).id } }
      }
    })
    feedbackResponses.push(response)
  }
  console.log(`✅ Seeded ${feedbackResponses.length} feedback responses`)

  // Seed Notifications
  const notifications = []
  for (let i = 0; i < 30; i++) {
    const notification = await prisma.notification.create({
      data: {
        user: { connect: { id: getRandomElement(users).id } },
        title: faker.lorem.words(3),
        message: faker.lorem.sentence(),
        isRead: faker.datatype.boolean()
      }
    })
    notifications.push(notification)
  }
  console.log(`✅ Seeded ${notifications.length} notifications`)

  console.log('🌱 Database seeding completed!')
}

seed()
  .catch(e => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
