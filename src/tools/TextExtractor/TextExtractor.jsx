import React, { useState } from 'react';
import { ArrowLeft, Download, Copy, Check, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DropZone from '../../components/ui/DropZone';
import { extractText } from '../../utils/textExtractor';
import SEO from '../../components/SEO';

const TextExtractor = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressDetail, setProgressDetail] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleFileSelect = (selectedFile) => {
        // Accept single file
        const f = Array.isArray(selectedFile) ? selectedFile[0] : selectedFile;

        if (!f) return;

        // Validate file type
        if (!f.type.startsWith('image/') && f.type !== 'application/pdf') {
            setError('Please upload an image (JPG, PNG) or PDF file.');
            return;
        }

        setFile(f);
        setError(null);
        setExtractedText('');
        setProgress(0);
        setProgressDetail('');

        // Generate preview for images
        if (f.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(f));
        } else {
            setPreview(null);
        }
    };

    const handleExtract = async () => {
        if (!file) return;

        setError(null);
        setIsProcessing(true);
        setProgress(0);
        setExtractedText('');

        try {
            const result = await extractText(file, (progressInfo) => {
                if (typeof progressInfo === 'number') {
                    setProgress(progressInfo);
                    setProgressDetail('Recognizing text...');
                } else {
                    // PDF with page info
                    const { page, totalPages, progress: pageProgress } = progressInfo;
                    const overallProgress = Math.round(((page - 1) / totalPages + pageProgress / 100 / totalPages) * 100);
                    setProgress(overallProgress);
                    setProgressDetail(`Processing page ${page} of ${totalPages}...`);
                }
            });

            setExtractedText(result.text);
        } catch (err) {
            console.error(err);
            setError('Failed to extract text. Please try again with a clearer image.');
        } finally {
            setIsProcessing(false);
            setProgress(100);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(extractedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([extractedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name.replace(/\.[^/.]+$/, '')}_extracted.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
        setExtractedText('');
        setError(null);
        setProgress(0);
        setProgressDetail('');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <SEO
                title="Text Extractor (OCR) - Printing Tools"
                description="Extract text from images and PDFs using OCR. Fast, free, and runs entirely in your browser."
                keywords="ocr, text extraction, image to text, pdf to text, tesseract, client-side"
                url="/text-extractor"
            />

            <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Text Extractor (OCR)</h1>
                <p className="text-gray-600 mt-2">
                    Upload an image or PDF to extract text. Works great for documents, cheques, receipts, and more.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                {!file ? (
                    <DropZone
                        onFileSelect={handleFileSelect}
                        multiple={false}
                        accept="image/*,application/pdf"
                    />
                ) : (
                    <div className="space-y-6">
                        {/* File Info */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleReset}
                                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        {/* Image Preview */}
                        {preview && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-64 mx-auto object-contain"
                                />
                            </div>
                        )}

                        {/* Extract Button */}
                        {!extractedText && !isProcessing && (
                            <button
                                onClick={handleExtract}
                                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                            >
                                Extract Text
                            </button>
                        )}

                        {/* Progress */}
                        {isProcessing && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                    <span className="text-gray-700">{progressDetail || 'Initializing OCR...'}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 text-center">{progress}% complete</p>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Extracted Text */}
                        {extractedText && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Extracted Text</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCopy}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4 text-green-600" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                </div>

                                <textarea
                                    readOnly
                                    value={extractedText}
                                    className="w-full h-64 p-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-mono text-sm resize-y"
                                />

                                <button
                                    onClick={handleReset}
                                    className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Extract Another Document
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tips for best results:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use high-resolution images with clear, legible text</li>
                    <li>• Ensure good lighting and contrast in photos</li>
                    <li>• Straighten tilted documents before uploading</li>
                    <li>• Works best with printed text (handwriting may vary)</li>
                </ul>
            </div>
        </div>
    );
};

export default TextExtractor;
