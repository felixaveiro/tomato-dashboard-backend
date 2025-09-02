import jwt from "jsonwebtoken";
import Response from "./response.js";


export const tokengenerating = payload => {

  let token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP
  });
  return token;
};
export const Authenticate=(req,res,next)=> 
{
try{
let auth = req.headers.authorization;
 let token = auth?.split( " ")[1];

 if (!token) {
    return Response.error(
      res,
      "No access token provided. Please log in or set token in headers.",
      401
    )
  }     
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return Response.error(res, `Invalid token: ${err.message}`, 401)
    }
    req.userId = decoded.id
    req.userEmail = decoded.email
    req.farmerId = decoded.farmerId || null
    req.AgronomistId = decoded.AgronomistId || null
    req.userRole = decoded.role;
    next();
}
);
} catch (err) {
    console.log("Token verification error:", err);
    return Response.error(
      res,
      `Internal server error from token verification: ${err.message}`,
      500
    )
  }
}




