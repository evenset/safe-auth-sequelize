import {promisify} from 'util';
import path from 'path';
import uuid from 'uuid';
import {Sequelize} from 'sequelize';
import Umzug from 'umzug';
import {exec} from 'child_process';

import generateModels, {ReturnType} from '..';

export default (): ReturnType => {
    const context: ReturnType = {} as unknown as ReturnType;
    let database: string;
    let sequelize: Sequelize;
    const timezone = process.env.TZ || 'UTC';
    process.env.TZ = timezone;

    const config = {
        host: process.env.POSTGRES_HOST,
        port: Number.parseInt(process.env.POSTGRES_PORT!),
        database: process.env.POSTGRES_DATABASE,
        username: process.env.POSTGRES_USER!,
        password: process.env.POSTGRES_PASSWORD,
        logging: ['verbose', 'debug', 'silly']
            .includes(process.env.LOG_LEVEL!),
        pool: {
            max: 50,
            min: 5,
            idle: 20000,
            acquire: 60000,
            evict: 60000,
        },
        dialect: 'postgres' as 'postgres',
        timezone,
    };
    beforeEach(async (): Promise<void> => {
        const id = uuid.v4().replace(/-/g, '');
        database = `${config.database}_${id}`;
        await promisify(exec)(
            'node_modules/.bin/sequelize db:create',
            {env: {...process.env, POSTGRES_DATABASE: database}},
        );
        sequelize = new Sequelize(
            database,
            config.username,
            config.password,
            config,
        );
        const models = generateModels(sequelize);
        context.SequelizeUser = models.SequelizeUser;
        context.SequelizeAccessToken = models.SequelizeAccessToken;

        const umzug = new Umzug({
            storage: 'sequelize',
            storageOptions: {sequelize},
            migrations: {
                params: [
                    sequelize.getQueryInterface(),
                    Sequelize,
                ],
                path: path.join(__dirname, '../migrations'),
            },
        });

        await umzug.up();
    });

    afterEach(async (): Promise<void> => {
        await sequelize.close();
        await promisify(exec)(
            'node_modules/.bin/sequelize db:drop',
            {env: {...process.env, POSTGRES_DATABASE: database}},
        );
    });
    return context;
};
