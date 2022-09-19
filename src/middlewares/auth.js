import jwt from "jsonwebtoken";
import ErrorHandler from "../helpers/errorHandler.js";
import catchAsyncError from "../helpers/catchAsyncError.js";

const authMiddleware = {};

authMiddleware.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const bearerHeader = req.headers.authorization;

  if (!bearerHeader) {
    return next(new ErrorHandler(ResponseMessages.AUTH_PARAM_REQUIRED, 400));
  }

  const bearer = bearerHeader.split(" ");
  const token = bearer[1];

  if (!token) {
    return next(new ErrorHandler(ResponseMessages.AUTH_TOKEN_REQUIRED, 404));
  }

  /// decodedData is an object that will be used to store
  /// the decoded data from the token
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  // console.log(decodedData);

  const user = await models.User.findById(decodedData.id);

  if (token !== user.token) {
    return next(new ErrorHandler(ResponseMessages.INVALID_EXPIRED_TOKEN, 400));
  }

  req.user = user;

  if (req.user.accountStatus !== "active") {
    return res.status(401).json({
      success: false,
      accountStatus: req.user.accountStatus,
      message: ResponseMessages.ACCOUNT_NOT_ACTIVE,
    });
  }

  next();
});
