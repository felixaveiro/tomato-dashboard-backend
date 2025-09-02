class Response {
  static success (res, data = {}, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    })
  }

  static created (res, data = {}, message = 'Resource created successfully') {
    return this.success(res, data, message, 201)
  }

  static accepted (res, data = {}, message = 'Request accepted') {
    return this.success(res, data, message, 202)
  }

  static noContent (res, message = 'No content') {
    return res.status(204).send()
  }

  static badRequest (res, message = 'Bad request', error = null) {
    return this.error(res, error, message, 400)
  }

  static unauthorized (res, message = 'Unauthorized') {
    return this.error(res, null, message, 401)
  }

  static forbidden (res, message = 'Forbidden') {
    return this.error(res, null, message, 403)
  }

  static notFound (res, message = 'Resource not found') {
    return this.error(res, null, message, 404)
  }

  static conflict (res, message = 'Conflict', error = null) {
    return this.error(res, error, message, 409)
  }

  static unprocessableEntity (
    res,
    message = 'Unprocessable entity',
    error = null
  ) {
    return this.error(res, error, message, 422)
  }

  static tooManyRequests (res, message = 'Too many requests') {
    return this.error(res, null, message, 429)
  }

  static error (
    res,
    error = null,
    message = 'Something went wrong',
    statusCode = 500
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error ? error.toString() : undefined
    })
  }
}

export default Response
