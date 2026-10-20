import { dbConnection, models, sequelize } from "./database.js";
import { firebaseConnection, firebaseDb } from "./firebase.js";
import config from "./config.js";

const commonModules = {
  models,
  sequelize,
  dbConnection,
  firebaseConnection,
  firebaseDb,
  config,
};

export default commonModules;
