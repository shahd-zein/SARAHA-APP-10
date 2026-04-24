import { port } from '../config/config.service.js'
import { connectDB } from './DB/index.js'
import { authRouter, userRouter } from './modules/index.js'
import { globalErrorHandling } from './common/utils/index.js'
import express from 'express'
import cors from 'cors'
import { resolve } from "node:path";

async function bootstrap() {
    const app = express()
    //convert buffer data
    app.use(cors(), express.json())

    //DB
    await connectDB()
    //application routing
    app.get('/', (req, res) => res.send('Hello World!'))
    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    app.use('/uploads', express.static(resolve("../uploads")))

    //invalid routing
    app.use((req, res) => {
        res.status(404).json({ message: "Invalid application routing" });
    });


    //error-handling
    app.use(globalErrorHandling)



    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
 }
export default bootstrap