import { NODE_ENV, port } from "../../../../config/config.service.js";
console.log("CONFIG LOADED", port)


export const globalErrorHandler = (error, req, res, next) => {
    const status = error.cause?.status ?? 500
    return res.status(status).json({
        error_message:
            status == 500 ? 'something went wrong' : error.message ?? 'something went wrong',
        stack: NODE_ENV == "development" ? error.stack : undefined
    })
}

export const ErrorException = ({ message= "fail", status=400, extra = undefined } ={}) => {
    throw new Error(message, { cause: { status, extra } })
}  

export const conflictException = ({ message= "conflit", extra } ={}) => {
    throw ErrorException({message, status:409, extra})
}                                                       

export const NotFound = ({ message= "Notfound", extra } ={}) => {
    throw ErrorException({message, status:404, extra})
}   
