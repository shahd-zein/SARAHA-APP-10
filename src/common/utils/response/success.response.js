export const successResponse = ({ res,
    message = "success",
    statusCode = 200,
    data = undefined,
} = {}) => {
    return res.status(statusCode).json({ statusCode, message, data })
}