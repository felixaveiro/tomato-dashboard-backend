export const formatUser = user => {
  const base = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }

  if (user.role === 'FARMER' && user.farmer) {
    base.farmerId = user.farmer.id
  }

  if (user.role === 'AGRONOMIST' && user.Agronomist) {
    base.AgronomistId = user.Agronomist.id
  }

  return base
}
