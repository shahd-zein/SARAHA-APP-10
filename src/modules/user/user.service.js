import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../../config/config.service.js";
import { LogoutEnum } from "../../common/enums/security.enum.js";
import { ConflictException, createLoginCredentials, NotFoundException } from "../../common/utils/index.js"
import { createOne, tokenModel, UserModel, deleteMany } from '../../DB/index.js'
import { findOne } from '../../DB/index.js'
import { set, revokeTokenKey, deleteKey, keys, baseRevokeTokenKey, ttl } from "../../common/services/index.js"

const createRevokeToken = async ({ userId, jti, ttl }) => {
    await set({
        key: revokeTokenKey({ userId, jti }),
        value: jti,
        ttl
    })
}

export const logout = async ({ flag }, user, { jti, iat, sub }) => {
    let status = 200
    switch (flag) {
        case LogoutEnum.All:
            user.changeCredentialsTime = new Date()
            await user.save()

            await deleteKey(await keys(`${baseRevokeTokenKey(sub)}*`))
            break;

        default:
            await createRevokeToken({
                userId: sub,
                jti,
                ttl: iat + REFRESH_TOKEN_EXPIRES_IN
            }) 
            status = 201
            break;
    }
    return status;
};

export const profileImage = async (file, user) => {
    user.profilePicture = file.finalPath
    await user.save()
    return user;
};

export const coverPicture = async (files, user) => {
    user.coverPicture = files.map(file => file.finalPath)
    await user.save()
    return user;
};

export const generateDecryptedPhone = (phone) => {
    return phone;
};

export const shareProfile = async (userId) => {
    const account = await findOne({ model: UserModel, filter: { _id: userId }, select: "-password" })
    if (!account) {
        throw NotFoundException({ message: "Invalid shared account" })
    }
    if (account.phone) {
        account.phone = await generateDecryptedPhone(account.phone)
    }
    return account
}

export const profile = async (user) => {
    return user
}

export const rotateToken = async (user, { sub, jti, iat }, issuer) => {
    if ((iat + ACCESS_TOKEN_EXPIRES_IN) * 1000 >= Date.now() + (30000)) {
        throw ConflictException({ message: "current access token still valid" })
    }
    await createRevokeToken({
        userId: sub,
        jti,
        ttl: iat + REFRESH_TOKEN_EXPIRES_IN
    })
    return createLoginCredentials(user, issuer)
}