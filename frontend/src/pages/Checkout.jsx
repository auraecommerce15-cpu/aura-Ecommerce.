import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "@/redux/cartSlice";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreditCard, ShieldCheck, Banknote, Tag, X } from "lucide-react";
import PageHero from "@/components/PageHero";

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);

    const [paymentMethod, setPaymentMethod] = useState("Card"); // "Card" or "Cash on Delivery"
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState("");

    const [shippingDetails, setShippingDetails] = useState({
        address: "",
        city: "",
        zipCode: "",
        phoneNo: ""
    });

    const [cardDetails, setCardDetails] = useState({
        cardholderName: "",
        cardNumber: "",
        expiry: "",
        cvv: ""
    });

    const [loading, setLoading] = useState(false);

    const handleShippingChange = (e) => {
        setShippingDetails({
            ...shippingDetails,
            [e.target.name]: e.target.value
        });
    };

    const handleCardChange = (e) => {
        setCardDetails({
            ...cardDetails,
            [e.target.name]: e.target.value
        });
    };

    // Calculate Prices with Coupon Discount
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const discountPrice = appliedCoupon === "AURA10" ? Number((itemsPrice * 0.10).toFixed(2)) : 0;
    const discountedBase = Math.max(0, itemsPrice - discountPrice);
    const shippingPrice = discountedBase === 0 || discountedBase > 50 ? 0 : 10;
    const taxPrice = Number((0.08 * discountedBase).toFixed(2));
    const totalPrice = Number((discountedBase + shippingPrice + taxPrice).toFixed(2));

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        const code = couponInput.trim().toUpperCase();
        if (!code) return;
        if (code === "AURA10") {
            setAppliedCoupon("AURA10");
            toast.success("Coupon AURA10 applied! 10% discount has been subtracted.");
        } else {
            toast.error("Invalid coupon code. Try 'AURA10' for 10% off!");
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon("");
        setCouponInput("");
        toast.info("Coupon removed.");
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        // Validations
        if (!shippingDetails.address || !shippingDetails.city || !shippingDetails.zipCode || !shippingDetails.phoneNo) {
            toast.error("Please fill in all shipping details");
            return;
        }

        if (paymentMethod === "Card") {
            if (!cardDetails.cardholderName || !cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
                toast.error("Please fill in all card details for payment authorization");
                return;
            }
        }

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            toast.error("Your session has expired. Please log in again");
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            const orderPayload = {
                orderItems: cartItems,
                shippingAddress: shippingDetails,
                paymentMethod,
                couponCode: appliedCoupon,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice
            };

            const res = await api.post("/order", orderPayload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.data.success) {
                toast.success(paymentMethod === "Cash on Delivery"
                    ? "Order placed successfully! Pay upon delivery."
                    : "Payment authorized! Order placed successfully."
                );
                dispatch(clearCart());
                navigate(`/order/${res.data.order._id}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="pt-28 pb-16 min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-center px-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Checkout is Empty</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">You have no items in your cart to checkout.</p>
                <Link to="/products">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">Shop Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-16 min-h-screen bg-white dark:bg-slate-950">
            <PageHero
                badge="SECURE CHECKOUT"
                title="Complete Your"
                gradientText="Order"
                subtitle="Secure, encrypted payment processing. Your data is always protected."
                breadcrumbs={[{ label: "Home", to: "/" }, { label: "Cart", to: "/cart" }, { label: "Checkout", to: null }]}
                rightIcon={CreditCard}
            />
            <div className="max-w-6xl mx-auto px-6 pt-8">
                <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left & Middle: Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Shipping Details */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Shipping Address</h2>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="address" className="dark:text-slate-300">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    placeholder="Apartment, suite, unit, building, street, etc."
                                    value={shippingDetails.address}
                                    onChange={handleShippingChange}
                                    required
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
                                        value={shippingDetails.city}
                                        onChange={handleShippingChange}
                                        required
                                        className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="zipCode" className="dark:text-slate-300">Zip Code</Label>
                                    <Input
                                        id="zipCode"
                                        name="zipCode"
                                        placeholder="10001"
                                        value={shippingDetails.zipCode}
                                        onChange={handleShippingChange}
                                        required
                                        className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phoneNo" className="dark:text-slate-300">Phone Number</Label>
                                <Input
                                    id="phoneNo"
                                    name="phoneNo"
                                    placeholder="+1 (555) 000-0000"
                                    value={shippingDetails.phoneNo}
                                    onChange={handleShippingChange}
                                    required
                                    className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-5">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Method</h2>
                                <span className="flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-50 dark:bg-green-950/40 px-2.5 py-1 rounded-full">
                                    <ShieldCheck size={14} /> 256-bit Encrypted
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("Card")}
                                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                                        paymentMethod === "Card"
                                            ? "border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 ring-2 ring-purple-500/20"
                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800"
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl ${paymentMethod === "Card" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900 dark:text-white">Credit / Debit Card</div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Instant online payment with mock verification</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("Cash on Delivery")}
                                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                                        paymentMethod === "Cash on Delivery"
                                            ? "border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 ring-2 ring-purple-500/20"
                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800"
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl ${paymentMethod === "Cash on Delivery" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                                        <Banknote size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900 dark:text-white">Cash on Delivery</div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pay in cash or card when your package arrives</p>
                                    </div>
                                </button>
                            </div>

                            {/* Card Details (Only if Card selected) */}
                            {paymentMethod === "Card" ? (
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="grid gap-2">
                                        <Label htmlFor="cardholderName" className="dark:text-slate-300">Cardholder Name</Label>
                                        <Input
                                            id="cardholderName"
                                            name="cardholderName"
                                            placeholder="John Doe"
                                            value={cardDetails.cardholderName}
                                            onChange={handleCardChange}
                                            required={paymentMethod === "Card"}
                                            className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="cardNumber" className="dark:text-slate-300">Card Number</Label>
                                        <div className="relative">
                                            <Input
                                                id="cardNumber"
                                                name="cardNumber"
                                                placeholder="4111 2222 3333 4444"
                                                maxLength={19}
                                                value={cardDetails.cardNumber}
                                                onChange={handleCardChange}
                                                required={paymentMethod === "Card"}
                                                className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                            />
                                            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="expiry" className="dark:text-slate-300">Expiry Date</Label>
                                            <Input
                                                id="expiry"
                                                name="expiry"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                value={cardDetails.expiry}
                                                onChange={handleCardChange}
                                                required={paymentMethod === "Card"}
                                                className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="cvv" className="dark:text-slate-300">CVV</Label>
                                            <Input
                                                id="cvv"
                                                name="cvv"
                                                type="password"
                                                placeholder="123"
                                                maxLength={4}
                                                value={cardDetails.cvv}
                                                onChange={handleCardChange}
                                                required={paymentMethod === "Card"}
                                                className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300 text-xs">
                                    <strong>Cash on Delivery (COD) Selected:</strong> No upfront payment is required now. You can inspect your package and pay the courier upon delivery.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Order Summary Checkout Sidebar */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-2xs h-fit space-y-6">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-4">
                            Review Items
                        </h3>

                        {/* Mini cart items list */}
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                            {cartItems.map((item) => (
                                <div key={item.product} className="flex gap-3 py-3 items-center">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-grow">
                                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</h4>
                                        <span className="text-xs text-slate-400">Qty: {item.qty}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">${(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Coupon Code Section */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Tag size={14} />
                                        <span className="font-bold">Code "{appliedCoupon}" Applied (-10%)</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-full text-purple-700 dark:text-purple-300 cursor-pointer"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Promo code (e.g. AURA10)"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        className="text-xs h-9 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs h-9 px-3 cursor-pointer"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        <div className="space-y-3.5 text-xs">
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span className="font-bold text-slate-850 dark:text-white">${itemsPrice.toFixed(2)}</span>
                            </div>
                            {discountPrice > 0 && (
                                <div className="flex justify-between text-purple-600 dark:text-purple-400 font-bold">
                                    <span>Discount (AURA10)</span>
                                    <span>-${discountPrice.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>Shipping</span>
                                <span className="font-bold text-slate-850 dark:text-white">
                                    {shippingPrice === 0 ? "FREE" : `$${shippingPrice.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>Tax (8%)</span>
                                <span className="font-bold text-slate-850 dark:text-white">${taxPrice.toFixed(2)}</span>
                            </div>
                            <hr className="border-slate-100 dark:border-slate-800" />
                            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white">
                                <span>Total Price</span>
                                <span className="text-xl font-black text-purple-600 dark:text-purple-400">${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl cursor-pointer"
                        >
                            {loading
                                ? "Processing Order..."
                                : paymentMethod === "Cash on Delivery"
                                ? `Place COD Order ($${totalPrice.toFixed(2)})`
                                : `Authorize & Pay $${totalPrice.toFixed(2)}`}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Checkout;
