import {createClient} from 'redis';
import { REDIS_URI } from '../../config/config.service.js';

export const redisClient = createClient({
    url:REDIS_URI
})
export const connctRedis = async()=>{
    try {
        await redisClient.connect()
        console.log(`REDIS_BD conncted`);
        
    } catch (error) {
        console.log(`Fail to connect on REDIS_DB ${error}`);
        
    }
}