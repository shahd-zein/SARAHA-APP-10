import { Router } from 'express'
import { signup, login, signupWithGmail } from './auth.service.js';
import { BadRequestException, successResponse } from '../../common/utils/index.js';
import * as validators from "./auth.validation.js"
import { validation } from '../../middlewere/validation.middleware.js';
const router = Router();

router.post("/signup", validation(validators.signup),
  async (req, res, next) => {

    const account = await signup(req.body)


    return successResponse({ res, status: 201, data: { account } })

  })


router.post("/login", validation(validators.login), async (req, res, next) => {

  const credentials = await login(req.body, `${req.protocol}://${req.host}`)
  return successResponse({ res, data: { credentials } })
})


router.post("/signup/gmail", async (req, res, next) => {
  console.log("BODY:", req.body);

  const { status, credentials } = await signupWithGmail(
    req.body.idToken,
    `${req.protocol}://${req.host}`
  );

  return successResponse({ res, status, data: { ...credentials } });
});


export default router