import supabase from "../database/supabase.js";

const DEFAULT_CATEGORIES = [
    { name: "Laptops",      description: "High-performance portable computers and ultrabooks" },
    { name: "Smartphones",  description: "Next-gen flagship mobile devices and accessories" },
    { name: "Headphones",   description: "Studio monitors, wireless audio, and active noise-cancelling gear" },
    { name: "Smartwatches", description: "Luxury connected timepieces and health wearables" },
    { name: "Accessories",  description: "Premium tech essentials, chargers, cables, and peripherals" }
];

// ─────────────────────────────────────────────
// GET ALL CATEGORIES
// ─────────────────────────────────────────────
export const getCategories = async (req, res) => {
    try {
        // Seed defaults if empty
        const { data: existing } = await supabase.from('categories').select('id').limit(1);
        if (!existing || existing.length === 0) {
            await supabase.from('categories').upsert(DEFAULT_CATEGORIES, { onConflict: 'name' });
        }

        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw new Error(error.message);

        // Product count per category
        const { data: products } = await supabase.from('products').select('category');
        const countMap = {};
        (products || []).forEach(p => {
            if (p.category) {
                countMap[p.category] = (countMap[p.category] || 0) + 1;
            }
        });

        const result = categories.map(c => ({
            _id: c.id,
            name: c.name,
            description: c.description,
            productCount: countMap[c.name] || 0,
            createdAt: c.created_at
        }));

        return res.status(200).json({ success: true, count: result.length, categories: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// CREATE CATEGORY (Admin)
// ─────────────────────────────────────────────
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        const trimmedName = name.trim();

        // Check existing (case-insensitive)
        const { data: existing } = await supabase
            .from('categories')
            .select('name')
            .ilike('name', trimmedName)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ success: false, message: `Category "${existing.name}" already exists` });
        }

        const { data: newCat, error } = await supabase
            .from('categories')
            .insert({ name: trimmedName, description: description ? description.trim() : "" })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return res.status(201).json({
            success: true,
            message: `Category "${newCat.name}" created successfully`,
            category: { _id: newCat.id, name: newCat.name, description: newCat.description, createdAt: newCat.created_at }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// DELETE CATEGORY (Admin)
// ─────────────────────────────────────────────
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: category } = await supabase.from('categories').select('*').eq('id', id).maybeSingle();
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Check attached products
        const { data: attachedProducts } = await supabase
            .from('products')
            .select('id')
            .eq('category', category.name);

        if (attachedProducts && attachedProducts.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete "${category.name}" because ${attachedProducts.length} product(s) are still assigned to it. Reassign or delete those products first.`
            });
        }

        await supabase.from('categories').delete().eq('id', id);

        return res.status(200).json({ success: true, message: `Category "${category.name}" deleted successfully` });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
