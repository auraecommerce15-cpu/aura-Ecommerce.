import supabase from "../database/supabase.js";

// ─────────────────────────────────────────────
// GET ALL PRODUCTS (with filters & sort)
// ─────────────────────────────────────────────
export const getProducts = async (req, res) => {
    try {
        const { keyword, category, minPrice, maxPrice, sort } = req.query;

        let query = supabase
            .from('products')
            .select('*');

        // Keyword search (Supabase ilike)
        if (keyword && typeof keyword === "string" && keyword.trim()) {
            query = query.ilike('name', `%${keyword.trim()}%`);
        }

        // Category filter
        if (category && category !== "All") {
            query = query.eq('category', category);
        }

        // Price range
        if (minPrice) query = query.gte('price', Number(minPrice));
        if (maxPrice) query = query.lte('price', Number(maxPrice));

        // Sorting
        if (sort === 'price-asc') {
            query = query.order('price', { ascending: true });
        } else if (sort === 'price-desc') {
            query = query.order('price', { ascending: false });
        } else if (sort === 'rating-desc') {
            query = query.order('rating', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data: products, error } = await query;
        if (error) throw new Error(error.message);

        // Normalize IDs to _id for frontend compatibility
        const mapped = products.map(mapProduct);

        return res.status(200).json({ success: true, count: mapped.length, products: mapped });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET PRODUCT BY ID
// ─────────────────────────────────────────────
export const getProductById = async (req, res) => {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*, reviews(*)')
            .eq('id', req.params.id)
            .maybeSingle();

        if (error || !product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, product: mapProduct(product) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// CREATE PRODUCT (Admin)
// ─────────────────────────────────────────────
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const { data: newProduct, error } = await supabase
            .from('products')
            .insert({
                name,
                description,
                price: Number(price),
                category,
                image,
                stock: Number(stock)
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: mapProduct(newProduct)
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// UPDATE PRODUCT (Admin)
// ─────────────────────────────────────────────
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        // Fetch current product
        const { data: existing, error: fetchErr } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();

        if (fetchErr || !existing) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const updates = {
            name: name || existing.name,
            description: description || existing.description,
            price: price !== undefined ? Number(price) : existing.price,
            category: category || existing.category,
            image: image || existing.image,
            stock: stock !== undefined ? Number(stock) : existing.stock
        };

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: mapProduct(updatedProduct)
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// DELETE PRODUCT (Admin)
// ─────────────────────────────────────────────
export const deleteProduct = async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('id', req.params.id)
            .maybeSingle();

        if (!existing) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const { error } = await supabase.from('products').delete().eq('id', req.params.id);
        if (error) throw new Error(error.message);

        return res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// CREATE PRODUCT REVIEW
// ─────────────────────────────────────────────
export const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (rating === undefined || !comment) {
            return res.status(400).json({ success: false, message: "Rating and comment are required" });
        }

        const { data: product, error: prodErr } = await supabase
            .from('products')
            .select('id')
            .eq('id', req.params.id)
            .maybeSingle();

        if (prodErr || !product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Upsert review (one per user per product)
        const { error: reviewErr } = await supabase
            .from('reviews')
            .upsert({
                product_id: req.params.id,
                user_id: req.user.id,
                name: `${req.user.first_name} ${req.user.last_name}`,
                rating: Number(rating),
                comment
            }, { onConflict: 'product_id,user_id' });

        if (reviewErr) throw new Error(reviewErr.message);

        // Recalculate rating and numReviews
        const { data: allReviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', req.params.id);

        const numReviews = allReviews.length;
        const avgRating = numReviews > 0
            ? allReviews.reduce((acc, r) => acc + r.rating, 0) / numReviews
            : 0;

        await supabase
            .from('products')
            .update({ rating: avgRating, num_reviews: numReviews })
            .eq('id', req.params.id);

        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            rating: avgRating,
            numReviews
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// HELPER: Map Supabase snake_case → frontend camelCase
// ─────────────────────────────────────────────
function mapProduct(p) {
    return {
        _id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.image,
        stock: p.stock,
        rating: p.rating,
        numReviews: p.num_reviews,
        reviews: (p.reviews || []).map(r => ({
            _id: r.id,
            user: r.user_id,
            name: r.name,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at
        })),
        createdAt: p.created_at,
        updatedAt: p.updated_at
    };
}
