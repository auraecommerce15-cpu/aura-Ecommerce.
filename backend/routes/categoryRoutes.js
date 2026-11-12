import express from "express";
import {
    getCategories,
    createCategory,
    deleteCategory
} from "../controllers/categoryController.js";
import { isAuthenticated, isAdmin } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/")
    .get(getCategories)
    .post(isAuthenticated, isAdmin, createCategory);

router.route("/:id")
    .delete(isAuthenticated, isAdmin, deleteCategory);

export default router;
