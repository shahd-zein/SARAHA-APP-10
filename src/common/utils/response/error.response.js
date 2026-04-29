import { NODE_ENV } from "../../../../config/config.service.js"
import multer from "multer"
//general customized error method
export const ErrorResponse = ({ status, message }) => {
    const error = new Error(message);
    error.status = status;
    return error;
};
//error-templates

export const BadRequestException = ({ message = "BadRequestException", extra = undefined } = {}) => {
    return ErrorResponse({ message, status: 400, extra })
}
export const ConflictException = ({ message = "ConflictException", extra = undefined } = {}) => {
    return ErrorResponse({ message, status: 409, extra })
}

export const UnauthorizedException = ({ message = "UnauthorizedException", extra = undefined } = {}) => {
    return ErrorResponse({ message, status: 401, extra })
}

export const NotFoundException = ({ message = "Not Found" } = {}) => {
    return ErrorResponse({
        status: 404,
        message
    });
};

export const ForbiddenException = ({ message = "ForbiddenException", extra = undefined } = {}) => {
    return ErrorResponse({ message, status: 403, extra })
}


//Fixed  error  structure
export const globalErrorHandling = (error, req, res, next) => {
    const status = error.status || error.cause?.status || 500;

    const mood = NODE_ENV == "production";
    const defaultErrorMessage = "something went wrong Server error";
    const displayErrorMessage = error.message || defaultErrorMessage;

    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            message: error.message
        });
    }

    return res.status(status).json({
        status,
        stack: mood ? undefined : error.stack,
        extra: error?.cause?.extra || undefined,
        errorMessage: mood
            ? status == 500
                ? defaultErrorMessage
                : displayErrorMessage
            : displayErrorMessage
    });
};