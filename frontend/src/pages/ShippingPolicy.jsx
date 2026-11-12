const ShippingPolicy = () => {
    return (
        <div className="pt-28 pb-20 min-h-screen bg-slate-50/50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xs space-y-8">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2 block">
                            Global Logistics
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Shipping Policy
                        </h1>
                        <p className="text-xs text-slate-400 mt-2">Fast, Insured & Tracked Express Delivery</p>
                    </div>

                    <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Delivery Rates & Free Shipping</h2>
                            <p>
                                We offer complimentary standard shipping on all orders totaling $50 or more. For orders below $50,
                                a flat shipping fee of $10 is applied at checkout. Express priority options are available upon request.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Processing & Dispatch Timeline</h2>
                            <p>
                                All in-stock items are packaged in tamper-evident luxury parcels and dispatched within 24 to 48 hours
                                of order confirmation. Orders placed over weekends or holidays are dispatched the following business day.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Tracking & Carrier Insurance</h2>
                            <p>
                                Every shipment carries complete transit insurance against damage or loss. You will receive an automated
                                email containing an active tracking code as soon as your shipment departs our fulfillment center.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;
