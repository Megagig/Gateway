import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  //   // Extract token from cookies
  const token = req.cookies.authToken;

  //   // If token does not exist, return 401
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized - no Token provided' });
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized - Invalid Token' });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized - Server error' });
  }
};
