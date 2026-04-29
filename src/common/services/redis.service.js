import { redisClient } from "../../DB/index.js"
import { login } from "../../modules/auth/auth.service.js"
import { EmailEnum } from "../enums/email.enum.js";

export const otpKey = ({ email, subject = EmailEnum.ConfirmEmail }) => {
    return `OTP::User::${email}::${subject}`;
};

export const maxAttemptOtpKey = ({ email, subject = EmailEnum.ConfirmEmail }) => {
    return `${otpKey({ email, subject })}::MaxTrial`;
};

export const blockOtpKey = ({ email, subject = EmailEnum.ConfirmEmail  }) => {
    return `${otpKey({ email, subject })}::Block`;
};
export const baseRevokeTokenKey = (userId) => {
    return `RevokeToken::${userId}`;
};

export const revokeTokenKey = ({ userId, jti }) => {
    return `${baseRevokeTokenKey(userId)}::${jti}`;
};





export const set = async ({
    key,
    value,
    ttl
} = {}) => {
    try {
        let data = typeof value === 'string' ? value : JSON.stringify(value)
        return ttl ? await redisClient.set(key, data, { EX: ttl }) : await redisClient.set(key, data)
    return await redisClient.set(key, data);
    } catch (error) {
        console.error(`Redis SET failed ${error}`);
        throw new Error("Redis unavailable");
    }
}

export const update = async ({
    key,
    value,
    ttl
} = {}) => {
    try {
        if (!await redisClient.EXISTS(key)) return 0;
        return await set({ key, value, ttl })

    } catch (error) {
        console.log(`Fail in redis update operation ${error} `);

    }
}

export const get = async (key) => {
    try {
        let data = await redisClient.get(key);
        try {
            return JSON.parse(data)
        } catch (error) {
            return data
        }
    } catch (error) {
        console.log(`Fail in redis get operation ${error} `);
    }
}

export const ttl = async (key) => {
    try {
        return await redisClient.ttl(key)
    } catch (error) {
        console.log(`Fail in redis ttl operation ${error} `);

    }
}

export const exists = async (key) => {
    try {
        return await redisClient.exists(key)
    } catch (error) {
        console.log(`Fail in redis exists operation ${error} `);
    }
}

export const incr = async (key) => {
    try {
        return await redisClient.incr(key)
    } catch (error) {
        console.log(`Fail in redis incr operation ${error} `);
    }
}

export const expire = async ({ key, ttl } = {}) => {
    try {
        return await redisClient.expire(key, ttl)
    } catch (error) {
        console.log(`Fail in redis add-expire ope ration ${error} `);

    }
}

export const mGet = async (keys = []) => {
    try {
        if (keys.length) return 0;
        return await redisClient.mGet(keys)
    } catch (error) {
        console.log(`Fail in redis mGet operation ${error} `);

    }
}

export const keys = async (prefix) => {
    try {
        return await redisClient.keys(`${prefix}*`)
    } catch (error) {
        console.log(`Fail in redis keys operation ${error} `);

    }
}

export const deleteKey = async (key) => {
    try {
        if (keys.length) return 0;
        return await redisClient.del(keys)
    } catch (error) {
        console.log(`Fail in redis dell operation ${error} `);

    }
}