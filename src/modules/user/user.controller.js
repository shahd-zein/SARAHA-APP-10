import { Router } from "express";
import { logout,  profile, profileImage, rotateToken, coverPicture } from "./user.service.js";
import { successResponse } from "../../common/utils/index.js";
import { authentication } from "../../middlewere/auth.middlewere.js";
import { tokenTypeEnum } from "../../common/enums/security.enum.js"
import { endpoint } from "./user.authorization.js"
import { shareProfile } from "./user.service.js";
import * as validators from "./user.validation.js"
import { validation } from "../../middlewere/validation.middleware.js";
import { fileFieldValidation, localFileUpload } from "../../common/utils/multer/index.js";
const router = Router()

router.post("/logout", authentication(), async(req, res, next)=>{
    const status = await logout(req.body, req.user, req.decoded)
    return successResponse({res, status})
})

router.patch(
    "/profile-image",
    authentication(),
    localFileUpload({
        custumPath: "user/profile",
        validation: fileFieldValidation.image,
        maxSize: 10
    }).single("attachment"),
    validation(validators.profileImage),
    async (req, res, next) => {
        const account = await profileImage(req.file, req.user);
        return successResponse({ res, data: { account } });
    }
);

router.patch(
    "/profile-cover-image",
    authentication(),
    localFileUpload
        ({
            custumPath: 'user/profile/cover',
            validation: fileFieldValidation.image,
            maxSize: 5
        }).array("attachment", 5),
    validation(validators.coverPicture),

    async (req, res, next) => {
        const account = await coverPicture(req.files, req.user)
        return successResponse({ res, data: { account } });
    });


router.get("/",
    authentication(),
    // authorization(endpoint.profile),
    async (req, res, next) => {
        const account = await profile(req.user)
        return successResponse({ res, data: { account } })
    })

router.get("/:userId/share-profile",
    validation(validators.shareProfile),
    async (req, res, next) => {
        const account = await shareProfile(req.params.userId)
        return successResponse({ res, data: { account } })
    })

router.post("/rotate-token",
    authentication(tokenTypeEnum.Refresh),
    async (req, res, next) => {
        const credentials = await rotateToken(req.user, req.decoded,`${req.protocol}://{req.host}`)

        return successResponse({ res, status:201, data:{...credentials}})
    })



export default router