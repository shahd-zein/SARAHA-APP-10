import jwt from "jsonwebtoken";
import {
  encrypt,
  ConflictException,
  NotFoundException,
  generateHash,
  compareHash,
  BadRequestException,
  sendEmail,
  emailTemplate,
  emailEvent
} from "../../common/utils/index.js";

import { UserModel, findOne, createOne } from "../../DB/index.js";
import { EmailEnum, ProviderEnum } from "../../common/enums/index.js";
import { OAuth2Client } from "google-auth-library";
import { createLoginCredentials } from "../../common/utils/index.js";
import { blockOtpKey, deleteKey, get, incr, keys, maxAttemptOtpKey, otpKey, set, ttl } from "../../common/services/redis.service.js";
import { createNumberOtp } from "../../common/utils/index.js";

/* =========================
  SEND EMAIL OTP 
========================= */
const sendEmailOtp = async ({email, subject, title}={})=>{
    const isBlockedTTL = await ttl(blockOtpKey({ email, subject }))
  if (isBlockedTTL > 0) {
    throw BadRequestException({ message: `sorry we can't request new OTP while you are blocked, please try again after${isBlockedTTL}` })
  }

  const reminingOtpTTL = await ttl(otpKey({ email, subject }))
  if (reminingOtpTTL > 0) {
    throw BadRequestException({ message: `sorry we can't request new OTP while current OTP still active, please try again after${reminingOtpTTL}` })
  }

  const maxTrail = await get(maxAttemptOtpKey({ email, subject }))
  if (maxTrail >= 3) {
    await set({
      key: blockOtpKey({ email, subject }),
      value: 1,
      ttl: 7 * 60
    })
    throw BadRequestException({message:`you have reached the max trial`})
  }
  const code = await createNumberOtp()
  await set({
    key: otpKey({ email, subject }),
    value: await generateHash({ plaintext: `${code}` }),
    ttl: 120
  })
  emailEvent.emit("sendEmail", async ()=>{
  await sendEmail({
    to: email,
    subject,
    html: emailTemplate({ code, title }),
  })
  await incr(maxAttemptOtpKey({ email, subject }))
})
}


/* =========================
  AUTHORIZATION MIDDLEWARE
========================= */
export const authorization = (accessRoles = []) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!accessRoles.includes(userRole)) {
        throw ConflictException({ message: "Not authorized account" });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/* =========================
        SIGNUP
========================= */
export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;

  const checkUserExist = await findOne({
    model: UserModel,
    filter: { email },
    select: "email",
    options: { lean: true }
  });

  if (checkUserExist) {
    throw ConflictException({ message: "Email Exists" });
  }

  const user = await createOne({
    model: UserModel,
    data: {
      username,
      email,
      password: await generateHash({ plaintext: password }),
      phone: await encrypt(phone)
    }
  });

  await sendEmailOtp({email, subject:EmailEnum.ConfirmEmail, title:"verify Email"})
  return user;
};

/* =========================
        CONFIRMEMAIL
========================= */
export const confirmEmail = async (inputs) => {
  const { email, otp } = inputs;

  const hashOtp = await get(otpKey({email, subject:EmailEnum.ConfirmEmail}))
  if (!hashOtp) {
    throw NotFoundException({ message: "Otp Not found" })
  }

  const account = await findOne({
    model: UserModel,
    filter: { email, confirmEmail: { $exists: false }, provider: ProviderEnum.System }
  });
  if (!account) {
    throw NotFoundException({ message: "Fail to find matching account" });
  }
  if (!await compareHash({ plaintext: otp, cipherText: hashOtp })) {
    throw NotFoundException({ message: "Otp Not found" })
  }
  account.confirmEmail = new Date();
  await account.save()

  await deleteKey(await keys(otpKey({email, subject:EmailEnum.ConfirmEmail})))
  return;
};

/* =========================
        RESEND CONFIRMEMAIL
========================= */
export const resendConfirmEmail = async (inputs) => {
  const { email } = inputs;

  const account = await findOne({
    model: UserModel,
    filter: { email, confirmEmail: { $exists: false }, provider: ProviderEnum.System }
  });

  if (!account) {
    throw NotFoundException({ message: "Fail to find matching account" });
  }

  await sendEmailOtp({email, subject: EmailEnum.ConfirmEmail, title: "Verify Email"})
  return;
};

/* =========================
        LOGIN
========================= */
export const login = async (inputs, issuer) => {
  const { email, password } = inputs;

  const user = await findOne({
    model: UserModel,
    filter: { email, provider: ProviderEnum.System, confirmEmail: { $exists: true } },
    option: {
      lean: true
    }
  });

  if (!user) {
    throw NotFoundException({ message: "Invalid Login credentials" });
  }

  const isValid = await compareHash({
    plaintext: password,
    cipherText: user.password
  });

  if (!isValid) {
    throw NotFoundException({ message: "Invalid login credentials" });
  }

  const tokens = await createLoginCredentials(user, issuer);
  return tokens;
};

/* =========================
  GOOGLE VERIFY FUNCTION
========================= */
const verifyGoogleAccount = async (idToken) => {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: "607120472331-be6947da1f7cj0a1kkcqo4737coodjdt.apps.googleusercontent.com"
  });

  const payload = ticket.getPayload();

  if (!payload?.email_verified) {
    throw BadRequestException({ message: "Fail to verify by google" });
  }

  return payload;
};

/* =========================
  GOOGLE LOGIN
========================= */
export const loginWithGmail = async (idToken, issuer) => {
  const payload = await verifyGoogleAccount(idToken);

  const user = await findOne({
    model: UserModel,
    filter: {
      email: payload.email,
      provider: ProviderEnum.Google
    }
  });

  if (!user) {
    throw NotFoundException({ message: "Not registered account" });
  }

  return await createLoginCredentials(user, issuer)
};

/* =========================
  GOOGLE SIGNUP
========================= */
export const signupWithGmail = async (idToken, issuer) => {
  const payload = await verifyGoogleAccount(idToken);

  const checkExist = await findOne({
    model: UserModel,
    filter: { email: payload.email }
  });

  if (checkExist) {
    if (checkExist.provider !== ProviderEnum.Google) {
      throw ConflictException({ message: "Invalid login provider" });
    }

    return {
      status: 200,
      credentials: await loginWithGmail(idToken, issuer)
    };
  }

  const user = await createOne({
    model: UserModel,
    data: {
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      profilePicture: payload.picture,
      confirmEmail: new Date(),
      provider: ProviderEnum.Google
    }
  });

  return {
    status: 201,
    credentials: await createLoginCredentials(user, issuer)
  };
};