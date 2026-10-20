import { SequelizeAuto, type AutoOptions } from 'sequelize-auto';
import config from './src/config/config.js';

const { database } = config;

const options: AutoOptions = {
    host: database.host,
    dialect: 'mysql',
    directory: './src/models', // where to write files
    port: database.port,
    caseModel: 'u', // convert snake_case column names to camelCase field names: user_id -> userId
    caseFile: 'o', // file names created for each model use camelCase.js not snake_case.js
    singularize: false, // convert plural table names to singular model names
    useDefine: true, // use `init` for model initialization (required by AutoOptions)
    additional: {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        // ...options added to each model
    },
    lang: 'ts',
    tables: ['users', 'chats', 'chat_members'], // use all tables, if omitted
};

const auto = new SequelizeAuto(database.name, database.user, database.password, options);

auto
    .run()
    .then(() => {
        console.log('Models generated successfully in ./src/models');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed to generate models:', error);
        process.exit(1);
    });
