import { Router } from "express";
import { profile } from "./user.service.js";
import { successResponse } from "../../common/utils/index.js";
const router=Router()

router.get("/:userId" , (req,res,next)=>{
    const result  = profile(req.params.userId)
    return successResponse({res, statusCode:200, data:{result}})
})
export default router