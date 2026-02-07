import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";
import { UserModel } from "./model/user.model.js";
// export const NoteModel = model("notes", noteSchema);





export const authenticateDB = async()=>{
    try{

        await mongoose.connect(DB_URI, {serverSelectionTimeoutMS: 3000});
        await UserModel.syncIndexes();
        console.log("DB Name:", mongoose.connection.db.databaseName);

        console.log(`DB connected successfully`);
        
    } catch(error) {
        console.log(`Fail to connect on DB ${error}`);
        
    }
} 