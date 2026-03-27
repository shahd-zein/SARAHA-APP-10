import { Router } from "express";
import { profile, rotateToken } from "./user.service.js";
import { successResponse } from "../../common/utils/index.js";
import {authentication} from "../../middleware/authentication.middleware.js"
import { tokenTypeEnum } from "../../common/enums/security.enum.js"
import {endpoint} from "./user.authorization.js"

const router=Router()

router.get("/" ,
    authentication(),
    // authorization(endpoint.profile),
    async (req,res,next)=>{
    const account  = await  profile(req.user)    
    return successResponse({res, data:{account}})
})

router.get("/rotate-token" ,
    authentication(tokenTypeEnum.Refresh),
    async (req,res,next)=>{
    const credentials  = await  rotateToken(req.user,`${req.protocol}://{req.host}` )
    
    return successResponse({res, data:{credentials}})
})



export default router
