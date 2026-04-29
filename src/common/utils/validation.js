import joi from "joi";
import { Types } from "mongoose";
import { validation } from "../../middlewere/validation.middleware.js";

export const generalValidationFields = {
    email: joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 3,
        tlds: { allow: ["com", "net"] }
    }),

    password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/),
    otp:joi.string().pattern(new RegExp(/^\d{6}$/)),
    username: joi.string().pattern(/^[A-Za-z]{2,25}\s[A-Za-z]{2,25}$/).messages({
        "any.required": "username is required",
        "string.empty": "username cannot be empty"
    }),

    phone: joi.string().pattern(/^(?:\+?20|0)?1[0125][0-9]{8}$/),

    confirmPassword: function (path = "password") {
        return joi.string().valid(joi.ref(path));
    },

    id: joi.string().custom((value, helper) => {
        return Types.ObjectId.isValid(value)
            ? true
            : helper.message("Invalid object id");
    }).required(),

    file: function (validation = []) {
        return joi.object({
            fieldname: joi.string().required(),
            originalname: joi.string().required(),
            encoding: joi.string().required(),
            "mimetype": joi.string().valid(...Object.values(validation)).required(),
            finalPath: joi.string().required(),
            destination: joi.string().required(),
            filename: joi.string().required(),
            path: joi.string().required(),
            size: joi.number().required(),
        });
    }
};