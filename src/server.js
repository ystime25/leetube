import express from "express";
import morgan from "morgan";
import session from "express-session";
import Mongostore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import {localsMiddleware} from "./middlewares";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({extended: true}));

app.use(
    session({
        secret: "Hello!",
        resave: true,
        saveUninitialized: true,
        store: Mongostore.create({ mongoUrl: "mongodb://127.0.0.1:27017/leetube"})
    })
);

app.use(localsMiddleware);
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
