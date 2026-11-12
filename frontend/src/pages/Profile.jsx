import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/UserSlice";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { User, ClipboardList, MapPin, Phone, Settings } from "lucide-react";
import PageHero from "@/components/PageHero";

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    
    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        address: user?.address || "",
        city: user?.city || "",
        zipCode: user?.zipCode || "",
        phoneNo: user?.phoneNo || ""
    });

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [activeTab, setActiveTab] = useState("orders"); // "orders" or "edit"

    const fetchMyOrders = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        try {
            setOrdersLoading(true);
            const res = await api.get("/order/myorders", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (res.data.success) {
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.error("fetchMyOrders error:", error);
            const msg = error.response?.data?.message || "Failed to load orders";
            toast.error(msg);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMyOrders();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    // Sync state when user loads in store
    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                setFormData({
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    address: user.address || "",
                    city: user.city || "",
                    zipCode: user.zipCode || "",
                    phoneNo: user.phoneNo || ""
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            toast.error("You are logged out");
            return;
        }

        try {
            setUpdatingProfile(true);
            const res = await api.put("/user/update", formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success("Profile updated successfully!");
                setActiveTab("orders"); // Go back to orders tab
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setUpdatingProfile(false);
        }
    };

    return (
        <div className="pb-16 min-h-screen bg-white dark:bg-slate-950">
            <PageHero
                badge="MY ACCOUNT"
                title="Your"
                gradientText="Profile"
                subtitle="Manage your personal information, shipping address, and order history."
                breadcrumbs={[{ label: "Home", to: "/" }, { label: "Profile", to: null }]}
                rightIcon={User}
            />
            <div className="max-w-5xl mx-auto px-6 pt-8">
                
                {/* Profile Header */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-2xs mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-extrabold text-2xl shadow-2xs">
                            {user?.firstName?.charAt(0).toUpperCase()}{user?.lastName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</h1>
                            <p className="text-sm text-slate-400 dark:text-slate-500">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-full uppercase">
                            Role: {user?.role}
                        </span>
                        {user?.role === "admin" && (
                            <Link to="/admin">
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 h-9 cursor-pointer gap-1.5">
                                    <Settings size={14} /> Admin Dashboard
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Profile Tabs Navigation */}
                <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-8 pb-px">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                            activeTab === "orders"
                                ? "border-purple-500 text-purple-600 dark:text-purple-400"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                    >
                        <ClipboardList size={16} /> My Orders
                    </button>
                    <button
                        onClick={() => setActiveTab("edit")}
                        className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                            activeTab === "edit"
                                ? "border-purple-500 text-purple-600 dark:text-purple-400"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                    >
                        <User size={16} /> Edit Profile Info
                    </button>
                </div>

                {/* Tab Contents */}
                {activeTab === "orders" && (
                    <div className="space-y-6">
                        {ordersLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
                                You haven't placed any orders yet.
                                <div className="mt-4">
                                    <Link to="/products">
                                        <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">Shop Products</Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order._id}
                                        className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono font-bold text-slate-400">#{order._id}</span>
                                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            
                                            {/* Order items preview string */}
                                            <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1 max-w-md">
                                                {order.orderItems?.map((item) => `${item.qty}x ${item.name}`).join(", ") || "No items"}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 border-t md:border-t-0 dark:border-slate-800 pt-3 md:pt-0 mt-3 md:mt-0">
                                            <div className="text-left md:text-right">
                                                <span className="text-xs text-slate-400 block font-medium">Total</span>
                                                <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">${Number(order.totalPrice || 0).toFixed(2)}</span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                                                    order.status === "Delivered"
                                                        ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                                                        : order.status === "Cancelled"
                                                        ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                                                        : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                                                }`}>
                                                    {order.status}
                                                </span>

                                                <Link to={`/order/${order._id}`}>
                                                    <Button variant="outline" className="text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer">
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "edit" && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-2xs">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Settings</h2>
                        
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName" className="dark:text-slate-300">First Name</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName" className="dark:text-slate-300">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" /> Shipping Destination Info
                                </h3>

                                <div className="grid gap-2">
                                    <Label htmlFor="address" className="dark:text-slate-300">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder="123 Street Name"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="city" className="dark:text-slate-300">City</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            placeholder="New York"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="zipCode" className="dark:text-slate-300">Zip Code</Label>
                                        <Input
                                            id="zipCode"
                                            name="zipCode"
                                            placeholder="10001"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phoneNo" className="dark:text-slate-300">
                                        <span className="flex items-center gap-2">
                                            <Phone size={14} className="text-slate-400" /> Phone Number
                                        </span>
                                    </Label>
                                    <Input
                                        id="phoneNo"
                                        name="phoneNo"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phoneNo}
                                        onChange={handleInputChange}
                                        className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={updatingProfile}
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold h-11 px-8 cursor-pointer w-full md:w-auto"
                            >
                                {updatingProfile ? "Updating..." : "Save Changes"}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
