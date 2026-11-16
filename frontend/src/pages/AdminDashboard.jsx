import { useEffect, useState, useMemo, useRef } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Edit,
    X,
    ImagePlus,
    UploadCloud,
    Layers,
    Package,
    ShoppingBag,
    Tag,
    FolderPlus,
    Bell,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    Info,
    CheckCheck,
    RefreshCw,
    ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageHero from "@/components/PageHero";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();

    // Protect Route
    useEffect(() => {
        if (!user || user.role !== "admin") {
            toast.error("Access denied: admins only");
            navigate("/");
        }
    }, [user, navigate]);

    const { formatPrice } = useCurrency();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState("products"); // "products" | "categories" | "orders" | "notifications"
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    
    const [productsLoading, setProductsLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Notifications State & Logic
    const [readNotificationIds, setReadNotificationIds] = useState(() => {
        try {
            const saved = localStorage.getItem("aura_admin_read_notifications");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [notificationFilter, setNotificationFilter] = useState("all");
    const [showBellDropdown, setShowBellDropdown] = useState(false);
    const bellRef = useRef(null);

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return "Just now";
        const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    // Dynamically compile notifications from live orders and stock levels
    const notifications = useMemo(() => {
        const list = [];

        // 1. Order notifications
        orders.forEach((o) => {
            const customerName = o.user?.firstName
                ? `${o.user.firstName} ${o.user.lastName || ""}`.trim()
                : o.shippingAddress?.fullName || "A Customer";
            const isProcessing = o.status === "Processing" || o.status === "Pending";
            list.push({
                id: `order-${o._id}`,
                type: "order",
                title: `New Order #${String(o._id).slice(-6).toUpperCase()}`,
                subtitle: `${customerName} • ${formatPrice(o.totalPrice || 0)}`,
                message: `Order status is "${o.status || 'Processing'}". Paid: ${o.isPaid ? 'Yes' : 'Pending'}. Delivery address: ${o.shippingAddress?.city || 'Registered Address'}.`,
                date: new Date(o.createdAt || Date.now()),
                timeAgo: formatTimeAgo(o.createdAt),
                read: readNotificationIds.includes(`order-${o._id}`),
                severity: isProcessing ? "warning" : "info",
                order: o,
            });
        });

        // 2. Inventory alerts
        products.forEach((p) => {
            if (p.stock === 0) {
                list.push({
                    id: `stock-out-${p._id}`,
                    type: "inventory",
                    title: `Out of Stock: ${p.name}`,
                    subtitle: `Category: ${p.category}`,
                    message: `Inventory is 0 units! Shoppers cannot buy this product until you restock.`,
                    date: new Date(),
                    timeAgo: "Attention Required",
                    read: readNotificationIds.includes(`stock-out-${p._id}`),
                    severity: "critical",
                    product: p,
                });
            } else if (p.stock <= 5) {
                list.push({
                    id: `stock-low-${p._id}`,
                    type: "inventory",
                    title: `Low Stock Alert: ${p.name}`,
                    subtitle: `Only ${p.stock} units remaining`,
                    message: `Product inventory has fallen to ${p.stock} units. Recommended to replenish inventory.`,
                    date: new Date(),
                    timeAgo: "Low Inventory",
                    read: readNotificationIds.includes(`stock-low-${p._id}`),
                    severity: "warning",
                    product: p,
                });
            }
        });

        // 3. System pipeline check
        list.push({
            id: "system-check",
            type: "system",
            title: "Store Engine Live",
            subtitle: "Security & Payments Active",
            message: "Online checkout, order tracking, and stock synchronization are operating normally.",
            date: new Date(),
            timeAgo: "Active",
            read: readNotificationIds.includes("system-check"),
            severity: "success",
        });

        return list;
    }, [orders, products, readNotificationIds, formatPrice]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markNotificationAsRead = (id) => {
        if (!readNotificationIds.includes(id)) {
            const updated = [...readNotificationIds, id];
            setReadNotificationIds(updated);
            try {
                localStorage.setItem("aura_admin_read_notifications", JSON.stringify(updated));
            } catch {}
        }
    };

    const toggleNotificationRead = (id, e) => {
        if (e) e.stopPropagation();
        let updated;
        if (readNotificationIds.includes(id)) {
            updated = readNotificationIds.filter(i => i !== id);
        } else {
            updated = [...readNotificationIds, id];
        }
        setReadNotificationIds(updated);
        try {
            localStorage.setItem("aura_admin_read_notifications", JSON.stringify(updated));
        } catch {}
    };

    const markAllNotificationsAsRead = () => {
        const allIds = notifications.map((n) => n.id);
        setReadNotificationIds(allIds);
        try {
            localStorage.setItem("aura_admin_read_notifications", JSON.stringify(allIds));
        } catch {}
        toast.success("All notifications marked as read");
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setShowBellDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Product Modal Form States
    const [showProductModal, setShowProductModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategoryName, setCustomCategoryName] = useState("");
    const [productForm, setProductForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "Laptops",
        image: "",
        stock: ""
    });

    // Dedicated Category Modal States
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: ""
    });
    const [categorySubmitting, setCategorySubmitting] = useState(false);

    const defaultCategoryNames = ["Laptops", "Smartphones", "Headphones", "Smartwatches", "Accessories"];

    // Combine fetched categories with fallback defaults
    const availableCategoryNames = Array.from(
        new Set([
            ...defaultCategoryNames,
            ...categoriesList.map((c) => (typeof c === "string" ? c : c.name)),
            ...products.map((p) => p.category)
        ].filter(Boolean))
    ).sort();

    const fetchAdminProducts = async () => {
        try {
            setProductsLoading(true);
            const res = await api.get("/product");
            if (res.data.success) {
                setProducts(res.data.products);
            }
        } catch {
            toast.error("Failed to load products");
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchAdminCategories = async () => {
        try {
            setCategoriesLoading(true);
            const res = await api.get("/category");
            if (res.data.success && res.data.categories) {
                setCategoriesList(res.data.categories);
            }
        } catch {
            // Silently fallback if category endpoint is starting
        } finally {
            setCategoriesLoading(false);
        }
    };

    const fetchAdminOrders = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;
        try {
            setOrdersLoading(true);
            const res = await api.get("/order/allorders", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (res.data.success) {
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.error("fetchAdminOrders error:", error);
            const msg = error.response?.data?.message || "Failed to load orders";
            toast.error(msg);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === "admin") {
            const timer = setTimeout(() => {
                fetchAdminProducts();
                fetchAdminCategories();
                fetchAdminOrders();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Product Form Actions
    const handleProductFormChange = (e) => {
        setProductForm({
            ...productForm,
            [e.target.name]: e.target.value
        });
    };

    // Convert picked file → base64 and store in productForm.image
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setProductForm((prev) => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const openAddProductModal = () => {
        setIsEditing(false);
        setEditingProductId(null);
        setImageFile(null);
        setIsCustomCategory(false);
        setCustomCategoryName("");
        setProductForm({
            name: "",
            description: "",
            price: "",
            category: availableCategoryNames[0] || "Laptops",
            image: "",
            stock: ""
        });
        setShowProductModal(true);
    };

    const openEditProductModal = (product) => {
        setIsEditing(true);
        setEditingProductId(product._id);
        setImageFile(null);
        setIsCustomCategory(false);
        setCustomCategoryName("");
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image: product.image,
            stock: product.stock
        });
        setShowProductModal(true);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        let finalCategory = productForm.category;

        // If user typed a custom category name
        if (isCustomCategory) {
            if (!customCategoryName.trim()) {
                toast.error("Please enter a category name");
                return;
            }
            finalCategory = customCategoryName.trim();

            // Persist the new category in the Category collection
            try {
                await api.post(
                    "/category",
                    { name: finalCategory },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                fetchAdminCategories();
            } catch {
                // Ignore if category already exists
            }
        }

        const payload = {
            ...productForm,
            category: finalCategory
        };

        try {
            if (isEditing) {
                // Update
                const res = await api.put(
                    `/product/${editingProductId}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                if (res.data.success) {
                    toast.success("Product updated successfully!");
                    fetchAdminProducts();
                    fetchAdminCategories();
                    setShowProductModal(false);
                }
            } else {
                // Create
                const res = await api.post("/product", payload, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                });
                if (res.data.success) {
                    toast.success("Product added successfully!");
                    fetchAdminProducts();
                    fetchAdminCategories();
                    setShowProductModal(false);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Product operation failed");
        }
    };

    const handleDeleteProduct = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        try {
            const res = await api.delete(`/product/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (res.data.success) {
                toast.success("Product deleted successfully");
                fetchAdminProducts();
                fetchAdminCategories();
            }
        } catch {
            toast.error("Failed to delete product");
        }
    };

    // Category Creation & Deletion
    const handleCreateCategorySubmit = async (e) => {
        e.preventDefault();
        if (!categoryForm.name.trim()) {
            toast.error("Please enter a category name");
            return;
        }

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        try {
            setCategorySubmitting(true);
            const res = await api.post(
                "/category",
                {
                    name: categoryForm.name.trim(),
                    description: categoryForm.description.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (res.data.success) {
                toast.success(res.data.message || "Category created successfully!");
                setCategoryForm({ name: "", description: "" });
                setShowCategoryModal(false);
                fetchAdminCategories();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create category");
        } finally {
            setCategorySubmitting(false);
        }
    };

    const handleDeleteCategory = async (cat) => {
        if (cat.productCount > 0) {
            toast.error(
                `Cannot delete "${cat.name}" because ${cat.productCount} product(s) are assigned to it. Reassign or delete those products first.`
            );
            return;
        }

        if (!cat._id) {
            toast.info(`"${cat.name}" is a default category with no database record to delete.`);
            return;
        }

        if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        try {
            const res = await api.delete(`/category/${cat._id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (res.data.success) {
                toast.success(res.data.message || "Category deleted successfully");
                fetchAdminCategories();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete category");
        }
    };

    // Order Actions
    const handleStatusChange = async (orderId, newStatus) => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        try {
            const res = await api.put(
                `/order/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            if (res.data.success) {
                toast.success(`Order status updated to ${newStatus}`);
                fetchAdminOrders();
            }
        } catch {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="pb-16 min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
            <PageHero
                badge="ADMIN CONTROL"
                title="Admin"
                gradientText="Console"
                subtitle="Manage store inventory, product categories, and customer orders in one place."
                breadcrumbs={[{ label: "Home", to: "/" }, { label: "Admin Console", to: null }]}
                rightIcon={Package}
            />
            <div className="max-w-7xl mx-auto px-6 pt-8">
                
                {/* Admin Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Manage store inventory, product categories, and customer checkout cycles</p>
                        </div>

                        {/* Quick Bell Notification Dropdown */}
                        <div className="relative ml-2" ref={bellRef}>
                            <button
                                onClick={() => setShowBellDropdown(!showBellDropdown)}
                                title="Store Notifications"
                                className="relative p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 transition-all shadow-xs cursor-pointer flex items-center justify-center"
                            >
                                <Bell size={18} className={unreadCount > 0 ? "text-purple-600 animate-bounce" : ""} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black px-1 shadow-sm">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Flyout */}
                            {showBellDropdown && (
                                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Bell size={16} className="text-purple-600" />
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                                                {unreadCount} new
                                            </span>
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllNotificationsAsRead}
                                                className="text-[11px] text-purple-600 hover:underline font-semibold cursor-pointer"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    {/* Preview List */}
                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                        {notifications.slice(0, 5).map((n) => (
                                            <div
                                                key={n.id}
                                                onClick={() => {
                                                    markNotificationAsRead(n.id);
                                                    if (n.type === "order") {
                                                        setActiveTab("orders");
                                                        setShowBellDropdown(false);
                                                    } else if (n.type === "inventory" && n.product) {
                                                        openEditProductModal(n.product);
                                                        setShowBellDropdown(false);
                                                    }
                                                }}
                                                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                                    !n.read
                                                        ? "bg-purple-50/60 dark:bg-purple-950/30 border-purple-200/70 dark:border-purple-800/70"
                                                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                                                        n.severity === "critical"
                                                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                                            : n.severity === "warning"
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                                            : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                                    }`}>
                                                        {n.type}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{n.timeAgo}</span>
                                                </div>
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{n.title}</h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{n.message}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 text-center">
                                        <button
                                            onClick={() => {
                                                setActiveTab("notifications");
                                                setShowBellDropdown(false);
                                            }}
                                            className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 cursor-pointer"
                                        >
                                            Open Notification Center &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        <button
                            onClick={() => setActiveTab("products")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                activeTab === "products"
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-white text-slate-650 hover:bg-slate-50 border border-slate-200"
                            }`}
                        >
                            <Package size={16} />
                            <span>Products</span>
                            <span className="text-xs px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold ml-1">
                                {products.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("categories")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                activeTab === "categories"
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-white text-slate-650 hover:bg-slate-50 border border-slate-200"
                            }`}
                        >
                            <Layers size={16} />
                            <span>Categories</span>
                            <span className="text-xs px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 font-bold ml-1">
                                {categoriesList.length || availableCategoryNames.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                activeTab === "orders"
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-white text-slate-650 hover:bg-slate-50 border border-slate-200"
                            }`}
                        >
                            <ShoppingBag size={16} />
                            <span>Orders</span>
                            <span className="text-xs px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold ml-1">
                                {orders.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("notifications")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
                                activeTab === "notifications"
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-white text-slate-650 hover:bg-slate-50 border border-slate-200"
                            }`}
                        >
                            <Bell size={16} className={unreadCount > 0 ? "text-purple-400" : ""} />
                            <span>Notifications</span>
                            {unreadCount > 0 ? (
                                <span className="text-xs px-1.5 py-0.2 rounded-md bg-red-500 text-white font-black ml-1 animate-pulse">
                                    {unreadCount}
                                </span>
                            ) : (
                                <span className="text-xs px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold ml-1">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ──────── TAB 1: Products Administration ──────── */}
                {activeTab === "products" && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 md:p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Manage Catalog</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Add, edit, or remove hardware from your store inventory</p>
                            </div>
                            <Button onClick={openAddProductModal} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 px-5 gap-2 cursor-pointer font-bold shadow-sm">
                                <Plus size={16} /> Add Product
                            </Button>
                        </div>

                        {productsLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">No products in catalog. Click 'Add Product' to start seeding.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs">
                                        <tr>
                                            <th className="px-6 py-4 rounded-l-xl">Image</th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4 rounded-r-xl text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {products.map((p) => (
                                            <tr key={p._id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <img
                                                        src={p.image}
                                                        alt={p.name}
                                                        className="w-12 h-12 object-cover rounded-lg border border-slate-100 bg-slate-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-900 truncate max-w-xs">{p.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-50 text-purple-700 border border-pink-200/50">
                                                        {p.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-extrabold text-slate-950 dark:text-white">{formatPrice(p.price)}</td>
                                                <td className="px-6 py-4 font-medium">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                        p.stock > 5
                                                            ? "bg-green-50 text-green-700"
                                                            : p.stock > 0
                                                            ? "bg-amber-50 text-amber-700"
                                                            : "bg-red-50 text-red-700"
                                                    }`}>
                                                        {p.stock} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditProductModal(p)}
                                                            className="p-2 hover:bg-slate-100 text-blue-500 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit Product"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(p._id, p.name)}
                                                            className="p-2 hover:bg-slate-100 text-red-500 rounded-lg transition-colors cursor-pointer"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ──────── TAB 2: Categories Administration ──────── */}
                {activeTab === "categories" && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 md:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Layers className="text-purple-600" size={22} />
                                    Manage Product Categories
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Create new product collections to organize your catalog and filter options
                                </p>
                            </div>
                            <Button
                                onClick={() => {
                                    setCategoryForm({ name: "", description: "" });
                                    setShowCategoryModal(true);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 px-5 gap-2 cursor-pointer font-bold shadow-sm"
                            >
                                <Plus size={16} /> Add Category
                            </Button>
                        </div>

                        {categoriesLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                            </div>
                        ) : categoriesList.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">No categories found. Click 'Add Category' to create one.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {categoriesList.map((cat, idx) => (
                                    <div
                                        key={cat._id || idx}
                                        className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                                                        <Tag size={16} />
                                                    </div>
                                                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                                                        {cat.name}
                                                    </h3>
                                                </div>
                                                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                                    {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed font-light min-h-[32px]">
                                                {cat.description || "Curated collection for store inventory."}
                                            </p>
                                        </div>

                                        <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {cat.productCount > 0 ? "In active catalog" : "Empty category"}
                                            </span>
                                            {cat._id && cat.productCount === 0 && (
                                                <button
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer transition-colors p-1 rounded-md hover:bg-red-50"
                                                    title="Delete this empty category"
                                                >
                                                    <Trash2 size={13} />
                                                    <span>Delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ──────── TAB 3: Orders Administration ──────── */}
                {activeTab === "orders" && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 md:p-8 space-y-6">
                        <h2 className="text-xl font-bold text-slate-900">Track Customer Orders</h2>

                        {ordersLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">No checkout orders placed yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-650">
                                    <thead className="bg-slate-55/20 text-slate-700 uppercase font-bold text-xs">
                                        <tr>
                                            <th className="px-6 py-4 rounded-l-xl">Order ID</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Total Invoice</th>
                                            <th className="px-6 py-4">Payment</th>
                                            <th className="px-6 py-4">Progress Status</th>
                                            <th className="px-6 py-4 rounded-r-xl text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {orders.map((o) => (
                                            <tr key={o._id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">#{o._id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800">{o.user?.firstName} {o.user?.lastName}</div>
                                                    <div className="text-xs text-slate-400">{o.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">{formatPrice(o.totalPrice || 0)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                                                        PAID
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                                        o.status === "Delivered"
                                                            ? "bg-green-100 text-green-700"
                                                            : o.status === "Cancelled"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-amber-100 text-amber-700"
                                                    }`}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <select
                                                        value={o.status}
                                                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                                                        className="border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 outline-none focus:border-purple-500 bg-white font-bold cursor-pointer"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ──────── TAB 4: Real-time Notifications Center ──────── */}
                {activeTab === "notifications" && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs p-6 md:p-8 space-y-6">
                        
                        {/* Notifications Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            Store Notifications & System Alerts
                                            {unreadCount > 0 && (
                                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500 text-white font-black animate-pulse">
                                                    {unreadCount} UNREAD
                                                </span>
                                            )}
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Real-time alerts for incoming checkout orders, low inventory levels, and system health
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        fetchAdminOrders();
                                        fetchAdminProducts();
                                        toast.success("Notifications refreshed");
                                    }}
                                    className="h-9 rounded-xl text-xs gap-1.5 cursor-pointer font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <RefreshCw size={13} /> Refresh
                                </Button>
                                {unreadCount > 0 && (
                                    <Button
                                        onClick={markAllNotificationsAsRead}
                                        className="h-9 rounded-xl text-xs gap-1.5 cursor-pointer font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                                    >
                                        <CheckCheck size={14} /> Mark All as Read
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { id: "all", label: "All Alerts", count: notifications.length },
                                { id: "unread", label: "Unread Only", count: unreadCount },
                                { id: "orders", label: "Orders", count: notifications.filter(n => n.type === "order").length },
                                { id: "inventory", label: "Inventory Alerts", count: notifications.filter(n => n.type === "inventory").length },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setNotificationFilter(tab.id)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                        notificationFilter === tab.id
                                            ? "bg-purple-600 text-white shadow-sm"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                                        notificationFilter === tab.id
                                            ? "bg-purple-700 text-white"
                                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Notifications List */}
                        {(() => {
                            const filtered = notifications.filter((n) => {
                                if (notificationFilter === "unread") return !n.read;
                                if (notificationFilter === "orders") return n.type === "order";
                                if (notificationFilter === "inventory") return n.type === "inventory";
                                return true;
                            });

                            if (filtered.length === 0) {
                                return (
                                    <div className="text-center py-16 px-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mx-auto mb-3">
                                            <Bell size={24} />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Notifications</h3>
                                        <p className="text-xs text-slate-400 mt-1">There are no alerts matching your selected filter.</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-3">
                                    {filtered.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => markNotificationAsRead(item.id)}
                                            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start justify-between gap-4 ${
                                                !item.read
                                                    ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60 shadow-xs"
                                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3.5 min-w-0">
                                                {/* Severity Icon */}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                                    item.severity === "critical"
                                                        ? "bg-red-100 dark:bg-red-950 text-red-600"
                                                        : item.severity === "warning"
                                                        ? "bg-amber-100 dark:bg-amber-950 text-amber-600"
                                                        : item.severity === "success"
                                                        ? "bg-green-100 dark:bg-green-950 text-green-600"
                                                        : "bg-purple-100 dark:bg-purple-950 text-purple-600"
                                                }`}>
                                                    {item.severity === "critical" ? (
                                                        <AlertCircle size={20} />
                                                    ) : item.severity === "warning" ? (
                                                        <AlertTriangle size={20} />
                                                    ) : item.severity === "success" ? (
                                                        <CheckCircle2 size={20} />
                                                    ) : (
                                                        <ShoppingBag size={20} />
                                                    )}
                                                </div>

                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                            item.type === "order"
                                                                ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                                                                : item.type === "inventory"
                                                                ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                                        }`}>
                                                            {item.type}
                                                        </span>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                                                            {item.title}
                                                        </h4>
                                                        {!item.read && (
                                                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Unread" />
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        {item.subtitle}
                                                    </p>

                                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                                                        {item.message}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                <span className="text-[11px] text-slate-400 font-medium mr-2">
                                                    {item.timeAgo}
                                                </span>

                                                {item.type === "order" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markNotificationAsRead(item.id);
                                                            setActiveTab("orders");
                                                        }}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-8 rounded-lg cursor-pointer gap-1 shadow-xs"
                                                    >
                                                        <span>View Order</span>
                                                        <ExternalLink size={12} />
                                                    </Button>
                                                )}

                                                {item.type === "inventory" && item.product && (
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markNotificationAsRead(item.id);
                                                            openEditProductModal(item.product);
                                                        }}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-8 rounded-lg cursor-pointer gap-1 shadow-xs"
                                                    >
                                                        <span>Restock</span>
                                                        <ExternalLink size={12} />
                                                    </Button>
                                                )}

                                                <button
                                                    onClick={(e) => toggleNotificationRead(item.id, e)}
                                                    title={item.read ? "Mark as unread" : "Mark as read"}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors text-xs"
                                                >
                                                    {item.read ? "Mark Unread" : "Mark Read"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* ──────── MODAL 1: Dedicated Add Category Modal ──────── */}
                {showCategoryModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-md flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FolderPlus size={20} className="text-purple-600" />
                                    Add New Category
                                </h3>
                                <button
                                    onClick={() => setShowCategoryModal(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCategorySubmit} className="p-6 space-y-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="category-name">Category Name *</Label>
                                    <Input
                                        id="category-name"
                                        placeholder="e.g. Gaming, Drones, Cameras, Smart Home..."
                                        value={categoryForm.name}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="category-desc">Description (Optional)</Label>
                                    <textarea
                                        id="category-desc"
                                        rows={3}
                                        placeholder="Briefly describe what belongs in this category..."
                                        value={categoryForm.description}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-750 focus:border-purple-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCategoryModal(false)}
                                        className="flex-1 rounded-xl cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={categorySubmitting}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer shadow-sm"
                                    >
                                        {categorySubmitting ? "Creating..." : "Create Category"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ──────── MODAL 2: Add/Edit Product Modal Dialog ──────── */}
                {showProductModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-md flex flex-col max-h-[92vh]">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {isEditing ? "Edit Product Details" : "Add New Product"}
                                </h3>
                                <button
                                    onClick={() => setShowProductModal(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable form body */}
                            <form id="product-form" onSubmit={handleProductSubmit} className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={productForm.name}
                                        onChange={handleProductFormChange}
                                        required
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        value={productForm.description}
                                        onChange={handleProductFormChange}
                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-750 focus:border-purple-500 outline-none resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="price">Price ($)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={productForm.price}
                                            onChange={handleProductFormChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="stock">Stock Quantity</Label>
                                        <Input
                                            id="stock"
                                            name="stock"
                                            type="number"
                                            min="0"
                                            value={productForm.stock}
                                            onChange={handleProductFormChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Category Picker with '+ Add New Category' option */}
                                <div className="grid gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="category">Category</Label>
                                        {!isCustomCategory ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomCategory(true);
                                                    setCustomCategoryName("");
                                                }}
                                                className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <Plus size={13} /> + New Category
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomCategory(false);
                                                    setCustomCategoryName("");
                                                }}
                                                className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                                            >
                                                Choose Existing
                                            </button>
                                        )}
                                    </div>

                                    {!isCustomCategory ? (
                                        <select
                                            id="category"
                                            name="category"
                                            value={productForm.category}
                                            onChange={(e) => {
                                                if (e.target.value === "__new_custom_category__") {
                                                    setIsCustomCategory(true);
                                                    setCustomCategoryName("");
                                                } else {
                                                    handleProductFormChange(e);
                                                }
                                            }}
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-750 focus:border-purple-500 outline-none bg-white font-medium cursor-pointer"
                                        >
                                            {availableCategoryNames.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="__new_custom_category__" className="text-purple-600 font-bold">
                                                + Add New Category...
                                            </option>
                                        </select>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <Input
                                                placeholder="Enter new category name (e.g. Gaming, Drones)..."
                                                value={customCategoryName}
                                                onChange={(e) => setCustomCategoryName(e.target.value)}
                                                autoFocus
                                                required
                                                className="border-purple-300 focus:border-purple-500"
                                            />
                                            <p className="text-[11px] text-slate-400">
                                                This category will be created and saved in your store catalog.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Image Picker */}
                                <div className="grid gap-1.5">
                                    <Label>Product Image</Label>

                                    {/* Drop-zone / click-to-browse */}
                                    <label
                                        htmlFor="image-upload"
                                        className="group flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-pink-400 rounded-2xl p-5 cursor-pointer transition-colors bg-slate-50 hover:bg-pink-50"
                                    >
                                        {productForm.image ? (
                                            <img
                                                src={productForm.image}
                                                alt="Preview"
                                                className="w-full max-h-40 object-contain rounded-xl"
                                            />
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                                                    <ImagePlus size={22} className="text-purple-500" />
                                                </div>
                                                <p className="text-sm font-semibold text-slate-600">Click to browse image</p>
                                                <p className="text-xs text-slate-400">PNG, JPG, WEBP up to 5 MB</p>
                                            </>
                                        )}
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>

                                    {/* Change button shown after image selected */}
                                    {productForm.image && (
                                        <label
                                            htmlFor="image-upload"
                                            className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer w-fit"
                                        >
                                            <UploadCloud size={14} /> Change image
                                        </label>
                                    )}
                                </div>
                            </form>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 shrink-0">
                                <Button
                                    type="submit"
                                    form="product-form"
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 rounded-xl cursor-pointer shadow-sm"
                                >
                                    {isEditing ? "Update Product" : "Save Product"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
