import "dotenv/config";
import express from "express";
import { routes, sheetsRouter } from "@/routes/index";

const { PORT } = process.env;
const server = express();

server.use(express.json());

server.listen(PORT, () =>
  console.log(`🚀Sever is running on port ${PORT}🚀\nhttp://127.0.0.1:${PORT}`)
);

server.use("/", routes);
server.use("/sheets", sheetsRouter);
