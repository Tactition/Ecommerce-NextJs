import "server-only";
import mysql, { type Pool } from "mysql2/promise";

const globalForDb = globalThis as unknown as {
  mysqlPool: Pool | undefined;
};

const pool =
  globalForDb.mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3308),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce",
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    queueLimit: 0,
    charset: "utf8mb4",
    ssl:
      process.env.DB_SSL === "true"
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  });

globalForDb.mysqlPool = pool;

export default pool;
