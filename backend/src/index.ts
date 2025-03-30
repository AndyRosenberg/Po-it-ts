import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth-routes.js';
import poemRoutes from './routes/poem-routes.js';
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

const corsOptions = {
  credentials: true,
  origin: process.env.TRUSTED_ORIGIN
};

app.use(cors(corsOptions));
app.use("/api/auth", authRoutes);
app.use("/api", poemRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
