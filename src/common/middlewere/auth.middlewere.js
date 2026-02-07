import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("Unauthorized: No token provided or wrong format");
    err.statusCode = 401;
    throw err;
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);   

  if (!decoded || !decoded.usrId) {
    const err = new Error("Unauthorized: Invalid token");
    err.statusCode = 401;
    throw err;
  }

  req.user = { userId: decoded.usrId };
  next();
};
