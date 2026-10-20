import { Sequelize } from "sequelize";
import config from "./config.js";
import { initModels } from "../models/init-models.js";

const { database } = config;

const sequelize = new Sequelize(database.name,database.user,database.password, {
    logging: false,
    port: database.port,
    host: database.host,
    dialect : 'mysql',
});

const models = initModels(sequelize);

const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("DATABASE CONNECTED SUCCESSFULLY")        
    } catch (error) {
        console.log("DATABASE CONNECTION FAILED", error)
    }
}

export { dbConnection, sequelize, models } ;