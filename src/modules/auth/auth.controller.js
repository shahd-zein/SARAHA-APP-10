import { Router } from 'express'
import { signup, login, signupWithGmail } from './auth.service.js';
import { successResponse } from "../../common/utils/index.js";
// import joi from 'joi'
const router = Router();

// const signupSchema = joi.object().keys({
//   username: joi.string().required(),
//   email: joi.string().email().required()
// }).required()



router.post("/signup", async (req, res, next) => {
  // const account = await (req.body)
  const account = await signup(req.body)
  return successResponse({ res, status: 201, data: { account } })

})


router.post("/login", async (req, res, next) => {
  console.log(`${req.protocol}://${req.host}`);

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