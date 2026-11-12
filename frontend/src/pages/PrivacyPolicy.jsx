import React from "react";
import { Shield } from "lucide-react";
import PageHero from "@/components/PageHero";

const PrivacyPolicy = () => {
    return (
        <div className="pb-20 min-h-screen bg-white dark:bg-slate-950">
            <PageHero
                badge="LEGAL"
                title="Privacy"
                gradientText="Policy"
                subtitle="How we collect, use, and protect your personal information at Aura Store."
                breadcrumbs={[{ label: "Home", to: "/" }, { label: "Privacy Policy", to: null }]}
                rightIcon={Shield}
            />
            <div className="max-w-4xl mx-auto px-6 pt-8">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-xs space-y-8">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 block">
                            Legal &amp; Compliance
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Privacy Policy
                        </h1>
                        <p className="text-xs text-slate-400 mt-2">Last updated: November 2026</p>
                    </div>

                    <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Information We Collect</h2>
                            <p>
                                At Aura Store, we collect information you provide directly to us when creating an account,
                                placing an order, subscribing to newsletters, or contacting our customer concierge. This includes
                                your name, email address, physical delivery address, and telephone number. Payment transaction
                                records are processed using encrypted tokenization protocols.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. How We Use Your Data</h2>
                            <p>
                                We utilize customer data strictly to fulfill order commitments, communicate delivery tracking
                                milestones, provide customer support, and safeguard our platform against fraudulent transactions.
                                We never monetize, sell, or lease your private personal information to third-party brokers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Data Security &amp; Storage</h2>
                            <p>
                                We implement industry-standard cryptographic algorithms, salted password hashing, TLS encryption
                                for all network transmissions, and restricted role-based database access to defend your account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Your Rights &amp; Deletion Requests</h2>
                            <p>
                                You retain full ownership of your data. You may review, modify, or request complete deletion
                                of your account profile and associated personal history at any time by contacting our privacy officer
                                at <span className="font-semibold text-slate-900 dark:text-white">privacy@aurastore.com</span>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
