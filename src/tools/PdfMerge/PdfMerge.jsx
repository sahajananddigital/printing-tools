import React, { useState } from 'react';
import { ArrowLeft, Download, RefreshCw, FileText, X, MoveUp, MoveDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import DropZone from '../../components/ui/DropZone';
import { mergePdfs } from '../../utils/pdfMerger';
import SEO from '../../components/SEO';

const PdfMerge = () => {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedPdfUrl, setProcessedPdfUrl] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (selectedFiles) => {
        // DropZone now returns an array when multiple is true
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const moveFile = (index, direction) => {
        const newFiles = [...files];
        if (direction === 'up' && index > 0) {
            [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
        } else if (direction === 'down' && index < newFiles.length - 1) {
            [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
        }
        setFiles(newFiles);
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            setError('Please select at least 2 PDF files to merge.');
            return;
        }

        setError(null);
        setIsProcessing(true);

        try {
            // Convert Files to ArrayBuffers
            const buffers = await Promise.all(files.map(f => f.arrayBuffer()));
            const mergedBytes = await mergePdfs(buffers);

            const blob = new Blob([mergedBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setProcessedPdfUrl(url);
        } catch (err) {
            setError('Failed to merge PDFs. Please try again.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setFiles([]);
        setProcessedPdfUrl(null);
        setError(null);
        if (processedPdfUrl) {
            URL.revokeObjectURL(processedPdfUrl);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <SEO
                title="Merge PDF files - Printing Tools"
                description="Combine multiple PDF files into one. Fast, free, and runs entirely in your browser."
                keywords="merge pdf, combine pdf, pdf joiner, client-side, free pdf tools"
                url="/pdf-merge"
            />

            <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Merge PDFs</h1>
                <p className="text-gray-600 mt-2">
                    Combine multiple PDF files into one document. Drag and drop to reorder.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">

                {files.length === 0 ? (
                    <DropZone onFileSelect={handleFileSelect} multiple={true} />
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Selected Files ({files.length})</h3>
                            <button
                                onClick={() => document.getElementById('add-more-input').click()}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                + Add more
                            </button>
                            <input
                                type="file"
                                id="add-more-input"
                                multiple
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => handleFileSelect(Array.from(e.target.files))}
                            />
                        </div>

                        <div className="space-y-3">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                                    <div className="p-2 bg-white rounded shadow-sm mr-3">
                                        <FileText className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="flex-1 truncate">
                                        <span className="text-gray-900 text-sm font-medium">{file.name}</span>
                                        <span className="text-gray-500 text-xs ml-2">{(file.size / 1024).toFixed(0)} KB</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => moveFile(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                            title="Move Up"
                                        >
                                            <MoveUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveFile(index, 'down')}
                                            disabled={index === files.length - 1}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                            title="Move Down"
                                        >
                                            <MoveDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="p-1 text-gray-400 hover:text-red-500 ml-2"
                                            title="Remove"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!processedPdfUrl && (
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleMerge}
                                    disabled={isProcessing || files.length < 2}
                                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium shadow-sm"
                                >
                                    {isProcessing ? 'Merging...' : 'Merge PDFs'}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {processedPdfUrl && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <a
                                        href={processedPdfUrl}
                                        download="merged-document.pdf"
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Merged PDF
                                    </a>
                                    <button
                                        onClick={handleReset}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Start Over
                                    </button>
                                </div>
                                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                    <iframe
                                        src={processedPdfUrl}
                                        className="w-full h-[600px]"
                                        title="Merged PDF Preview"
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

export default PdfMerge;
