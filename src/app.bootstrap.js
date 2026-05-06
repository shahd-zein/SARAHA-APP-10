import { ORIGINS, port } from '../config/config.service.js'
import { connctRedis, connectDB, redisClient } from './DB/index.js'
import { authRouter, messageRouter, userRouter } from './modules/index.js'
import { globalErrorHandling, sendEmail } from './common/utils/index.js'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { resolve } from "node:path";
import { log } from 'node:console'
import rateLimiter, { ipKeyGenerator } from 'express-rate-limit'
import axios from 'axios'
import geoip from 'geoip-lite'
async function bootstrap() {
    const app = express()
    const fromWhere = async (ip) => {
        try {
            const response = await axios.get(`https://ipapi.co/${ip}/json`);
            console.log(response.data);
            return response.data
        } catch (error) {
            console.error(error);
        }
    }


    //convert buffer data
    // var corsOptions = {
    //     origin: function (origin, callback) {
    //         if (!ORIGINS.includes(origin)) {
    //             callback(new Error('Not allowed by CORS', { cause: { status: 403 } }), ORIGINS)
    //         } else {
    //             callback(null, ORIGINS)
    //         }

    //     }
    // }

    const limiter = rateLimiter({
        windowMs: 2 * 60 * 1000,
        limit: async function (req) {
            // const { country_code } = await fromWhere(req.ip) || {}
            // console.log({country_code});
            console.log(geoip.lookup(req.ip));
            const { country } = geoip.lookup(req.ip) || {}

            return country == "EG" ? 5 : 0
        }
        ,



        standardHeaders: 'draft-8',
        keyGenerator: (req) => {
            console.log(req.headers['x-forwarded-for']);



            const ip = ipKeyGenerator(req.ip, 56)
            console.log(`${ip}-${req.path}`);

            return `${ip}-${req.path}`;
        },
        store: {
            async incr(key, cb) { // get called by keyGenerator
                try {
                    const count = await redisClient.incr(key);
                    if (count === 1) await redisClient.expire(key, 120); // 2 min TTL
                    cb(null, count);
                } catch (err) {
                    cb(err);
                }
            },

            async decrement(key) {  // called by kipFailedRequests:true ,  skipSuccessfulRequests:true,
                await redisClient.decr(key);
            },
        },
    });

    app.set('trust proxy', true)
    app.use(cors(), helmet(), limiter, express.json())
    app.use("/uploads", express.static(resolve("../uploads")))
    //DB
    await connectDB()
    await connctRedis()
    //application routing
    app.get('/', async (req, res) => {
        console.log(await fromWhere(req.ip));
        res.send('Hello World!')
    })

    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    app.use('/message', messageRouter)
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