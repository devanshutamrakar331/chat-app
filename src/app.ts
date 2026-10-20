import express from "express";
import morgan from "morgan";
import commonModules from "./config/index.js";
const { dbConnection, firebaseConnection, config } = commonModules;
import indexRoutes from "./routes/index.routes.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', indexRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        await dbConnection();
        await firebaseConnection();
        app.listen(config.port, () => {
            console.log(`SERVER RUNNING AT PORT : ${config.port}`)
        })
    } catch (error) {
        console.log(error)
    }
}

startServer();
