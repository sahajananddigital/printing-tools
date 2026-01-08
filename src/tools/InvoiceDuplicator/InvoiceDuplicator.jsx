import React, { useState } from 'react';
import { ArrowLeft, Download, RefreshCw, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import DropZone from '../../components/ui/DropZone';
import { duplicateInvoice } from '../../utils/pdfProcessor';

const InvoiceDuplicator = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedPdfUrl, setProcessedPdfUrl] = useState(null);
    const [error, setError] = useState(null);

    const [splitPercentage, setSplitPercentage] = useState(50);

    const handleFileSelect = async (selectedFile) => {
        // If we have a file already and user just changes slider, we might want to re-process?
        // For now, let's keep the flow simple: Upload -> Process.
        // But better: Store file in state, and have a "Process" button or auto-process when slider changes?
        // Let's autoset the file then call process.
        setFile(selectedFile);
        processFile(selectedFile, splitPercentage);
    };

    const processFile = async (currentFile, split) => {
        setError(null);
        setProcessedPdfUrl(null);
        setIsProcessing(true);

        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const processedBytes = await duplicateInvoice(arrayBuffer, split);

            const blob = new Blob([processedBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setProcessedPdfUrl(url);
        } catch (err) {
            setError('Failed to process PDF. Please try again.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSliderChange = (e) => {
        const newVal = parseInt(e.target.value);
        setSplitPercentage(newVal);
        // If file is already loaded, re-process
        if (file) {
            processFile(file, newVal);
        }
    };

    const handleReset = () => {
        setFile(null);
        setProcessedPdfUrl(null);
        setError(null);
        setSplitPercentage(50);
        if (processedPdfUrl) {
            URL.revokeObjectURL(processedPdfUrl);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Invoice Duplicator</h1>
                <p className="text-gray-600 mt-2">
                    Upload an A4 invoice. Adjust the cut position to remove empty space at the bottom of the invoice.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">

                <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Cut Position (Length of Original Invoice): {splitPercentage}%
                    </label>
                    <input
                        type="range"
                        min="25"
                        max="75"
                        value={splitPercentage}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Drag left to crop more empty space from the bottom. Default is 50% (half page).
                    </p>
                </div>

                {!file ? (
                    <DropZone onFileSelect={handleFileSelect} />
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="p-3 bg-white rounded-md shadow-sm mr-4">
                                <FileCheck className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{file.name}</h4>
                                <p className="text-sm text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                onClick={handleReset}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                title="Reset"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {isProcessing && (
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-gray-600">Processing your PDF...</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                                {error}
                            </div>
                        )}

                        {processedPdfUrl && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <a
                                        href={processedPdfUrl}
                                        download={`processed-${file.name}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Processed PDF
                                    </a>
                                    <button
                                        onClick={handleReset}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Process Another File
                                    </button>
                                </div>

                                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                    <iframe
                                        src={processedPdfUrl}
                                        className="w-full h-[600px]"
                                        title="PDF Preview"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceDuplicator;
