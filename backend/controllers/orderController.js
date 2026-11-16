import supabase from "../database/supabase.js";

// ─────────────────────────────────────────────
// CREATE ORDER
// ─────────────────────────────────────────────
export const createOrder = async (req, res) => {
    const deductedItems = [];

    try {
        const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: "No order items provided" });
        }

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.phoneNo) {
            return res.status(400).json({ success: false, message: "Complete shipping address is required" });
        }

        const verifiedOrderItems = [];
        let calculatedItemsPrice = 0;

        for (const item of orderItems) {
            const qty = Number(item.qty);
            if (!Number.isInteger(qty) || qty <= 0) {
                // Rollback
                for (const d of deductedItems) {
                    await supabase.rpc('increment_stock', { p_id: d.productId, p_qty: d.qty });
                }
                return res.status(400).json({ success: false, message: "Invalid quantity specified for order items" });
            }

            // Fetch current product stock
            const { data: prod } = await supabase
                .from('products')
                .select('id, name, price, image, stock')
                .eq('id', item.product)
                .maybeSingle();

            if (!prod) {
                for (const d of deductedItems) {
                    await supabase.rpc('increment_stock', { p_id: d.productId, p_qty: d.qty });
                }
                return res.status(404).json({ success: false, message: `Product "${item.name || 'item'}" was not found.` });
            }

            if (prod.stock < qty) {
                for (const d of deductedItems) {
                    await supabase.rpc('increment_stock', { p_id: d.productId, p_qty: d.qty });
                }
                return res.status(400).json({ success: false, message: `Insufficient stock for "${prod.name}". Available: ${prod.stock}` });
            }

            // Decrement stock atomically
            const { error: stockErr } = await supabase
                .from('products')
                .update({ stock: prod.stock - qty })
                .eq('id', prod.id);

            if (stockErr) throw new Error(stockErr.message);

            deductedItems.push({ productId: prod.id, qty });
            calculatedItemsPrice += prod.price * qty;
            verifiedOrderItems.push({
                product_id: prod.id,
                name: prod.name,
                image: prod.image,
                price: prod.price,
                qty
            });
        }

        // Coupon
        let discountPrice = 0;
        let appliedCoupon = "";
        const cleanCoupon = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";
        if (cleanCoupon === "AURA10") {
            discountPrice = Number((calculatedItemsPrice * 0.10).toFixed(2));
            appliedCoupon = "AURA10";
        }

        const discountedBase = Math.max(0, Number((calculatedItemsPrice - discountPrice).toFixed(2)));
        const calculatedShippingPrice = discountedBase === 0 || discountedBase > 50 ? 0 : 10;
        const calculatedTaxPrice = Number((0.08 * discountedBase).toFixed(2));
        const calculatedTotalPrice = Number((discountedBase + calculatedShippingPrice + calculatedTaxPrice).toFixed(2));

        const method = (paymentMethod || "Card").trim();
        const isCOD = method.toLowerCase() === "cash on delivery" || method.toLowerCase() === "cod";

        // Create order row
        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .insert({
                user_id: req.user.id,
                payment_method: isCOD ? "Cash on Delivery" : "Card",
                items_price: calculatedItemsPrice,
                discount_price: discountPrice,
                coupon_code: appliedCoupon,
                tax_price: calculatedTaxPrice,
                shipping_price: calculatedShippingPrice,
                total_price: calculatedTotalPrice,
                is_paid: !isCOD,
                paid_at: !isCOD ? new Date().toISOString() : null,
                shipping_address: shippingAddress.address,
                shipping_city: shippingAddress.city,
                shipping_zip_code: shippingAddress.zipCode,
                shipping_phone_no: shippingAddress.phoneNo
            })
            .select()
            .single();

        if (orderErr) throw new Error(orderErr.message);

        // Insert order items
        const orderItemsToInsert = verifiedOrderItems.map(oi => ({
            order_id: order.id,
            product_id: oi.product_id,
            name: oi.name,
            image: oi.image,
            price: oi.price,
            qty: oi.qty
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsToInsert);
        if (itemsErr) throw new Error(itemsErr.message);

        return res.status(201).json({
            success: true,
            message: isCOD ? "Order placed successfully with Cash on Delivery!" : "Payment successful and order placed!",
            order: mapOrder(order, orderItemsToInsert)
        });
    } catch (error) {
        // Rollback stock
        for (const d of deductedItems) {
            try {
                const { data: prod } = await supabase.from('products').select('stock').eq('id', d.productId).single();
                if (prod) await supabase.from('products').update({ stock: prod.stock + d.qty }).eq('id', d.productId);
            } catch (e) { /* silent */ }
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET ORDER BY ID
// ─────────────────────────────────────────────
export const getOrderById = async (req, res) => {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select('*, order_items(*), users(id, first_name, last_name, email)')
            .eq('id', req.params.id)
            .maybeSingle();

        if (error || !order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.user_id !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized to view this order" });
        }

        return res.status(200).json({ success: true, order: mapOrder(order, order.order_items, order.users) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// MY ORDERS
// ─────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return res.status(200).json({
            success: true,
            orders: orders.map(o => mapOrder(o, o.order_items))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// ALL ORDERS (Admin)
// ─────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*), users(id, first_name, last_name, email)')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return res.status(200).json({
            success: true,
            orders: orders.map(o => mapOrder(o, o.order_items, o.users))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// UPDATE ORDER STATUS (Admin)
// ─────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ALLOWED_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` });
        }

        const { data: order, error: fetchErr } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', req.params.id)
            .maybeSingle();

        if (fetchErr || !order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const previousStatus = order.status;
        const updates = { status };

        // Stock restock/decrement on cancel/uncancel
        if (status === "Cancelled" && previousStatus !== "Cancelled") {
            for (const item of order.order_items) {
                const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
                if (prod) await supabase.from('products').update({ stock: prod.stock + item.qty }).eq('id', item.product_id);
            }
        } else if (previousStatus === "Cancelled" && status !== "Cancelled") {
            for (const item of order.order_items) {
                const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
                if (prod) await supabase.from('products').update({ stock: prod.stock - item.qty }).eq('id', item.product_id);
            }
        }

        if (status === "Delivered") {
            updates.is_delivered = true;
            updates.delivered_at = new Date().toISOString();
            if (!order.is_paid) {
                updates.is_paid = true;
                updates.paid_at = new Date().toISOString();
            }
        }

        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', req.params.id)
            .select('*, order_items(*)')
            .single();

        if (error) throw new Error(error.message);

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order: mapOrder(updatedOrder, updatedOrder.order_items)
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// HELPER: Map Supabase rows → frontend shape
// ─────────────────────────────────────────────
function mapOrder(o, items = [], user = null) {
    return {
        _id: o.id,
        user: user ? {
            _id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email
        } : o.user_id,
        orderItems: (items || []).map(i => ({
            _id: i.id,
            product: i.product_id,
            name: i.name,
            image: i.image,
            price: i.price,
            qty: i.qty
        })),
        shippingAddress: {
            address: o.shipping_address,
            city: o.shipping_city,
            zipCode: o.shipping_zip_code,
            phoneNo: o.shipping_phone_no
        },
        paymentMethod: o.payment_method,
        itemsPrice: o.items_price,
        discountPrice: o.discount_price,
        couponCode: o.coupon_code,
        taxPrice: o.tax_price,
        shippingPrice: o.shipping_price,
        totalPrice: o.total_price,
        isPaid: o.is_paid,
        paidAt: o.paid_at,
        isDelivered: o.is_delivered,
        deliveredAt: o.delivered_at,
        status: o.status,
        createdAt: o.created_at,
        updatedAt: o.updated_at
    };
}
