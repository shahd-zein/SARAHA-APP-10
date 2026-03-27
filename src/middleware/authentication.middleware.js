import { tokenTypeEnum } from "../common/enums/security.enum.js"
import { 
    BadRequestException, 
    decodedToken, 
    ForbiddenException, 
    UnauthorizedException 
} from "../common/utils/index.js"
import {login} from "../modules/auth/auth.service.js"

export const authentication = (tokenType = tokenTypeEnum.Access) => {
    return async (req, res, next) => {
        const [schema, credentials] = req.headers.authorization?.split(" ") || []
        if(!schema || !credentials){
            throw     UnauthorizedException 
            ({message: "Missing authentication key or invalid approach"})
        }

        switch (schema){
            case "Basic":
                const data = Buffer.from(credentials, 'base64').toString()?.split(":") || [];
                await login({email, password}, `${req.protocol}://${req.host}`)
                console.log(data)
            case 'Bearer':
                req.user = await decodedToken({ token: credentials, tokenType})
                break;
                default:
                    throw BadRequestException({message: "Invalid authentication schema"})
                    break;  
        }
        next()
    }
}

export const authorization = (accessRoles=[]) => {
    return async (req, res, next) => {
       if(!accessRoles.includes(req. res.role)){
        throw ForbiddenException({message: "Not authorized account"})
       }
        next()
    }
}