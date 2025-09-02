import { name } from 'ejs'
import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { fileURLToPath } from 'url'
// import schema from '../../prisma/json-schema/json-schema.json' assert { type: 'json' };
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// const schema =JSON.parse(fs.readFileSync(path.join(__dirname, '../../prisma/json-schema/json-schema.json'), 'utf8'));
let  schemaText =fs.readFileSync(path.join(__dirname, '../../prisma/json-schema/json-schema.json'), 'utf8')
// Replace all #/definitions/ references to #/components/schemas/
schemaText = schemaText.replace(/#\/definitions\//g, '#/components/schemas/')
const schema = JSON.parse(schemaText)

const authDocs = yaml.load(fs.readFileSync(path.join(__dirname, 'auth.yaml'), 'utf8'))
const detectDocs = yaml.load(fs.readFileSync(path.join(__dirname, 'detect.yaml'), 'utf8'))
const devDocs = yaml.load(fs.readFileSync(path.join(__dirname, 'dev.yaml'), 'utf8'))
const diseasesDocs = yaml.load(fs.readFileSync(path.join(__dirname, 'diseases.yaml'), 'utf8'))
const medecineDocs = yaml.load(fs.readFileSync(path.join(__dirname, 'medecine.yaml'), 'utf8'))
const feedbackDocs = yaml.load(fs.readFileSync(path.join(__dirname, 'feedback.yaml'), 'utf8'))
const  adivicesDocs = yaml.load(fs.readFileSync(path.join(__dirname, 'advice.yaml'), 'utf8'))
const FeedbackResponseDocs = yaml.load(fs.readFileSync(path.join(__dirname, 'feedbackResponse.yaml'), 'utf8'))
const NotificationsResponseDocs = yaml.load(fs.readFileSync(path.join(__dirname, 'notifications.yaml'), 'utf8'))
const statisticsDocs = yaml.load(fs.readFileSync(path.join(__dirname, 'statistics.yaml'), 'utf8'))

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Tomato Disease Detection API',
    version: '1.0.0',
    description: `API documentation for the Tomato Disease Detection system.
  📞 Phone: +250780941222`,
  contact: {
    name: 'Bikorimana Felix',
    url: 'https://rugangazi.netlify.app/',
    email: 'bikofelix2020@gmail.com'
  }
  },
  servers: [
    {
      url: 'http://localhost:5001/api',
      description: 'Local server'
    },
    {
      url: 'https://tomato-disease-backend-api.onrender.com/api',
      description: 'Development server'
    }
  ],
  tags: [
    { name: 'Development', description: 'Development related endpoints' },
    { name: 'Authentication', description: 'Endpoints related to user authentication and management' },
    { name: 'Detection', description: 'Endpoints related to disease detections' },
    { name: 'Disease', description: 'CRUD for diseases' },
    { name: 'Medecine', description: 'CRUD for medecines' },
    { name: 'Feedback', description: 'Feedback related endpoints' },
    {name: 'FeedbackResponse', description: 'Endpoints for feedback responses'},
    { name: 'Advice', description: 'Endpoints related to agronomist advice' },
    { name: 'Notifications', description: 'Endpoints related to notifications' },
    { name: 'Statistics', description: 'Endpoints related to nstatictistcs' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your token like this: Bearer <your_token>'
      }
    },
    schemas: {
      ...schema.definitions,
      FeedbackInput: {
        type: 'object',
        required: ['detectionId', 'comment', 'category'],
        properties: {
          detectionId: {
            type: 'string',
            example: 'uuid-detection-id'
          },
          comment: {
            type: 'string',
            example: 'Very accurate result. Thank you!'
          },
          category: {
            type: 'string',
            enum: ['accuracy', 'usability', 'bug', 'feature'],
            example: 'accuracy'
          },
          adviceId: {
            type: 'string',
            nullable: true,
            example: 'uuid-advice-id'
          }
        }
      },
      FeedbackListItem: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'uuid-feedback-id'
          },
          comment: {
            type: 'string',
            example: 'App crashes when uploading multiple images.'
          },
          category: {
            type: 'string',
            example: 'bug'
          },
          status: {
            type: 'string',
            enum: ['pending', 'addressed', 'resolved'],
            example: 'pending'
          },
          reportId: {
            type: 'string',
            example: 'RPT-001'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T09:30:00Z'
          },
          farmer: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid-farmer-id' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid-user-id' },
                  email: { type: 'string', example: 'john@example.com' },
                  username: { type: 'string', example: 'johnny' },
                  role: { type: 'string', example: 'FARMER' },
                  profilePicture: {
                    type: 'string',
                    example: 'https://example.com/profile.jpg'
                  },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2023-12-01T12:00:00Z'
                  }
                }
              }
            }
          }
        }
      },
      FeedbackOnDetectionInput: {
        type: 'object',
        required: ['detectionId', 'comment', 'category'],
        properties: {
          detectionId: {
            type: 'string',
            example: 'uuid-detection-id'
          },
          comment: {
            type: 'string',
            example: 'Very accurate result. Thank you!'
          },
          category: {
            type: 'string',
            enum: ['accuracy', 'usability', 'bug', 'feature'],
            example: 'accuracy'
          }
        }
      },
      
      Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              example: 'e8b5e5a4-1f4c-4d47-9bb4-1e1e2f81412a'
            },
            title: {
              type: 'string',
              example: 'New Message'
            },
            message: {
              type: 'string',
              example: 'You have a new notification'
            },
            isRead: {
              type: 'boolean',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-06-25T10:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-06-25T11:00:00Z'
            }
          }
        },
      
      ResponseSuccess: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object',
              nullable: true
            }
          }
        },
      
      Unauthorized: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Unauthorized'
            }
          }
        },
      
      Forbidden: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Forbidden'
            }
          }
        },
      
        NotFound: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Resource not found'
            }
          }
        },
      
        InternalError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Something went wrong'
            }
          }
        }
      ,
      
      
      FeedbackOnAdviceInput: {
        type: 'object',
        required: ['detectionId', 'adviceId', 'comment', 'category'],
        properties: {
          detectionId: {
            type: 'string',
            example: 'uuid-detection-id'
          },
          adviceId: {
            type: 'string',
            example: 'uuid-advice-id'
          },
          comment: {
            type: 'string',
            example: 'The advice was very helpful!'
          },
          category: {
            type: 'string',
            enum: ['accuracy', 'usability', 'bug', 'feature'],
            example: 'usability'
          }
        }
      },
      
    FeedbackListItem: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'uuid-feedback-id'
          },
          comment: {
            type: 'string',
            example: 'App crashes when uploading multiple images.'
          },
          category: {
            type: 'string',
            example: 'bug'
          },
          status: {
            type: 'string',
            enum: ['pending', 'addressed', 'resolved'],
            example: 'pending'
          },
          reportId: {
            type: 'string',
            example: 'RPT-001'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T09:30:00Z'
          },
          farmer: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid-farmer-id' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid-user-id' },
                  email: { type: 'string', example: 'john@example.com' },
                  username: { type: 'string', example: 'johnny' },
                  role: { type: 'string', example: 'FARMER' },
                  profilePicture: {
                    type: 'string',
                    example: 'https://example.com/profile.jpg'
                  },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2023-12-01T12:00:00Z'
                  }
                }
              }
            }
          }
        }
      }
      ,
      
    DetectionBasic: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-detection-id' },
          image: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' },
          confidence: { type: 'number', format: 'float', example: 0.99 },
          latitude: { type: 'number', example: 1.234 },
          longitude: { type: 'number', example: 2.345 },
          detectedAt: { type: 'string', format: 'date-time', example: '2025-06-20T15:00:00Z' },
          disease: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' }
            }
          },
          farmer: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' }
                }
              }
            }
          }
        }
      },
    DiseaseInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            example: 'Early Blight',
            default: 'Early Blight'
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'A common tomato leaf disease',
            default: 'A common tomato leaf disease'
          },
          scientificName: {
            type: 'string',
            nullable: true,
            example: 'Alternaria solani',
            default: 'Alternaria solani'
          },
          symptoms: {
            type: 'string',
            nullable: true,
            example: 'Dark spots with concentric rings on leaves, yellowing and defoliation',
            default: 'Dark spots with concentric rings on leaves, yellowing and defoliation'
          },
          severity: {
            type: 'string',
            nullable: true,
            example: 'High',
            default: 'High'
          },
          prevention: {
            type: 'string',
            nullable: true,
            example: 'Crop rotation, proper spacing, avoid overhead watering',
            default: 'Crop rotation, proper spacing, avoid overhead watering'
          },
          treatment: {
            type: 'string',
            nullable: true,
            example: 'Apply fungicides containing chlorothalonil or copper compounds',
            default: 'Apply fungicides containing chlorothalonil or copper compounds'
          }
        }
      }
      ,
    MedicineInput: {
        type: 'object',
        required: ['name', 'description'],
        properties: {
          name: {
            type: 'string',
            example: 'Fungicide X',
            default: 'Fungicide X',
          },
          description: {
            type: 'string',
            example: 'Used to treat fungal infections',
            default: 'Used to treat fungal infections',
          },
          diseases: {
            type: 'array',
            items: {
              type: 'string',
              example: 'disease-uuid-here',
            },
            nullable: true,
            description: 'Array of disease IDs that this medicine treats',
          },
          usageInstructions: {
            type: 'array',
            items: {
              type: 'string',
              example: 'Spray every 7 days',
            },
            nullable: true,
            description: 'Array of usage instructions',
            example: [
              'Spray every 7 days',
              'Do not use under direct sunlight',
              'Wear gloves when applying',
            ],
          },
        },
      },
    AdviceOnDetectionInput: {
        type: 'object',
        required: ['detectionId', 'prescription'],
        properties: {
          detectionId: {
            type: 'string',
            example: 'uuid-detection-id'
          },
          prescription: {
            type: 'string',
            example: 'Apply fungicide every 3 days for 2 weeks'
          },
          medicineId: {
            type: 'string',
            nullable: true,
            example: 'uuid-medicine-id'
          }
        }
      },
      
    AdviceOnMedicineInput: {
        type: 'object',
        required: ['medicineId', 'prescription'],
        properties: {
          medicineId: {
            type: 'string',
            example: 'uuid-medicine-id'
          },
          prescription: {
            type: 'string',
            example: 'Use twice daily before sunset'
          },
          detectionId: {
            type: 'string',
            nullable: true,
            example: 'uuid-detection-id'
          }
        }
      }
      
      
      
    }
  },
  security: [
    { bearerAuth: [] }
  ],
  paths: {
    ...authDocs,
    ...detectDocs,
    ...diseasesDocs,
    ...medecineDocs,
    ...feedbackDocs,
    ...adivicesDocs,
    ...FeedbackResponseDocs,
    ...devDocs,
    ...NotificationsResponseDocs,
    ...statisticsDocs
  }
}

export default swaggerSpec
