import prisma from "../models/prismaClient.js";

// Common function to get system-wide stats everyone can see
async function getPublicStats() {
  const [totalDiseases, totalMedicines] = await prisma.$transaction([
    prisma.disease.count(),
    prisma.medicine.count()
  ]);
  return { totalDiseases, totalMedicines };
}

export const getFarmerDashboard = async (req, res) => {
  try {
    const farmerId = req.farmerId;
    
    if (!farmerId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access restricted to farmers only' 
      });
    }

    // Get both public stats and farmer-specific stats
    const [publicStats, farmerStats] = await Promise.all([
      getPublicStats(),
      (async () => {
        const topDiseaseIds = await prisma.detection.groupBy({
          by: ['diseaseId'],
          where: { farmerId },
          _count: { _all: true },
          orderBy: { _count: { diseaseId: 'desc' } },
          take: 5,
        }).then(results => results.map(r => r.diseaseId));

        const [
          totalDetections,
          healthStatusHealthy,
          healthStatusDiseased,
          recentDetections,
          totalAdvice,
          adviceWithMedicine,
          feedbackStatus,
          unreadNotifications,
          diseases
        ] = await prisma.$transaction([
          prisma.detection.count({ where: { farmerId } }),
          prisma.detection.count({
            where: { 
              farmerId,
              disease: { name: 'Tomato___healthy' }
            }
          }),
          prisma.detection.count({
            where: { 
              farmerId,
              NOT: {
                disease: { name: 'Tomato___healthy' }
              }
            }
          }),
          prisma.detection.findMany({
            where: { farmerId },
            orderBy: { detectedAt: 'desc' },
            take: 5,
            include: { disease: true }
          }),
          prisma.advice.count({
            where: { detection: { farmerId } }
          }),
          prisma.advice.count({
            where: { 
              detection: { farmerId },
              NOT: { medicineId: null }
            }
          }),
          prisma.feedback.groupBy({
            by: ['status'],
            where: { farmerId },
            _count: { _all: true }
          }),
          prisma.notification.count({
            where: { 
              userId: req.userId,
              isRead: false 
            }
          }),
          prisma.disease.findMany({
            where: { id: { in: topDiseaseIds } }
          })
        ]);

        const diseaseMap = diseases.reduce((map, disease) => {
          map[disease.id] = disease.name;
          return map;
        }, {});

        const diseaseDistribution = topDiseaseIds.map(diseaseId => ({
          disease: diseaseMap[diseaseId] || 'Unknown',
          count: totalDetections
        }));

        const feedbackStatusCount = feedbackStatus.reduce((acc, curr) => {
          acc[curr.status] = curr._count._all;
          return acc;
        }, {});

        return {
          totalDetections,
          diseaseDistribution: {
            count: diseaseDistribution.length,
            items: diseaseDistribution
          },
          healthStatus: {
            healthy: healthStatusHealthy,
            diseased: healthStatusDiseased,
            total: healthStatusHealthy + healthStatusDiseased
          },
          recentDetections: {
            count: recentDetections.length,
            items: recentDetections.map(det => ({
              id: det.id,
              image:det.image,
              disease: det.disease.name,
              confidence: det.confidence,
              detectedAt: det.detectedAt
            }))
          },
          adviceStats: {
            total: totalAdvice,
            withMedicine: adviceWithMedicine,
            percentageWithMedicine: totalAdvice > 0 
              ? Math.round((adviceWithMedicine / totalAdvice) * 100) 
              : 0
          },
          feedbackStatus: {
            ...feedbackStatusCount,
            total: Object.values(feedbackStatusCount).reduce((sum, count) => sum + count, 0)
          },
          unreadNotifications
        };
      })()
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...publicStats, // Includes totalDiseases and totalMedicines
        ...farmerStats // All farmer-specific stats
      }
    });

  } catch (error) {
    console.error('[FarmerAnalytics] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch farmer dashboard data'
    });
  }
};

