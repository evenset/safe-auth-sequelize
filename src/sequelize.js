import {Sequelize} from 'sequelize';
import exec from require('child_process').exec;
import path from 'path';
import Umzug from 'umzug';
import uuid from 'uuid';

function initialize(config) {
    const db = {};
    let sequelize;
    if (config.use_env_variable) {
        sequelize = new Sequelize(process.env[config.use_env_variable], config);
    } else {
        sequelize = new Sequelize(
            config.database,
            config.username,
            config.password,
            config,
        );
    }

    const model = sequelize['import']('./index');
    console.log(model);
    db.sequelize = sequelize;

    Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    return db;
}


let moduleExports = {};

if (process.env.NODE_ENV === 'test') {
    moduleExports.prepare = (context, config) => {
        let sequelize;
        let database;

        beforeEach(async () => {
            database = `${config.database}_${uuid.v4().replace(/-/g, '')}`;
            await exec(
                'node_modules/.bin/sequelize db:create',
                {env: {...process.env, POSTGRES_DATABASE: database}},
            );
            const c = {
                ...config,
                database,
            };
            const db = initialize(c);
            for (const key in db) {
                context[key] = db[key];
            }
            sequelize = context.sequelize;

            const umzug = new Umzug({
                storage: 'sequelize',
                storageOptions: {
                    sequelize,
                },
                migrations: {
                    params: [
                        sequelize.getQueryInterface(),
                        Sequelize,
                    ],
                    path: path.join(__dirname, '../migrations'),
                },
            });

            context.create = (model, properties) => {
                return model.__proto__.create.bind(model)(properties);
            };

            await umzug.up();
        });

        afterEach(async () => {
            await sequelize.close();
            await exec(
                'node_modules/.bin/sequelize db:drop',
                {env: {...process.env, POSTGRES_DATABASE: database}},
            );
        });
    };
}
else {
    moduleExports = initialize;
}

export default moduleExports;
