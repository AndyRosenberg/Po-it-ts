import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth-routes.js';
import poemRoutes from './routes/poem-routes.js';
import userRoutes from './routes/user-routes.js';
import commentRoutes from './routes/comment-routes.js';
import notificationRoutes from './routes/notification-routes.js';
import followsRoutes from './routes/follows-routes.js';
import collectionRoutes from './routes/collection-routes.js';
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
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/follows", followsRoutes);
app.use("/api", collectionRoutes);
app.use("/api", poemRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
