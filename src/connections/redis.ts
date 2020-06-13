import Redis from "ioredis";

const redis = new Redis({
    host: "meoclock_redis", // Redis host
    family: 4, // 4 (IPv4) or 6 (IPv6)
    password: process.env.REDIS_PASS,
    db: 0,
});

export default redis