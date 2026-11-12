const ReturnsPolicy = () => {
    return (
        <div className="pt-28 pb-20 min-h-screen bg-slate-50/50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xs space-y-8">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2 block">
                            Guarantee & Peace of Mind
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Returns & Refund Policy
                        </h1>
                        <p className="text-xs text-slate-400 mt-2">30-Day Hassle-Free Guarantee</p>
                    </div>

                    <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">1. 30-Day Return Window</h2>
                            <p>
                                If you are not completely satisfied with your purchase, you may initiate a return within 30 days
                                of confirmed delivery. Items must remain in brand-new condition, with original packaging, warranty
                                cards, and accompanying accessories intact.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Return Procedure</h2>
                            <p>
                                To request a return, navigate to your Orders history in your Profile or reach out to our support team
                                at <span className="font-semibold text-slate-900">support@aurastore.com</span> with your order number.
                                We will provide a prepaid shipping label and instructions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Refund Processing</h2>
                            <p>
                                Once the returned item is inspected at our fulfillment center, your refund will be processed to your
                                original payment method within 3 to 5 business days. Cash on delivery orders will receive a direct
                                electronic bank transfer or store credit based on customer preference.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnsPolicy;
