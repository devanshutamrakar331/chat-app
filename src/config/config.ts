import dotenv from "dotenv";

dotenv.config();

// Ensure a required env
const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const config = {
  port: Number(process.env.PORT ?? 3000),
  database: {
    user: requireEnv("DATABASE_USER"),
    name: requireEnv("DATABASE_NAME"),
    host: requireEnv("DATABASE_HOST"),
    port: Number(process.env.DATABASE_PORT ?? 3306),
    password: requireEnv("DATABASE_PASSWORD"),
  },
  firebase_project_id: requireEnv("FIREBASE_PROJECT_ID"),
  jwt_secret: requireEnv("JWT_SECRET"),
};

export default config;
