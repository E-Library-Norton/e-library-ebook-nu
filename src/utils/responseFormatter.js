// ============================================
// FILE: src/utils/responseFormatter.js
// ============================================

class ResponseFormatter {
  static success(
    res,
    data,
    message = "Success",
    statusCode = 200,
    pagination = null
  ) {
    const response = {
      success: true,
      message,
      data,
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
  }

  static error(
    res,
    message = "Error",
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details = null
  ) {
    const response = {
      success: false,
      error: {
        code,
        message,
      },
    };

    if (details) {
      response.error.details = details;
    }

    return res.status(statusCode).json(response);
  }

  static notFound(res, message = "Resource not found") {
    return this.error(res, message, 404, "RESOURCE_NOT_FOUND");
  }

  static unauthorized(res, message = "Unauthorized access") {
    return this.error(res, message, 401, "UNAUTHORIZED");
  }

  static forbidden(res, message = "Access forbidden") {
    return this.error(res, message, 403, "FORBIDDEN");
  }

  static validationError(res, errors) {
    return this.error(
      res,
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      errors
    );
  }

  static paginate(page, limit, totalItems) {
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }
}

module.exports = ResponseFormatter;
