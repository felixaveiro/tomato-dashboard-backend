import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
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
  },
  {
    id: 'b02169e5-cfcd-43cf-9052-2ab3a99fc3ea',
    name: 'Tomato___Early_blight',
    scientificName: 'Alternaria solani',
    description:
      'Fungal disease appearing as concentric ring spots on older leaves.',
    symptoms: 'Brown leaf spots with yellowing, leaf drop.',
    severity: 'Moderate',
    prevention: 'Use resistant varieties, crop rotation.',
    treatment: 'Use fungicides like mancozeb or chlorothalonil.'
  },
  {
    id: 'd3d70560-4a41-41e8-8fc1-ec1b376f82be',
    name: 'Tomato___Late_blight',
    scientificName: 'Phytophthora infestans',
    description: 'Aggressive fungal disease in wet, cool weather.',
    symptoms: 'Dark patches, white fuzzy growth under leaves.',
    severity: 'Severe',
    prevention: 'Ensure good drainage, space plants well.',
    treatment: 'Apply fungicides like metalaxyl.'
  },
  {
    id: '64c9c92a-13ad-4aa5-92f6-3e72f779c163',
    name: 'Tomato___Leaf_Mold',
    scientificName: 'Passalora fulva',
    description: 'Fungal infection thriving in high humidity and poor airflow.',
    symptoms: 'Yellow leaf spots, olive mold on underside.',
    severity: 'Mild to moderate',
    prevention: 'Improve ventilation and spacing.',
    treatment: 'Apply fungicides like copper or sulfur.'
  },
  {
    id: '1377082f-e345-4d03-a4ee-7f7bc00dcbf9',
    name: 'Tomato___Septoria_leaf_spot',
    scientificName: 'Septoria lycopersici',
    description: 'Fungus that creates many tiny spots on leaves.',
    symptoms: 'Small gray spots with dark borders on lower leaves.',
    severity: 'Moderate',
    prevention: 'Avoid overhead watering and remove infected debris.',
    treatment: 'Apply chlorothalonil or mancozeb.'
  },
  {
    id: 'b7f4f4e8-1c89-49d7-a3ae-1be7f316a13d',
    name: 'Tomato___Spider_mites Two-spotted_spider_mite',
    scientificName: 'Tetranychus urticae',
    description:
      'Tiny pests feeding on plant sap, causing stippling and yellowing.',
    symptoms: 'Fine webbing, speckled leaves, yellowing.',
    severity: 'Mild to moderate',
    prevention: 'Keep humidity up and introduce natural predators.',
    treatment: 'Use neem oil or insecticidal soap.'
  },
  {
    id: '05e6fd7c-fd4d-4aa4-8185-31b1b2ed45a3',
    name: 'Tomato___Target_Spot',
    scientificName: 'Corynespora cassiicola',
    description: 'Fungal leaf spot disease causing concentric ring patterns.',
    symptoms: 'Large brown spots with target-like rings.',
    severity: 'Moderate',
    prevention: 'Use well-spaced planting and prune infected leaves.',
    treatment: 'Apply azoxystrobin or chlorothalonil.'
  },
  {
    id: 'e11fdc41-90e9-498c-8085-cdddc6eab994',
    name: 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    scientificName: 'Tomato yellow leaf curl virus (TYLCV)',
    description: 'Viral disease spread by whiteflies, affects plant growth.',
    symptoms: 'Upward curling yellow leaves, stunted plants.',
    severity: 'Severe',
    prevention: 'Control whiteflies, plant resistant varieties.',
    treatment: 'Remove infected plants; no chemical treatment.'
  },
  {
    id: '92418b10-3c07-4145-8a7a-3f61f4e3b10a',
    name: 'Tomato___Tomato_mosaic_virus',
    scientificName: 'Tomato mosaic virus (ToMV)',
    description: 'Virus that spreads by contact, tools, or infected seed.',
    symptoms: 'Mottled leaves, fruit distortion, slowed growth.',
    severity: 'Moderate to severe',
    prevention: 'Disinfect tools, use certified seed.',
    treatment: 'Destroy infected plants; no chemical treatment.'
  },
  {
    id: 'cefc08d5-b982-4c4e-96d1-2c8c3be12288',
    name: 'Tomato___healthy',
    scientificName: 'None',
    description: 'Indicates a healthy tomato with no symptoms of disease.',
    symptoms: 'Bright green leaves, healthy fruiting, no damage.',
    severity: 'None',
    prevention: 'Maintain good farming practices.',
    treatment: 'None required.'
  }
]

const seedMissingDiseases = async () => {
  const existingNames = await prisma.disease.findMany({
    select: { name: true }
  })

  const existingSet = new Set(existingNames.map(d => d.name))

  const missing = diseases.filter(d => !existingSet.has(d.name))

  if (missing.length === 0) {
    console.log('🟡 All diseases already exist. Skipping...')
    return
  }

  await prisma.disease.createMany({
    data: missing,
    skipDuplicates: true
  })

  console.log(`✅ Seeded ${missing.length} missing diseases.`)
}

export default seedMissingDiseases
