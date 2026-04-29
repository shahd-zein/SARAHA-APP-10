// import { query } from "express";
import joi from "joi";
import { generalValidationFields } from "../../common/utils/validation.js";

// LOGIN SCHEMA
export const login = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
        password:generalValidationFields.password.required(),
}).required()
}
// SIGNUP SCHEMA
export const signup = {
    body: login.body.append({
        username: generalValidationFields.username.required(),  
        phone: generalValidationFields.phone.required(),
        confirmPassword: generalValidationFields.confirmPassword("password").required(),
    }).required(),

}

//RESEND CONFIRMEMAIL
export const resendConfirmEmail = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),  
    }).required(),
}

// CONFIRM EMAIL
export const confirmEmail = {
    body: resendConfirmEmail.body.append({
        otp:generalValidationFields.otp.required()
    }).required(),
}