export const getAgronomistDashboard = async (req, res) => {
  try {
    const agronomistId = req.AgronomistId;
    
    if (!agronomistId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access restricted to agronomists only' 
      });
    }

    const [publicStats, agronomistStats] = await Promise.all([
      getPublicStats(),
      (async () => {
        const [
          totalFarmers,
          activeFarmers,
          diseases,
          totalAdvice,
          adviceWithFeedback,
          recentDetections,
          unreadNotifications,
          pendingFeedback,
          topMedicines
        ] = await prisma.$transaction([
          prisma.farmer.count(),
          prisma.detection.groupBy({
            by: ['farmerId'],
            where: { detectedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, //who detcted with in30 dyas
            _count: { _all: true }
          }),
          prisma.disease.findMany({
            include: { 
              _count: { select: { detections: true } },
              detections: {
                take: 1,
                orderBy: { detectedAt: 'desc' }
              }
            },
            orderBy: { detections: { _count: 'desc' } },
            take: 5
          }),
          prisma.advice.count({ where: { agronomistId } }),
          prisma.advice.count({
            where: { 
              agronomistId,
              feedbacks: { some: {} }
            }
          }),
          prisma.detection.findMany({
            orderBy: { detectedAt: 'desc' },
            take: 5,
            include: { 
              disease: true,
              farmer: { include: { user: true } }
            }
          }),
          prisma.notification.count({
            where: { 
              userId: req.userId,
              isRead: false 
            }
          }),
          prisma.feedback.count({
            where: { status: 'pending' }
          }),
          prisma.medicine.findMany({
            include: { 
              _count: { select: { advices: true } },
              diseases: true
            },
            orderBy: { advices: { _count: 'desc' } },
            take: 3
          })
        ]);

        return {
          farmerStats: {
            totalFarmers,
            activeFarmers: {
              count: activeFarmers.length,
              percentage: totalFarmers > 0 
                ? Math.round((activeFarmers.length / totalFarmers) * 100)
                : 0
            }
          },
          diseaseTrends: {
            count: diseases.length,
            items: diseases.map(disease => ({
              name: disease.name,
              detectionCount: disease._count.detections,
              lastDetection: disease.detections[0]?.detectedAt || null
            }))
          },
          advicePerformance: {
            total: totalAdvice,
            withFeedback: adviceWithFeedback,
            feedbackPercentage: totalAdvice > 0
              ? Math.round((adviceWithFeedback / totalAdvice) * 100)
              : 0
          },
          recentDetections: {
            count: recentDetections.length,
            items: recentDetections.map(det => ({
              id: det.id,
              disease: det.disease.name,
              farmer: det.farmer.user.username,
              detectedAt: det.detectedAt,
              location: det.latitude && det.longitude 
                ? { lat: det.latitude, lng: det.longitude }
                : null
            }))
          },
          pendingActions: {
            unreadNotifications,
            pendingFeedback
          },
          topMedicines: {
            count: topMedicines.length,
            items: topMedicines.map(med => ({
              name: med.name,
              usageCount: med._count.advices,
              diseases: {
                count: med.diseases.length,
                items: med.diseases.map(d => d.name)
              }
            }))
          }
        };
      })()
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...publicStats, // Includes totalDiseases and totalMedicines
        ...agronomistStats // All agronomist-specific stats
      }
    });

  } catch (error) {
    console.error('[AgronomistAnalytics] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch agronomist dashboard data'
    });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        message: 'Access restricted to administrators only' 
      });
    }

    const [publicStats, adminStats] = await Promise.all([
      getPublicStats(),
      (async () => {
        const [
          totalUsers,
          activeUsers,
          roleDistribution,
          totalDetections,
          recentDetections,
          topDiseases,
          totalFeedbacks,
          unresolvedFeedbacks,
          newUsers,
          criticalIssues
        ] = await prisma.$transaction([
          prisma.user.count(),
          prisma.user.count({
            where: { 
              lastLogin: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
          }),
          prisma.user.groupBy({
            by: ['role'],
            _count: { _all: true }
          }),
          prisma.detection.count(),
          prisma.detection.count({
            where: { 
              detectedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
          }),
          prisma.disease.findMany({
            include: { _count: { select: { detections: true } } },
            orderBy: { detections: { _count: 'desc' } },
            take: 5
          }),
          prisma.feedback.count(),
          prisma.feedback.count({
            where: { status: 'pending' }
          }),
          prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              email: true,
              role: true,
              createdAt: true,
              profilePicture: true
            }
          }),
          prisma.feedback.findMany({
            where: { status: 'pending' },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: {
              detection: {
                include: {
                  disease: true
                }
              },
              farmer: {
                include: {
                  user: true
                }
              }
            }
          })
        ]);

        return {
          userStats: {
            totalUsers,
            activeUsers,
            activePercentage: totalUsers > 0
              ? Math.round((activeUsers / totalUsers) * 100)
              : 0,
            roleDistribution: {
              count: roleDistribution.length,
              items: roleDistribution.map(role => ({
                role: role.role,
                count: role._count._all,
                percentage: totalUsers > 0
                  ? Math.round((role._count._all / totalUsers) * 100)
                  : 0
              }))
            }
          },
          detectionStats: {
            totalDetections,
            recentDetections,
            recentPercentage: totalDetections > 0
              ? Math.round((recentDetections / totalDetections) * 100)
              : 0
          },
          diseaseStats: {
            count: topDiseases.length,
            items: topDiseases.map(disease => ({
              name: disease.name,
              detectionCount: disease._count.detections,
              percentage: totalDetections > 0
                ? Math.round((disease._count.detections / totalDetections) * 100)
                : 0
            }))
          },
          feedbackStats: {
            totalFeedbacks,
            unresolvedFeedbacks,
            resolvedPercentage: totalFeedbacks > 0
              ? Math.round(((totalFeedbacks - unresolvedFeedbacks) / totalFeedbacks) * 100)
              : 0
          },
          recentActivity: {
            newUsers: {
              count: newUsers.length,
              items: newUsers
            },
            criticalIssues: {
              count: criticalIssues.length,
              items: criticalIssues.map(issue => ({
                id: issue.id,
                category: issue.category,
                farmer: issue.farmer.user.username,
                disease: issue.detection?.disease?.name || 'Unknown',
                createdAt: issue.createdAt
              }))
            }
          }
        };
      })()
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...publicStats, // Includes totalDiseases and totalMedicines
        ...adminStats // All admin-specific stats
      }
    });

  } catch (error) {
    console.error('[AdminAnalytics] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin dashboard data'
    });
  }
};