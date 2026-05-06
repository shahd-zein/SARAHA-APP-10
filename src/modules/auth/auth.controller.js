import { Router } from 'express'
import { signup, login, signupWithGmail, confirmEmail, resendConfirmEmail, requestForgotPasswordOtp, verifyForgotPasswordOtp, resetForgotPasswordOtp } from './auth.service.js';
import { BadRequestException, successResponse } from '../../common/utils/index.js';
import * as validators from "./auth.validation.js"
import { validation } from '../../middlewere/validation.middleware.js';
import geoip from 'geoip-lite';
import rateLimiter from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';
import { redisClient } from '../../DB/index.js';
import { deleteKey } from '../../common/services/redis.service.js';

const router = Router();
const loginLimiter = rateLimiter({
  windowMs: 2 * 60 * 1000,
  limit: async function (req) {
    // const { country_code } = await fromWhere(req.ip) || {}
    // console.log({country_code});
    console.log(geoip.lookup(req.ip));
    const { country } = geoip.lookup(req.ip) || {}

    return country == "EG" ? 5 : 0
  },
  legacyHeaders: true,
  standardHeaders: 'draft-8',
  requestPropertyName: 'rateLimit',
  skipSuccessfulRequests: true,
  handler: (req, res, next, options) => {
    return res.status(429).json({ message: "Too many login attempts. Please try again later." });
  },
  keyGenerator: (req, res, next) => {

    const ip = ipKeyGenerator(req.ip, 56)
    console.log(`${ip}-${req.path}`);
    return `${ip}-${req.path}`;
  },
  store: {
    async incr(key, cb) { // get called by keyGenerator
      try {
        const count = await redisClient.incr(key);
        if (count === 1) await redisClient.expire(key, 120); // 2 min TTL
        cb(null, count);
      } catch (err) {
        cb(err);
      }
    },

    async decrement(key) {  // called by kipFailedRequests:true ,  skipSuccessfulRequests:true,
      await redisClient.decr(key);
    },
  },
});

router.post("/login", loginLimiter, validation(validators.login), async (req, res, next) => {

  const credentials = await login(req.body, `${req.protocol}://${req.host}`)
  await deleteKey(`${req.ip}-${req.path}`)
  return successResponse({ res, data: { ...credentials } })
})






router.post("/signup", validation(validators.signup),
  async (req, res, next) => {

    const account = await signup(req.body)
    return successResponse({ res, status: 201, data: { account } })

  })

router.patch("/resend-confirm-email",
  validation(validators.resendConfirmEmail),
  async (req, res, next) => {
    await resendConfirmEmail(req.body)
    return successResponse({ res })
  })

router.post("/request-forgot-password-code",
  validation(validators.resendConfirmEmail),
  async (req, res, next) => {
    await requestForgotPasswordOtp(req.body)
    return successResponse({ res })
  })

router.patch("/verify-forgot-password-code",
  validation(validators.confirmEmail),
  async (req, res, next) => {
    await verifyForgotPasswordOtp(req.body)
    return successResponse({ res })
  })

router.patch("/reset-forgot-password-code",
  validation(validators.resetForgotPasswordCode),
  async (req, res, next) => {
    await resetForgotPasswordOtp(req.body)
    return successResponse({ res })
  })




router.patch("/confirm-email", validation(validators.confirmEmail),
  async (req, res, next) => {

    const account = await confirmEmail(req.body)


    return successResponse({ res })

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