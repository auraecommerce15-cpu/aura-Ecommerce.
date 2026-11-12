const PrivacyPolicy = () => {
    return (
        <div className="pt-28 pb-20 min-h-screen bg-slate-50/50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xs space-y-8">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2 block">
                            Legal & Compliance
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Privacy Policy
                        </h1>
                        <p className="text-xs text-slate-400 mt-2">Last updated: November 2026</p>
                    </div>

                    <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Information We Collect</h2>
                            <p>
                                At Aura Store, we collect information you provide directly to us when creating an account,
                                placing an order, subscribing to newsletters, or contacting our customer concierge. This includes
                                your name, email address, physical delivery address, and telephone number. Payment transaction
                                records are processed using encrypted tokenization protocols.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">2. How We Use Your Data</h2>
                            <p>
                                We utilize customer data strictly to fulfill order commitments, communicate delivery tracking
                                milestones, provide customer support, and safeguard our platform against fraudulent transactions.
                                We never monetize, sell, or lease your private personal information to third-party brokers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Data Security & Storage</h2>
                            <p>
                                We implement industry-standard cryptographic algorithms, salted password hashing, TLS encryption
                                for all network transmissions, and restricted role-based database access to defend your account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Your Rights & Deletion Requests</h2>
                            <p>
                                You retain full ownership of your data. You may review, modify, or request complete deletion
                                of your account profile and associated personal history at any time by contacting our privacy officer
                                at <span className="font-semibold text-slate-900">privacy@aurastore.com</span>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
