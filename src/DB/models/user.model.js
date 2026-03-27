import mongoose, { Schema, model } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum} from "../../common/enums/index.js";


const userSchema = new mongoose.Schema({

    firstName:{
        type:String,
        required:true,
        minLength:[2, `first name can't be less than tow char but you have entered a {VALUE}`],
        maxLength:25,
        trim:true
    },
    lastName:{
        type:String,
        required:true,
        minLength:2,
        maxLength:25,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required: function(){
            return this.provider == ProviderEnum.System
        }
    },
    phone: String,

    gender:{
        type: Number,
        enum: Object.values(GenderEnum),
        default:GenderEnum.Male
    },

    profilePicture:String,
    coverPicture:[String],
    provider:{
        type: Number,
        enum: Object.values(ProviderEnum),
        default:ProviderEnum.System,
    },
    role:{
        type: Number,
        enum: Object.values(RoleEnum),
        default:RoleEnum.User
    },
    confirmEmail: Date,
    changeCredentialsTime: Date,
    profilePicture: String,
    coverPicture:  [String],
    address: String,

},{
    timeStamp: true,
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true,
    autoIndex:true,
    toJSON:{virtual: true},
    toObject:{virtuals:true},
})



userSchema.virtual("username").set(function(value){
    const [firstName, lastName] = value.split(' ') || [];
    this.set({firstName, lastName})
}).get(function(){
    return this.firstName + " " + this.lastName;
})


export const UserModel = mongoose.models.User || model('User', userSchema) 