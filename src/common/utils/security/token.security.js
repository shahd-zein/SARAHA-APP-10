import jwt, { decode } from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, SYSTEM_REFRESH_TOKEN_SECRET_KEY, SYSTEM_ACCESS_TOKEN_SECRET_KEY, USER_ACCESS_TOKEN_SECRET_KEY, USER_REFRESH_TOKEN_SECRET_KEY } from "../../../../config/config.service.js"
import { findOne, UserModel } from "../../../DB/index.js"
import {
    NotFoundException,
    ConflictException,
    UnauthorizedException
} from "../../utils/response/error.response.js"
import { tokenTypeEnum } from "../../enums/security.enum.js";
import { RoleEnum } from "../../enums/user.enum.js";
import { MAX_ACCESS_BOUNDARY_RULES_COUNT } from "google-auth-library/build/src/auth/downscopedclient.js";
import { randomUUID } from 'node:crypto'
import {tokenModel} from "../../../DB/models/token.model.js"
export const generateToken = async ({ payload = {}, secret = USER_ACCESS_TOKEN_SECRET_KEY, options = {} } = {}) => {
    return jwt.sign(payload, secret, options)
}

export const verifyToken = async ({ token = {}, secret = USER_ACCESS_TOKEN_SECRET_KEY } = {}) => {
    return jwt.verify(token, secret)
}

export const detectSignatureLevel = async (level) => {
    let signature = { accessSignature: undefined, refreshSignature: undefined };
    switch (level) {
        case RoleEnum.Admin:
            signature = { accessSignature: SYSTEM_ACCESS_TOKEN_SECRET_KEY, refreshSignature: SYSTEM_REFRESH_TOKEN_SECRET_KEY };

            break;

        default:
            signature = { accessSignature: USER_ACCESS_TOKEN_SECRET_KEY, refreshSignature: USER_REFRESH_TOKEN_SECRET_KEY };

            break;
    }
    console.log({})
    return signature
}

export const getTokenSignature = async ({ tokenType = tokenTypeEnum.Access, level } = {}) => {
    const { accessSignature, refreshSignature } = await detectSignatureLevel(level)
    let signature = undefined;
    switch (tokenType) {
        case tokenTypeEnum.Refresh:
            signature = refreshSignature

            break;

        default:
            signature = accessSignature

            break;
    }
    return signature
}


export const decodedToken = async ({ token, tokenType = tokenTypeEnum.Access } = {}) => {
    const decoded = jwt.decode(token);
    console.log({ decoded });
    if (!decoded?.aud?.length) {
        throw UnauthorizedException({ message: 'Missing token audience' })
    }
    const [tokenApproach, level] = decoded.aud || [];
    console.log({ tokenApproach });

    if (tokenType !== tokenApproach) {
        throw ConflictException({ message: `unexpected token mechanism we expected ${tokenType} while you have used ${tokenApproach}` })
    }

    if (decoded.jti && await findOne({ model: tokenModel, filter: { jti: decoded.jti } })) {
        throw UnauthorizedException({ message: 'Invalid login session' })

    }
    const secret = await getTokenSignature({ tokenType: tokenApproach, level })

    const verifiedData = jwt.verify(token, secret);
    console.log({ verifiedData });

    const user = await findOne({
        model: UserModel,
        filter: {
            _id: verifiedData.sub
        }
    })
    if (!user) {
        throw NotFoundException({ message: 'Not Registered Account' })
    }
    console.log({ changeCredentialsTime: user.changeCredentialsTime?.getTime(), iat: decoded.iat * 1000 })
    if (user.changeCredentialsTime && user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
        throw UnauthorizedException({ message: 'Invalid login session' })
    }
    return { user, decoded }
}

export const createLoginCredentials = async (user, issuer) => {
    const { accessSignature, refreshSignature } = await detectSignatureLevel(user.role);

    const jwtId = randomUUID()
    const access_token = await generateToken({
        payload: { sub: user._id, extra: 250, jti: jwtId },
        secret: accessSignature,
        options: {
            issuer,
            audience: [tokenTypeEnum.Access, user.role],
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        }
    })
    const refresh_token = jwt.sign({ sub: user._id, extra: 250, jti: jwtId },
        refreshSignature,
        {
            issuer,
            audience: [tokenTypeEnum.Refresh, user.role],
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        }
    )
    return { access_token, refresh_token }

}