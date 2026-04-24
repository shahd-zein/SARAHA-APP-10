// import { query } from "express";
import joi from "joi";
import { generalValidationFields } from "../../common/utils/validation.js";

// LOGIN SCHEMA
export const login = {
    body: joi.object({
        email: generalValidationFields.email.required(),

        password:generalValidationFields.password.required(),
}).required()
}
// SIGNUP SCHEMA
export const signup = {
    body: login.body.append().keys({
        username: generalValidationFields.username.required(),  
        phone: generalValidationFields.phone.required(),
        confirmPassword: generalValidationFields.confirmPassword("password").required(),

    }).required(),

}




