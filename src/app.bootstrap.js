import { NODE_ENV, port } from '../config/config.service.js'
import {authenticateDB} from './DB/index.js'   
import { authRouter, userRouter, noteRouter } from './modules/index.js'
import { globalErrorHandler } from './common/utils/index.js'
import express from 'express'

async function bootstrap() {
    const app = express()
    //convert buffer data
    app.use(express.json())

    //DB
    await authenticateDB()
    //application routing
    app.get('/', (req, res) => res.send('Hello World!'))
    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    app.use('/note', noteRouter)


//invalid routing
app.use((req, res) => {
    res.status(404).json({ message: "Invalid application routing" });
});


    //error-handling
    app.use(globalErrorHandler)
       
    
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}
export default bootstrap