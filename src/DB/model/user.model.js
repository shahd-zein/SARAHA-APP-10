import mongoose, { Schema, model } from "mongoose";


const userSchema = new Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true,
        min:18,
        max:60
    },

},{
    strict: false
})
export const UserModel =mongoose.models.User || model('User', userSchema)