const Terms = () => {
    return (
        <div className="pt-28 pb-20 min-h-screen bg-slate-50/50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xs space-y-8">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2 block">
                            Terms of Service
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Terms & Conditions
                        </h1>
                        <p className="text-xs text-slate-400 mt-2">Effective: November 2026</p>
                    </div>

                    <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Agreement to Terms</h2>
                            <p>
                                By accessing or purchasing from Aura Store, you agree to be bound by these Terms and Conditions.
                                All products listed on Aura represent authentic, verified luxury consumer electronics.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Orders and Pricing</h2>
                            <p>
                                We strive to provide accurate pricing and real-time inventory counts. In the event of a technical
                                catalog discrepancy or inadvertent pricing error, Aura reserves the right to cancel or adjust
                                the affected order with prompt notification and full reimbursement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Payment Methods</h2>
                            <p>
                                We accept authorized Credit / Debit Cards and Cash on Delivery (COD) for eligible regions.
                                All card transactions are verified through encrypted payment gateways.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">4. User Accounts</h2>
                            <p>
                                You are responsible for preserving the confidentiality of your login credentials and preventing
                                unauthorized access to your account.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
