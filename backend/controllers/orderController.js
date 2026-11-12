import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

// @desc    Create new order
// @route   POST /api/v1/order
// @access  Private
export const createOrder = async (req, res) => {
    // Array to keep track of atomically decremented items for rollback on failure
    const deductedItems = [];

    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            couponCode
        } = req.body;

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No order items provided"
            });
        }

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.phoneNo) {
            return res.status(400).json({
                success: false,
                message: "Complete shipping address is required"
            });
        }

        const verifiedOrderItems = [];
        let calculatedItemsPrice = 0;

        for (const item of orderItems) {
            const qty = Number(item.qty);
            if (!Number.isInteger(qty) || qty <= 0) {
                // Rollback any stock decremented so far
                for (const d of deductedItems) {
                    await Product.findByIdAndUpdate(d.productId, { $inc: { stock: d.qty } });
                }
                return res.status(400).json({
                    success: false,
                    message: "Invalid quantity specified for order items"
                });
            }

            // Atomic stock decrement with stock check ($gte: qty)
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: qty } },
                { $inc: { stock: -qty } },
                { new: true }
            );

            if (!updatedProduct) {
                // Rollback previously decremented items
                for (const d of deductedItems) {
                    await Product.findByIdAndUpdate(d.productId, { $inc: { stock: d.qty } });
                }

                // Check if product exists at all to provide clear error message
                const exists = await Product.findById(item.product);
                if (!exists) {
                    return res.status(404).json({
                        success: false,
                        message: `Product "${item.name || 'item'}" was not found.`
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${exists.name}". Available: ${exists.stock}`
                });
            }

            // Record successful deduction for rollback if needed
            deductedItems.push({ productId: item.product, qty });

            calculatedItemsPrice += updatedProduct.price * qty;
            verifiedOrderItems.push({
                product: updatedProduct._id,
                name: updatedProduct.name,
                image: updatedProduct.image,
                price: updatedProduct.price,
                qty
            });
        }

        // Coupon calculation
        let discountPrice = 0;
        let appliedCoupon = "";
        const cleanCoupon = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";
        if (cleanCoupon === "AURA10") {
            discountPrice = Number((calculatedItemsPrice * 0.10).toFixed(2));
            appliedCoupon = "AURA10";
        }

        const discountedBase = Math.max(0, Number((calculatedItemsPrice - discountPrice).toFixed(2)));

        // Standardized pricing: Free shipping over $50, else $10 flat shipping
        const calculatedShippingPrice = discountedBase === 0 || discountedBase > 50 ? 0 : 10;
        // 8% Sales Tax
        const calculatedTaxPrice = Number((0.08 * discountedBase).toFixed(2));
        const calculatedTotalPrice = Number((discountedBase + calculatedShippingPrice + calculatedTaxPrice).toFixed(2));

        const method = (paymentMethod || "Card").trim();
        const isCOD = method.toLowerCase() === "cash on delivery" || method.toLowerCase() === "cod";

        // Create Order
        const order = new Order({
            user: req.user._id,
            orderItems: verifiedOrderItems,
            shippingAddress,
            paymentMethod: isCOD ? "Cash on Delivery" : "Card",
            itemsPrice: calculatedItemsPrice,
            discountPrice,
            couponCode: appliedCoupon,
            taxPrice: calculatedTaxPrice,
            shippingPrice: calculatedShippingPrice,
            totalPrice: calculatedTotalPrice,
            isPaid: !isCOD, // COD is unpaid until delivery; Card is paid upon checkout
            paidAt: !isCOD ? Date.now() : null
        });

        const createdOrder = await order.save();

        return res.status(201).json({
            success: true,
            message: isCOD ? "Order placed successfully with Cash on Delivery!" : "Payment successful and order placed!",
            order: createdOrder
        });
    } catch (error) {
        // Rollback any deducted stock in case of unhandled error
        for (const d of deductedItems) {
            try {
                await Product.findByIdAndUpdate(d.productId, { $inc: { stock: d.qty } });
            } catch (err) {
                console.error("Error during stock rollback:", err);
            }
        }
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/v1/order/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "firstName lastName email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if the user is the owner or an admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this order"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get logged in user's orders
// @route   GET /api/v1/order/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/v1/order/allorders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate("user", "id firstName lastName email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/v1/order/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const ALLOWED_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status is required and must be one of: ${ALLOWED_STATUSES.join(", ")}`
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const previousStatus = order.status;

        // If order was cancelled and is now not cancelled, or wasn't cancelled and is now cancelled:
        if (status === "Cancelled" && previousStatus !== "Cancelled") {
            // Restock items
            for (const item of order.orderItems) {
                if (item.product) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: item.qty }
                    });
                }
            }
        } else if (previousStatus === "Cancelled" && status !== "Cancelled") {
            // Re-check and decrement stock if un-cancelling
            for (const item of order.orderItems) {
                if (item.product) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: -item.qty }
                    });
                }
            }
        }

        order.status = status;

        if (status === "Delivered") {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            // Automatically mark paid if it was Cash on Delivery
            if (!order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
            }
        }

        const updatedOrder = await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order: updatedOrder
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
