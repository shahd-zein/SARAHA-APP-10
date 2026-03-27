import jwt from "jsonwebtoken";
import {
  encrypt,
  ConflictException,
  NotFoundException,
  generateHash,
  compareHash,
  BadRequestException
} from "../../common/utils/index.js";

import { UserModel, findOne, createOne } from "../../DB/index.js";
import { ProviderEnum } from "../../common/enums/index.js";
import { OAuth2Client } from "google-auth-library";
import { createLoginCredentials } from "../../common/utils/index.js";
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

  return user;
};

/* =========================
        LOGIN
========================= */

export const login = async (inputs, issuer) => {
  const { email, password } = inputs;

  const user = await findOne({
    model: UserModel,
    filter: { email, provider:ProviderEnum.System },
    option:{
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


/*
{
    "iss": "https://accounts.google.com",
    "azp": "607120472331-be6947da1f7cj0a1kkcqo4737coodjdt.apps.googleusercontent.com",
    "aud": "607120472331-be6947da1f7cj0a1kkcqo4737coodjdt.apps.googleusercontent.com",
    "sub": "105335545176964410340",
    "email": "shahdzeinelabdein@gmail.com",
    "email_verified": true,
    "nbf": 1774564927,
    "name": "Shahd Zein",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocIfO80fjUKOMyGzscqi_Do41oVobd1B_4RjloPVVIGTOOO0hwle=s96-c",
    "given_name": "Shahd",
    "family_name": "Zein",
    "iat": 1774565227,
    "exp": 1774568827,
    "jti": "31d522e655de8ee2dcf3932f5516185a90e13c30"
} 
/*
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