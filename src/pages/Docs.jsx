import React from 'react';
import SEO from '../components/SEO';

const Docs = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <SEO
                title="Documentation - Printing Tools"
                description="Documentation and user guides for Printing Tools."
                url="/docs"
            />

            <h1 className="text-3xl font-bold text-gray-900 mb-6">Documentation</h1>

            <div className="space-y-8">
                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice Duplicator</h2>
                    <p className="text-gray-600 mb-4">
                        The Invoice Duplicator tool is designed to save paper by allowing you to print two copies of a half-page invoice on a single A4 sheet.
                    </p>
                    <h3 className="font-semibold text-gray-900 mb-2">How to use:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Upload your A4 invoice PDF.</li>
                        <li>Adjust the "Cut Position" slider to crop the bottom empty space.</li>
                        <li>The tool will automatically duplicate the top portion to the bottom.</li>
                        <li>Download and print.</li>
                    </ul>
                </section>

                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Merge PDFs</h2>
                    <p className="text-gray-600 mb-4">
                        Combine multiple PDF documents into a single file.
                    </p>
                    <h3 className="font-semibold text-gray-900 mb-2">How to use:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Upload multiple PDF files.</li>
                        <li>Drag and drop to reorder them.</li>
                        <li>Click "Merge PDFs" to combine them.</li>
                    </ul>
                </section>

                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Image to PDF</h2>
                    <p className="text-gray-600 mb-4">
                        Convert your images into a PDF document.
                    </p>
                    <h3 className="font-semibold text-gray-900 mb-2">How to use:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Upload JPG or PNG images.</li>
                        <li>Reorder images as needed.</li>
                        <li>Click "Convert to PDF".</li>
                        <li>All images will be centered on A4 pages.</li>
                    </ul>
                </section>

                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">E-Sign PDF</h2>
                    <p className="text-gray-600 mb-4">
                        Sign PDF documents directly in your browser.
                    </p>
                    <h3 className="font-semibold text-gray-900 mb-2">How to use:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Upload a PDF.</li>
                        <li>Draw your signature, type it, or upload an image.</li>
                        <li>Place the signature on the document.</li>
                        <li>Download the signed PDF.</li>
                    </ul>
                </section>

                <section className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                    <p>
                        <strong>Privacy Note:</strong> All processing happens in your browser. Your files are never uploaded to any server.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Docs;
