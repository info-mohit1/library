import { Router, type IRouter } from "express";
import healthRouter from "./health";
import booksRouter from "./books";
import borrowsRouter from "./borrows";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(booksRouter);
router.use(borrowsRouter);
router.use(usersRouter);

export default router;
