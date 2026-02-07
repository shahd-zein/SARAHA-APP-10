import { resolve } from 'node:path'
import { config } from 'dotenv'

export const NODE_ENV = process.env.NODE_ENV || 'development'

const envPath = {
  development: '.env.development',
  production: '.env.production',
}

const envFile = envPath[NODE_ENV]

console.log({ NODE_ENV, envFile })

config({
  path: resolve(`./config/${envFile}`)
})
console.log("DB_URI:", process.env.DB_URI);


export const port = process.env.PORT ?? 7000
export const DB_URI = process.env.DB_URI
export const ENC_BYTE = process.env.ENC_BYTE

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')

console.log({ SALT_ROUND })
