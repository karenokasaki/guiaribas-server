import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";

import connect from "./config/db.config.js";

import userRouter from "./routes/user.routes.js";
import serviceRouter from "./routes/service.routes.js";
import commentRoute from "./routes/comment.routes.js";
import searchRoute from "./routes/search.routes.js";

const app = express();
app.use(express.json());

//app.use(cors({ origin: process.env.REACT_APP_URL }));
app.use(cors({ origin: "*" }));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/service", serviceRouter);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/search", searchRoute);

/* 

app.use("/upload", uploadRouter);

app.use("/resetPassword", resetPasswordRouter); 
*/

connect().then(() => {
  app.listen(Number(process.env.PORT), () => {
    console.log(`Server up and ruining at - port: ${process.env.PORT}`);
  });
});
