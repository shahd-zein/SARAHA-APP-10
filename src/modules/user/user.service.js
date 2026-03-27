import jwt from 'jsonwebtoken'
import {createLoginCredentials} from "../../common/utils/index.js"

export const profile = async (user)=>{
    return user
}

export const rotateToken = async (user, issuer)=>{
    return createLoginCredentials(user, issuer)
}