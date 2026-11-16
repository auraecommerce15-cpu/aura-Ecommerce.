import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity } from "@/redux/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const { t } = useLanguage();
    const { formatPrice } = useCurrency();

    const handleQtyChange = (product, qty, stock) => {
        if (qty < 1 || qty > stock) return;
        dispatch(updateQuantity({ product, qty }));
    };

    const handleRemove = (product, name) => {
        dispatch(removeFromCart(product));
        toast.error(`${name} removed from cart`);
    };

    // Calculate Prices in USD baseline
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice === 0 || itemsPrice > 50 ? 0 : 10;
    const taxPrice = Number((0.08 * itemsPrice).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const handleCheckout = () => {
        if (!user) {
            toast.warning("Please log in to proceed with checkout");
            navigate("/login?redirect=checkout");
        } else {
            navigate("/checkout");
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
                <PageHero
                    badge="AURA STORE"
                    title={t("cart.title")}
                    gradientText={t("cart.gradient")}
                    subtitle={t("cart.emptyDesc")}
                    breadcrumbs={[{ label: t("nav.home"), to: "/" }, { label: t("nav.cart"), to: null }]}
                    rightIcon={ShoppingCart}
                />
                <div className="py-20 flex flex-col items-center justify-center text-center px-6 flex-grow">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                        <ShoppingBag size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t("cart.empty")}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">{t("cart.emptyDesc")}</p>
                    <Link to="/products">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 h-11 font-bold shadow-md cursor-pointer">
                            {t("cart.browse")}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-16 min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
            <PageHero
                badge="AURA STORE"
                title={t("cart.title")}
                gradientText={t("cart.gradient")}
                subtitle="Review your selected items before proceeding to checkout."
                breadcrumbs={[{ label: t("nav.home"), to: "/" }, { label: t("nav.cart"), to: null }]}
                rightIcon={ShoppingCart}
            />

            <div className="max-w-6xl mx-auto px-6 pt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.product}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex-shrink-0"
                                />

                                <div className="flex-grow min-w-0">
                                    <Link
                                        to={`/product/${item.product}`}
                                        className="font-bold text-slate-800 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate block"
                                    >
                                        {item.name}
                                    </Link>
                                    <span className="text-sm font-black text-slate-950 dark:text-purple-300 block mt-1">{formatPrice(item.price)}</span>
                                </div>

                                {/* Qty picker */}
                                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                    <button
                                        onClick={() => handleQtyChange(item.product, item.qty - 1, item.stock)}
                                        className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="px-3 font-semibold text-slate-800 dark:text-slate-200 text-sm select-none">
                                        {item.qty}
                                    </span>
                                    <button
                                        onClick={() => handleQtyChange(item.product, item.qty + 1, item.stock)}
                                        className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleRemove(item.product, item.name)}
                                    className="text-slate-400 hover:text-red-500 p-2 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm h-fit space-y-6">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-4">
                            {t("cart.orderSummary")}
                        </h3>

                        <div className="space-y-3.5 text-sm">
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>{t("cart.subtotal")}</span>
                                <span className="font-bold text-slate-800 dark:text-white">{formatPrice(itemsPrice)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>{t("cart.shipping")}</span>
                                <span className="font-bold text-slate-800 dark:text-white">
                                    {shippingPrice === 0 ? t("cart.free") : formatPrice(shippingPrice)}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>{t("cart.tax")}</span>
                                <span className="font-bold text-slate-800 dark:text-white">{formatPrice(taxPrice)}</span>
                            </div>
                            <hr className="border-slate-100 dark:border-slate-800" />
                            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white">
                                <span>{t("cart.total")}</span>
                                <span className="text-xl font-black text-purple-600 dark:text-purple-400">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button
                                onClick={handleCheckout}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 rounded-xl cursor-pointer gap-2 shadow-md"
                            >
                                {t("cart.checkout")} <ArrowRight size={16} />
                            </Button>
                            <Link to="/products" className="block text-center text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline pt-2">
                                {t("cart.continue")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
