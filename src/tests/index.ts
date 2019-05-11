import {promisify} from 'util';
import path from 'path';
import uuid from 'uuid';
import {Sequelize} from 'sequelize';
import Umzug from 'umzug';
import {exec} from 'child_process';

export interface ReturnType {
    sequelize: Sequelize;
}

export default (): ReturnType => {
    const context: ReturnType = {sequelize: undefined as unknown as Sequelize};
    let database: string;
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
        context.sequelize = new Sequelize(
            database,
            config.username,
            config.password,
            config,
        );
        const umzug = new Umzug({
            storage: 'sequelize',
            storageOptions: {sequelize: context.sequelize},
            migrations: {
                params: [
                    context.sequelize.getQueryInterface(),
                    Sequelize,
                ],
                path: path.join(__dirname, '../migrations'),
            },
        });

        await umzug.up();
    });

    afterEach(async (): Promise<void> => {
        await context.sequelize!.close();
        await promisify(exec)(
            'node_modules/.bin/sequelize db:drop',
            {env: {...process.env, POSTGRES_DATABASE: database}},
        );
    });
    return context;
};
