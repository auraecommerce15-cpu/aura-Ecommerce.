import { useEffect, useState } from "react";
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
    FolderPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

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

    const [activeTab, setActiveTab] = useState("products"); // "products" | "categories" | "orders"
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    
    const [productsLoading, setProductsLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

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
        <div className="pt-28 pb-16 min-h-screen bg-slate-55/20">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Admin Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
                        <p className="text-sm text-slate-500">Manage store inventory, product categories, and customer checkout cycles</p>
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
                            <span className="text-xs px-1.5 py-0.2 rounded-md bg-pink-100 text-pink-700 font-bold ml-1">
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
                            <Button onClick={openAddProductModal} className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-10 px-5 gap-2 cursor-pointer font-bold shadow-sm">
                                <Plus size={16} /> Add Product
                            </Button>
                        </div>

                        {productsLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
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
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200/50">
                                                        {p.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-extrabold text-slate-950">${p.price}</td>
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
                                    <Layers className="text-pink-600" size={22} />
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
                                className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-10 px-5 gap-2 cursor-pointer font-bold shadow-sm"
                            >
                                <Plus size={16} /> Add Category
                            </Button>
                        </div>

                        {categoriesLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
                            </div>
                        ) : categoriesList.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">No categories found. Click 'Add Category' to create one.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {categoriesList.map((cat, idx) => (
                                    <div
                                        key={cat._id || idx}
                                        className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-pink-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                                                        <Tag size={16} />
                                                    </div>
                                                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-pink-600 transition-colors">
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
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
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
                                                <td className="px-6 py-4 font-extrabold text-slate-900">${Number(o.totalPrice || 0).toFixed(2)}</td>
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
                                                        className="border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 outline-none focus:border-pink-500 bg-white font-bold cursor-pointer"
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

                {/* ──────── MODAL 1: Dedicated Add Category Modal ──────── */}
                {showCategoryModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-md flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FolderPlus size={20} className="text-pink-600" />
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
                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-750 focus:border-pink-500 outline-none resize-none"
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
                                        className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl cursor-pointer shadow-sm"
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
                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-750 focus:border-pink-500 outline-none resize-none"
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
                                                className="text-xs text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1 cursor-pointer"
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
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-750 focus:border-pink-500 outline-none bg-white font-medium cursor-pointer"
                                        >
                                            {availableCategoryNames.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="__new_custom_category__" className="text-pink-600 font-bold">
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
                                                className="border-pink-300 focus:border-pink-500"
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
                                                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                                                    <ImagePlus size={22} className="text-pink-500" />
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
                                            className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 cursor-pointer w-fit"
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
                                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold h-11 rounded-xl cursor-pointer shadow-sm"
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
