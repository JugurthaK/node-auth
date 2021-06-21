exports.success = (message, results, statusCode) => {
  return {
    message,
    error: false,
    code: statusCode,
    results
  }
}

exports.error = (message, statusCode) => {
  const codes = [200, 501, 400, 401, 404, 403, 422, 500]

  const findCode = codes.find((code) => code === statusCode)

  statusCode = !findCode ? 500 : findCode

  return {
    message,
    code: statusCode,
    error: true
  }
}

exports.validation = (errors) => {
  return {
    message: "Validation Errors",
    error: true,
    code: 422,
    errors
  }
}