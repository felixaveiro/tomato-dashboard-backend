import prisma from "../models/prismaClient.js"
import { createNotificationForUsers } from "../utils/notificationUtils.js"
import dayjs from 'dayjs';

class AdviceService {
  async createAdvice(data) {
    try {
      const advice = await prisma.advice.create({
        data,
        include: {
          detection: {
            select: {
              confidence: true,
              image: true,
              disease: {
                select: { name: true }
              },
              farmer: {
                include: {
                  user: {
                    select: { id: true }
                  }
                }
              }
            }
          },
          medicine: {
            select: {
              name: true
            }
          },
          agronomist: {
            include: {
              user: {
                select: { username: true }
              }
            }
          }
        }
      });
  
      const userId = advice?.detection?.farmer?.user?.id;
  
      if (userId) {
        const diseaseName = advice.detection?.disease?.name || "a disease";
        const prescription = advice.prescription;
        const medicineName = advice?.medicine?.name;
        const agronomistName = advice.agronomist?.user?.username || "an agronomist";
        const confidence = (advice.detection.confidence * 100).toFixed(1) + '%';
        const imageUrl = advice.detection.image;
        const createdAt = dayjs(advice.createdAt).format('YYYY-MM-DD HH:mm');
  
        const messageLines = [
          `🧑‍🌾 Advice from ${agronomistName}`,
          `🦠 Disease: ${diseaseName}`,
          `📝 Prescription: ${prescription}`,
          `🕒 Advice given at: ${createdAt}`,
          `📊 Detection confidence: ${confidence}`
        ];
  
        if (medicineName) {
          messageLines.push(`💊 Medicine: ${medicineName}`);
        }
  
        if (imageUrl) {
          messageLines.push(`🖼️ Image: ${imageUrl}`);
        }
  
        await createNotificationForUsers([userId], {
          title: "New Advice for Your Detection",
          message: messageLines.join('\n')
        });
      }
  
      return advice;
    } catch (error) {
      console.log("Error creating advice:", error.message);
      throw new Error(`Failed to create advice: ${error.message}`);
    }
  }


  async getAllAdvices () {
    return await prisma.advice.findMany({
      select: {
        id: true,
        prescription: true,
        createdAt: true,
        detection: {
          select: {
            id: true,
            disease: true,
            farmer: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                    profilePicture: true
                  }
                }
              }
            }
          }
        },
       agronomist:  {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true
              }
            }
          }
        },
        medicine: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async getAdviceById(id) {
    try {
      const advice = await prisma.advice.findUnique({
        where: { id },
        include: {
          agronomist: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profilePicture: true,
                  username: true,
                },
              },
            },
          },
          medicine: true,
          detection: {
            select: {
              image: true, // scalar field, not nested
              confidence: true, // scalar field, not nested
              latitude: true,
              longitude: true,
              detectedAt: true,
              disease: {
                select: {
                  id: true,
                  name: true,
                  scientificName: true,
                  severity: true,
                  symptoms: true,
                },
              },
              farmer: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      profilePicture: true,
                      username: true,
                    }, 
                  },
                  region: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          feedbacks: {
            include: {
              response: {
                include: {
                  author: {
                    select: {
                      id: true,
                      email: true,
                      username: true,
                      profilePicture: true,
                      role: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
  
      if (!advice) {
        throw new Error("Advice not found");
      }
  
      return advice;
    } catch (error) {
      console.error("Failed to get advice by ID:", error);
      throw new Error("Unable to fetch advice details.");
    }
  }
  

  async updateAdvice (id, data) {
    // Make sure it exists before update
    const exists = await prisma.advice.findUnique({ where: { id } })
    if (!exists) {
      throw new Error('Advice not found')
    }

    return await prisma.advice.update({
      where: { id },
      data
    })
  }
// In AdviceService.js
async getAdvicesByDetectionId(detectionId) {
  return await prisma.advice.findMany({
    where: { detectionId },
    select: {
      id: true,
      prescription: true,
      createdAt: true,
      medicine: {
        select: {
          id: true,
          name: true
        }
      },
      agronomist: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

  async deleteAdvice (id) {
    // Make sure it exists before delete
    const exists = await prisma.advice.findUnique({ where: { id } })
    if (!exists) {
      throw new Error('Advice not found')
    }

    return await prisma.advice.delete({
      where: { id }
    })
  }
}

export default new AdviceService()
