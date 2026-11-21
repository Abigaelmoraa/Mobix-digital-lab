import "dotenv/config";
import mysql from "mysql2/promise";

const database = process.env.DB_NAME || "mobix_digital_lab";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function checkConnection() {
  await query("SELECT 1");
}
