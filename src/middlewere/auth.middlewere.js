import jwt from 'jsonwebtoken';
import { tokenTypeEnum } from "../common/enums/security.enum.js"
import {
    BadRequestException,
    decodedToken,
    ForbiddenException,
    UnauthorizedException
} from "../common/utils/index.js"
import { login } from "../modules/auth/auth.service.js"

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const err = new Error("Unauthorized: No token provided or wrong format");
        err.statusCode = 401;
        throw err;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.usrId) {
        const err = new Error("Unauthorized: Invalid token");
        err.statusCode = 401;
        throw err;
    }

    req.user = { userId: decoded.usrId };
    next();
};
export const authentication = (tokenType = tokenTypeEnum.Access) => {
    return async (req, res, next) => {
        const [schema, credentials] = req.headers.authorization?.split(" ") || []
        if (!schema || !credentials) {
            throw UnauthorizedException
                ({ message: "Missing authentication key or invalid approach" })
        }

        switch (schema) {
            case "Basic":
                const data = Buffer.from(credentials, 'base64').toString()?.split(":") || [];
                await login({ email, password }, `${req.protocol}://${req.host}`)
                console.log(data)
            case 'Bearer':
                const { user, decoded } = await decodedToken({ token: credentials, tokenType })
                req.user = user;
                req.decoded = decoded;
                break;               
        }
        next()
    }
}
export const authorization = (accessRoles = []) => {
    return async (req, res, next) => {
        if (!accessRoles.includes(req.res.role)) {
            throw ForbiddenException({ message: "Not authorized account" })
        }
        next()
    }
}