import React from 'react';
import { Link } from 'react-router-dom';
import { Files, ArrowRight } from 'lucide-react';

import SEO from '../components/SEO';

const Home = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <SEO
                title="Home"
                description="Free online printing tools. Crop and duplicate invoices, merge PDFs, and more. Client-side only for maximum privacy."
                keywords="invoice duplicator, printing tools, pdf crop, a4 duplicate"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Tools</h1>
            <p className="text-gray-600 mb-8">Select a tool to get started.</p>

            <div className="grid md:grid-cols-2 gap-6">
                <Link
                    to="/invoice-duplicator"
                    className="block p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <Files className="w-6 h-6" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Duplicator</h3>
                    <p className="text-gray-600 text-sm">
                        Take a standard A4 invoice, crop the top half, and duplicate it to the bottom half to print two copies on one sheet.
                    </p>
                </Link>
            </div>
        </div>
    );
};

export default Home;
