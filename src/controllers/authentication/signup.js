import prisma from "../../models/prismaClient.js";
import { formatUser } from "../../utils/formatUser.js";
import { tokengenerating } from "../../utils/jwtfunctions.js";
import { passHashing } from "../../utils/passwordfunctions.js";
import Response from "../../utils/response.js";
export const signup = async (req, res) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: req.body.email
      }
    });

    if (existingUser) {
      return Response.error(res, "Email is already in use.", 409);
    }

    const hashedPassword = await passHashing(req.body.password);
    const newUserDetails = { ...req.body, password: hashedPassword };

    if (req.files && req.files.profilePicture) {
      newUserDetails.profilePicture = `/media/${req.files.profilePicture[0]
        .filename}`;
    }
    const newUser = await prisma.user.create({
      data: newUserDetails
    });

    let AgronomistId = null;
    const farmer = await prisma.farmer.create({
      data: { userId: newUser.id }
    });
    const farmerId = farmer.id;
    if (newUser.role === "AGRONOMIST") {
      const Agronomist = await prisma.agronomist.create({
        data: {
          userId: newUser.id,
          name: newUser.username || "AGRONOMIST"
        }
      });
      AgronomistId = Agronomist.id;
    }
    const token = tokengenerating({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      ...(farmerId && { farmerId }),
      ...(AgronomistId && { AgronomistId })
    });
    const userInfo = formatUser({
      ...newUser,
      farmer: farmerId ? { id: farmerId } : undefined,
     agronomist:  AgronomistId ? { id: AgronomistId } : undefined
    });
    return Response.success(
      res,
      {
        access_token: token,
        user: userInfo
      },
      "User registered successfully"
    );
  } catch (err) {
    console.error("Signup Error:", err);
    return Response.error(
      res,
      "Something went wrong during signup",
      500,
      err.message
    );
  }
};
