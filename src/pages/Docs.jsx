import React from 'react';
import { 
    Files, 
    Pen, 
    Image as ImageIcon, 
    ScanText, 
    ClipboardPaste, 
    UserSquare, 
    ShieldCheck, 
    Clock, 
    Layout as LayoutIcon,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import SEO from '../components/SEO';

const DocSection = ({ title, icon: Icon, description, steps, tips, useCases, color }) => (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
        <div className={`h-2 bg-${color}-500`} />
        <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-4 bg-${color}-50 rounded-2xl text-${color}-600`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        {description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div>
                            <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">
                                <ArrowRight className="w-4 h-4" /> How to use
                            </h3>
                            <ul className="space-y-4">
                                {steps.map((step, i) => (
                                    <li key={i} className="flex gap-3 text-gray-600">
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-${color}-50 text-${color}-600 flex items-center justify-center text-xs font-bold`}>
                                            {i + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {tips && (
                            <div>
                                <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Pro Tips
                                </h3>
                                <ul className="space-y-4">
                                    {tips.map((tip, i) => (
                                        <li key={i} className="flex gap-3 text-gray-600 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {useCases && (
                        <div className="mt-10 pt-10 border-t border-gray-50">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Perfect for:</h3>
                            <div className="flex flex-wrap gap-2">
                                {useCases.map((useCase, i) => (
                                    <span key={i} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-sm font-medium">
                                        {useCase}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </section>
);

const Docs = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <SEO
                title="User Guides & Documentation - Printing Tools"
                description="Learn how to use our privacy-focused printing tools. Step-by-step guides for PDF merging, invoice duplication, OCR, and more."
                url="/docs"
            />

            <header className="text-center mb-20">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                    Guides & <span className="text-blue-600">Documentation</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Everything you need to know about using Printing Tools. All tools run 100% in your browser—your data never leaves your device.
                </p>
                
                <div className="flex flex-wrap justify-center gap-8 mt-12">
                    <div className="flex items-center gap-2 text-gray-500">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium">100% Private</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">Instant Processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <LayoutIcon className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium">No Login Required</span>
                    </div>
                </div>
            </header>

            <DocSection 
                title="Invoice Duplicator"
                icon={Files}
                color="blue"
                description="Save paper by printing two A5 invoices on a single A4 sheet. This tool is specifically optimized for standard business invoices where only the top half contains data."
                steps={[
                    "Upload your A4 invoice (PDF or Image).",
                    "Use the 'Cut Position' slider to mark where the content ends.",
                    "The tool crops the top half and mirrors it to the bottom.",
                    "Download the final A4 PDF ready for your printer."
                ]}
                tips={[
                    "Use the live preview to ensure no text is cut off.",
                    "Higher resolution scans result in cleaner duplicates.",
                    "Works best with standard vertical A4 layouts."
                ]}
                useCases={["Retail Invoices", "Shipping Labels", "Payment Receipts", "Delivery Notes"]}
            />

            <DocSection 
                title="Passport Photo Maker"
                icon={UserSquare}
                color="red"
                description="Generate professional-grade passport and visa photos. Automatically removes backgrounds and tiles photos for standard photo paper sizes."
                steps={[
                    "Upload a clear portrait photo with good lighting.",
                    "AI automatically removes the background (this may take a few seconds).",
                    "Choose your background color (White, Blue, or custom).",
                    "Optional: Apply a digital suit overlay for a formal look.",
                    "Select your paper size (A4 or 4x6) and download."
                ]}
                tips={[
                    "Stand against a plain wall for the best AI removal results.",
                    "Ensure your face is well-lit and not covered by hair or shadows.",
                    "The suit overlay works best when your shoulders are level."
                ]}
                useCases={["Passport Applications", "Visa Documents", "ID Cards", "Student Licenses"]}
            />

            <DocSection 
                title="Text Extractor (OCR)"
                icon={ScanText}
                color="teal"
                description="Turn images and scanned documents into editable text using Optical Character Recognition. Built specifically for complex documents like bank cheques and receipts."
                steps={[
                    "Upload an image or a PDF page.",
                    "Wait for the OCR engine to analyze the document structure.",
                    "Edit the extracted text directly in the browser.",
                    "Copy the result or download as a text file."
                ]}
                tips={[
                    "Ensure the document is as flat and straight as possible.",
                    "Avoid blurry photos—OCR needs sharp edges to identify letters.",
                    "For cheques, the tool is optimized for IFSC and Account Number recognition."
                ]}
                useCases={["Cancelled Cheques", "Expense Receipts", "Scanned Notes", "Table Digitization"]}
            />

            <DocSection 
                title="E-Sign PDF"
                icon={Pen}
                color="green"
                description="A simple way to sign documents without printing. Add your signature as a drawing, text, or a pre-scanned image."
                steps={[
                    "Upload the document you need to sign.",
                    "Create your signature using the drawing pad or type tool.",
                    "Drag and drop your signature onto the correct line.",
                    "Resize it to match the document's scale.",
                    "Download the signed, flattened PDF."
                ]}
                tips={[
                    "Use a stylus for the most natural-looking hand-drawn signature.",
                    "The 'Save Signature' feature keeps your sign locally for future use.",
                    "Flattening ensures your signature cannot be easily moved or edited."
                ]}
                useCases={["NDAs", "Contract Agreements", "Consent Forms", "Application Forms"]}
            />

            <DocSection 
                title="Merge PDFs"
                icon={Files}
                color="purple"
                description="Combine multiple PDF files into one. Fast, secure, and preserves the original quality of your documents."
                steps={[
                    "Select all the PDF files you want to combine.",
                    "Drag the files to arrange them in the desired order.",
                    "Click 'Merge' to generate the combined document.",
                    "Preview the final file before downloading."
                ]}
                tips={[
                    "You can add more files even after the initial selection.",
                    "Large files are handled efficiently using stream processing.",
                    "Order matters! Ensure your cover page is at the top."
                ]}
                useCases={["Report Assembly", "Portfolio Creation", "Document Archiving"]}
            />

            <DocSection 
                title="Google Doc to Markdown"
                icon={ClipboardPaste}
                color="indigo"
                description="Easily convert rich text from Google Docs into clean Markdown or HTML. Specially designed to preserve formatting when moving content between web platforms."
                steps={[
                    "Copy your content directly from a Google Doc.",
                    "Paste it into the conversion area.",
                    "Switch between Markdown and HTML views.",
                    "Copy the clean code for your blog or notes app."
                ]}
                tips={[
                    "Maintains headings, lists, bold/italic, and links perfectly.",
                    "Great for pasting content into Samsung Notes or similar apps.",
                    "Removes unnecessary Google-specific styles while keeping structure."
                ]}
                useCases={["Blogging", "Note Taking", "Technical Documentation", "Cross-Platform Posting"]}
            />

            <section className="bg-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl shadow-blue-100 mt-20">
                <h2 className="text-3xl font-bold mb-4 text-white">Need Help or Found a Bug?</h2>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                    We're constantly improving these tools. If something isn't working or you have a suggestion, let us know on GitHub.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a 
                        href="https://github.com/sahajananddigital/printing-tools/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                        Report an Issue
                    </a>
                    <a 
                        href="https://github.com/sahajananddigital/printing-tools"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors"
                    >
                        Contribute Code
                    </a>
                </div>
            </section>
        </div>
    );
};

export default Docs;
