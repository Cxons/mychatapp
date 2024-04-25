const handlerErr = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  switch (statusCode) {
    case 400:
      res.json({
        status: 400,
        message: err.message,
        description: err.stack,
      });
      break;
    case 401:
      res.json({
        status: 401,
        message: err.message,
        description: err.stack,
      });
      break;
    case 403:
      res.json({
        status: 403,
        message: err.message,
        description: err.stack,
      });
      break;
    case 404:
      res.json({
        status: 404,
        message: err.message,
        description: err.stack,
      });
      break;
    case 500:
      res.json({
        status: 500,
        message: err.message,
        description: err.stack,
      });
      break;
    default:
      res.json({
        message: "All good no errors",
      });
  }
  next();
};

module.exports = handlerErr;
