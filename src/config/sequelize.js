const timezone = process.env.TZ || 'UTC';
process.env.TZ = timezone;

module.exports = {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    logging: ['verbose', 'debug', 'silly'].includes(process.env.LOG_LEVEL),
    pool: {
        max: 50,
        min: 5,
        idle: 20000,
        acquire: 60000,
        evict: 60000,
    },
    dialect: 'postgres',
    timezone,
};
