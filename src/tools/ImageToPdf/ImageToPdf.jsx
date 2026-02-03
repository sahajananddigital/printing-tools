import React, { useState } from 'react';
import { ArrowLeft, Download, Image as ImageIcon, X, MoveUp, MoveDown, FileImage } from 'lucide-react';
import { Link } from 'react-router-dom';
import DropZone from '../../components/ui/DropZone';
import { convertImagesToPdf } from '../../utils/imageToPdf';
import SEO from '../../components/SEO';

const ImageToPdf = () => {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedPdfUrl, setProcessedPdfUrl] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (selectedFiles) => {
        // Filter for images only just in case
        const imageFiles = selectedFiles.filter(f => f.type.startsWith('image/'));

        if (imageFiles.length === 0 && selectedFiles.length > 0) {
            setError("Please select image files (JPG, PNG).");
            return;
        }

        setFiles(prev => [...prev, ...imageFiles]);

        // Generate previews
        const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setError(null);
    };

    const removeFile = (index) => {
        // Revoke the preview URL to avoid memory leaks
        URL.revokeObjectURL(previews[index]);

        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const moveFile = (index, direction) => {
        const newFiles = [...files];
        const newPreviews = [...previews];

        if (direction === 'up' && index > 0) {
            [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
            [newPreviews[index - 1], newPreviews[index]] = [newPreviews[index], newPreviews[index - 1]];
        } else if (direction === 'down' && index < newFiles.length - 1) {
            [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
            [newPreviews[index + 1], newPreviews[index]] = [newPreviews[index], newPreviews[index + 1]];
        }

        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const handleConvert = async () => {
        if (files.length === 0) {
            setError('Please select at least 1 image.');
            return;
        }

        setError(null);
        setIsProcessing(true);

        try {
            // Read files and prepare for util
            const images = await Promise.all(files.map(async (file) => ({
                buffer: await file.arrayBuffer(),
                type: file.type
            })));

            const pdfBytes = await convertImagesToPdf(images);
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setProcessedPdfUrl(url);
        } catch (err) {
            setError('Failed to convert images to PDF. Please try again.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setFiles([]);
        previews.forEach(url => URL.revokeObjectURL(url));
        setPreviews([]);
        setProcessedPdfUrl(null);
        setError(null);
        if (processedPdfUrl) {
            URL.revokeObjectURL(processedPdfUrl);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <SEO
                title="Image to PDF - Printing Tools"
                description="Convert JS, PNG images to PDF. Fast, free, and runs entirely in your browser."
                keywords="image to pdf, jpg to pdf, png to pdf, client-side, free pdf tools"
                url="/image-to-pdf"
            />

            <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Image to PDF</h1>
                <p className="text-gray-600 mt-2">
                    Convert multiple images into a single PDF document. Drag and drop to reorder.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">

                {files.length === 0 ? (
                    <DropZone onFileSelect={handleFileSelect} multiple={true} accept="image/*" />
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Selected Images ({files.length})</h3>
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
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(Array.from(e.target.files))}
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {files.map((file, index) => (
                                <div key={index} className="relative group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="aspect-square relative">
                                        <img
                                            src={previews[index]}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-white text-xs truncate">
                                            {file.name}
                                        </div>
                                    </div>

                                    <div className="absolute top-1 right-1 flex gap-1 bg-white/80 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => moveFile(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                                            title="Move Up"
                                        >
                                            <MoveUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveFile(index, 'down')}
                                            disabled={index === files.length - 1}
                                            className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                                            title="Move Down"
                                        >
                                            <MoveDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="p-1 text-gray-600 hover:text-red-500"
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
                                    onClick={handleConvert}
                                    disabled={isProcessing || files.length < 1}
                                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium shadow-sm"
                                >
                                    {isProcessing ? 'Converting...' : 'Convert to PDF'}
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
                                        download="images.pdf"
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download PDF
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
                                        title="Generated PDF Preview"
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

export default ImageToPdf;
