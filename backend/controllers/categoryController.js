import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const DEFAULT_CATEGORIES = [
    { name: "Laptops", description: "High-performance portable computers and ultrabooks" },
    { name: "Smartphones", description: "Next-gen flagship mobile devices and accessories" },
    { name: "Headphones", description: "Studio monitors, wireless audio, and active noise-cancelling gear" },
    { name: "Smartwatches", description: "Luxury connected timepieces and health wearables" },
    { name: "Accessories", description: "Premium tech essentials, chargers, cables, and peripherals" }
];

// @desc    Get all categories with product counts
// @route   GET /api/v1/category
// @access  Public
export const getCategories = async (req, res) => {
    try {
        // Fetch explicit category documents
        const savedCategories = await Category.find().sort({ name: 1 }).lean();

        // Fetch distinct categories currently used by products
        const productCategories = await Product.distinct("category");

        // Compute product count per category
        const productCounts = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        const countMap = {};
        productCounts.forEach((item) => {
            if (item._id) {
                countMap[item._id] = item.count;
            }
        });

        // Seed defaults into Category collection if completely empty
        if (savedCategories.length === 0) {
            try {
                await Category.insertMany(DEFAULT_CATEGORIES, { ordered: false });
            } catch {
                // Ignore duplicate errors during concurrent seed
            }
        }

        // Re-fetch saved categories after ensuring defaults
        const allSaved = await Category.find().sort({ name: 1 }).lean();

        // Build a unified dictionary indexed by lowercase name
        const categoryMap = new Map();

        // Add saved categories
        allSaved.forEach((cat) => {
            categoryMap.set(cat.name.toLowerCase(), {
                _id: cat._id,
                name: cat.name,
                description: cat.description || "",
                productCount: countMap[cat.name] || 0,
                createdAt: cat.createdAt
            });
        });

        // Also ensure any product categories not yet in Category model are included
        productCategories.forEach((catName) => {
            if (catName && !categoryMap.has(catName.toLowerCase())) {
                categoryMap.set(catName.toLowerCase(), {
                    _id: null,
                    name: catName,
                    description: "",
                    productCount: countMap[catName] || 0
                });
            }
        });

        const categories = Array.from(categoryMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new category
// @route   POST /api/v1/category
// @access  Private/Admin
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const trimmedName = name.trim();

        // Check if category already exists (case-insensitive with safe regex escaping)
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, "i") }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: `Category "${existingCategory.name}" already exists`
            });
        }

        const newCategory = await Category.create({
            name: trimmedName,
            description: description ? description.trim() : ""
        });

        return res.status(201).json({
            success: true,
            message: `Category "${newCategory.name}" created successfully`,
            category: newCategory
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/v1/category/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check if products still use this category
        const attachedProducts = await Product.countDocuments({ category: category.name });
        if (attachedProducts > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete "${category.name}" because ${attachedProducts} product(s) are still assigned to it. Reassign or delete those products first.`
            });
        }

        await Category.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: `Category "${category.name}" deleted successfully`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
