import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const missing = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"].filter(
  (key) => !process.env[key],
);
if (missing.length) {
  throw new Error(
    `Missing required database environment variables: ${missing.join(", ")}`,
  );
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});
