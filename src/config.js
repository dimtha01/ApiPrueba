import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 3000;
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_DATABASE = process.env.DB_DATABASE || "proyecto_valesco"
export const DB_PORT = process.env.DB_PORT || 3306;
export const JWT_SECRET = "6eafa26b974aab4fc374b776435857f559a3396a29c9ac42a4d42d557b6c22ff"
export const JWT_EXPIRES_IN = "1d"
