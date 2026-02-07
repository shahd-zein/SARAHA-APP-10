import { SALT_ROUND } from "../../../config/config.service.js";
import { UserModel, findOne } from "../../DB/index.js"
import { conflictException, NotFound } from "../../common/utils/index.js";
import { hash, compare } from 'bcrypt'
import { encrypt,decrypt } from "../../common/utils/security/encryption.security.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET

export const signup = async (inputs) => {  
  const { name, email, password, phone, age } = inputs
    
  const checkUserExist = await findOne({
    model: UserModel,
    filter: { email }
  });
  if (checkUserExist) {
    throw conflictException({ message: "Email already exist", status: 409 })
  }

  const user = await UserModel.create({ 
      name,
      email,
      password: await hash(password, SALT_ROUND),
      phone: await encrypt(phone), 
      age  
  })
  return user
}


export const login = async (inputs) => {
  const { email, password } = inputs
  const user = await findOne({
    model: UserModel,
    filter: { email }    
    });
  if (!user) {
    throw NotFound({ message: "Invalid login credentials" })
  }

   if (! await compare(password, user.password)) {
    throw NotFound({ message: "Invalid login credentials" })
  }
  user.phone = await decrypt(user.phone);

  const token = jwt.sign(
    {usrId: user._id},
    JWT_SECRET,
    {expiresIn: '1h'}
  );

  return {user, token}
}


export const updateUser = async (userId, inputs) => {
  const { name, email, phone, age } = inputs;

  if (email) {
    const existingUser = await findOne({ model: UserModel, filter: { email } });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw conflictException({ message: "Email already exist", status: 409 });
    }
  }

  const updatedData = {
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone: await encrypt(phone) }),
    ...(age && { age })
  };

  const updatedUser = await UserModel.findByIdAndUpdate(userId, updatedData, { new: true });
  if (!updatedUser) throw NotFound({ message: "User not found" });

  if (updatedUser.phone) {
    updatedUser.phone = await decrypt(updatedUser.phone);
  }
      return updatedUser
}

export const deleteUser = async (userId) => {
  const deletedUser = await UserModel.findByIdAndDelete(userId);
  if (!deletedUser) throw NotFound({ message: "User not found" });
  return deletedUser;
}

export const getUser = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) throw NotFound({ message: "User not found" });
  
  if (user.phone) {
    user.phone = await decrypt(user.phone);
  }
  return user;
}

