import React, { useState, useRef } from 'react';
import { ArrowLeft, Download, RefreshCw, Pen, Type, Image as ImageIcon, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import Draggable from 'react-draggable';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import DropZone from '../../components/ui/DropZone';
import { signPdf } from '../../utils/pdfSigner';
import SEO from '../../components/SEO';

// Configure PDF Worker
// Use local worker from node_modules via URL constructor for Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const fonts = [
    { name: 'Dancing Script', label: 'Artistic' },
    { name: 'Great Vibes', label: 'Elegant' },
    { name: 'Sacramento', label: 'Casual' },
];

const PdfSign = () => {
    const [file, setFile] = useState(null);
    const [signatureMode, setSignatureMode] = useState('draw'); // draw, type, upload
    const [typedText, setTypedText] = useState('');
    const [selectedFont, setSelectedFont] = useState(fonts[0].name);
    const [uploadedSignature, setUploadedSignature] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedPdfUrl, setProcessedPdfUrl] = useState(null);
    const [error, setError] = useState(null);

    // PDF Preview State
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 });
    const pdfWrapperRef = useRef(null);

    // Signature State
    const sigCanvasRef = useRef(null);
    const [previewSignature, setPreviewSignature] = useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
    };

    const handleUploadSignature = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                setUploadedSignature(evt.target.result);
                setPreviewSignature(evt.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // Draggable ref for React 19 compatibility (avoids findDOMNode)
    const draggableRef = useRef(null);

    // Update preview when mode or related data changes
    React.useEffect(() => {
        updatePreview();
    }, [signatureMode, typedText, selectedFont, uploadedSignature]);

    const updatePreview = () => {
        if (signatureMode === 'draw') {
            if (sigCanvasRef.current && sigCanvasRef.current.isEmpty && !sigCanvasRef.current.isEmpty()) {
                // Use standard toDataURL to avoid import_trim_canvas error
                // If trimming is needed, we can implement a custom trim function later
                const canvas = sigCanvasRef.current.getCanvas();
                setPreviewSignature(canvas.toDataURL('image/png'));
            } else {
                setPreviewSignature(null);
            }
        } else if (signatureMode === 'type') {
            if (!typedText) {
                setPreviewSignature(null);
                return;
            }
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = `60px "${selectedFont}"`;
            const width = ctx.measureText(typedText).width + 40;
            canvas.width = width;
            canvas.height = 100;
            ctx.font = `60px "${selectedFont}"`;
            ctx.fillStyle = 'black';
            ctx.textBaseline = 'middle';
            ctx.fillText(typedText, 20, 50);
            setPreviewSignature(canvas.toDataURL('image/png'));
        } else if (signatureMode === 'upload') {
            setPreviewSignature(uploadedSignature);
        }
    };

    const handleSign = async () => {
        if (!previewSignature) {
            setError('Please create or upload a signature first.');
            return;
        }

        setError(null);
        setIsProcessing(true);

        try {
            const buffer = await file.arrayBuffer();

            // Coordinate Calculation
            const pdfLayer = pdfWrapperRef.current?.querySelector('.react-pdf__Page');
            if (!pdfLayer) throw new Error("Could not find PDF preview layer");

            const renderedWidth = pdfLayer.offsetWidth;
            const renderedHeight = pdfLayer.offsetHeight;

            // Signature position
            const { x: domX, y: domY } = signaturePosition;

            // Calculate normalized position (0.0 to 1.0)
            const normX = domX / renderedWidth;
            const normY = domY / renderedHeight; // From TOP

            await new Promise(r => setTimeout(r, 100)); // UI flush

            const signedPdfBytes = await signPdf(buffer, previewSignature, {
                pageIndex: pageNumber - 1,
                normX,
                normY,
                renderedWidth,
                renderedHeight
            });

            const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setProcessedPdfUrl(url);
        } catch (err) {
            setError('Failed to sign PDF. Please try again.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setProcessedPdfUrl(null);
        setError(null);
        setUploadedSignature(null);
        setPreviewSignature(null);
        setTypedText('');
        if (processedPdfUrl) {
            URL.revokeObjectURL(processedPdfUrl);
        }
    };

    const clearCanvas = () => {
        sigCanvasRef.current.clear();
        setPreviewSignature(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <SEO
                title="E-Sign PDF - Printing Tools"
                description="Sign your PDF documents online for free. Draw, type, or upload your signature. Client-side secure processing."
                keywords="sign pdf, e-sign, digital signature, free pdf signer, draw signature"
                url="/pdf-sign"
            />
            <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">E-Sign PDF</h1>
                <p className="text-gray-600 mt-2">
                    Upload a PDF and add your signature. Draw, type, or upload an image.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                {!file ? (
                    <DropZone onFileSelect={handleFileSelect} />
                ) : (
                    <div className="space-y-8">
                        {/* File Info */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-3 bg-white rounded-md shadow-sm mr-4">
                                    <FileText className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{file.name}</h4>
                                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button onClick={handleReset} className="text-gray-400 hover:text-gray-600">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {!processedPdfUrl ? (
                            <div className="border rounded-xl overflow-hidden">
                                {/* Signature Tabs */}
                                <div className="flex border-b bg-gray-50">
                                    <button
                                        onClick={() => setSignatureMode('draw')}
                                        className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 ${signatureMode === 'draw' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Pen className="w-4 h-4" /> Draw
                                    </button>
                                    <button
                                        onClick={() => setSignatureMode('type')}
                                        className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 ${signatureMode === 'type' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Type className="w-4 h-4" /> Type
                                    </button>
                                    <button
                                        onClick={() => setSignatureMode('upload')}
                                        className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 ${signatureMode === 'upload' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <ImageIcon className="w-4 h-4" /> Upload
                                    </button>
                                </div>

                                {/* Signature Inputs */}
                                <div className="p-6 bg-white min-h-[300px] flex flex-col justify-center">
                                    {signatureMode === 'draw' && (
                                        <div className="flex flex-col items-center">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg w-full max-w-md h-40 bg-gray-50 relative">
                                                <SignatureCanvas
                                                    ref={sigCanvasRef}
                                                    penColor="black"
                                                    canvasProps={{ className: 'w-full h-full rounded-lg' }}
                                                    onEnd={updatePreview}
                                                />
                                                <button onClick={clearCanvas} className="absolute top-2 right-2 text-xs text-gray-400 hover:text-red-500">Clear</button>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">Sign within the box above</p>
                                        </div>
                                    )}

                                    {signatureMode === 'type' && (
                                        <div className="w-full max-w-md mx-auto space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Type your name"
                                                value={typedText}
                                                onChange={(e) => setTypedText(e.target.value)}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                            <div className="grid grid-cols-3 gap-2">
                                                {fonts.map((f) => (
                                                    <button
                                                        key={f.name}
                                                        onClick={() => setSelectedFont(f.name)}
                                                        className={`p-2 border rounded text-lg text-center truncate ${selectedFont === f.name ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                                        style={{ fontFamily: f.name }}
                                                    >
                                                        Signature
                                                    </button>
                                                ))}
                                            </div>
                                            {typedText && (
                                                <div className="p-8 border border-gray-100 rounded-lg bg-white shadow-sm text-center">
                                                    <span className="text-4xl text-gray-800" style={{ fontFamily: selectedFont }}>
                                                        {typedText}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {signatureMode === 'upload' && (
                                        <div className="text-center">
                                            {!uploadedSignature ? (
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md mx-auto hover:bg-gray-50 transition-colors">
                                                    <input type="file" accept="image/*" onChange={handleUploadSignature} className="hidden" id="sig-upload" />
                                                    <label htmlFor="sig-upload" className="cursor-pointer flex flex-col items-center">
                                                        <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                                                        <span className="text-blue-600 font-medium">Click to upload signature image</span>
                                                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, Transparent BG recommended</span>
                                                    </label>
                                                </div>
                                            ) : (
                                                <div className="relative inline-block border rounded-lg p-2">
                                                    <img src={uploadedSignature} alt="Uploaded Signature" className="max-h-40 mx-auto" />
                                                    <button onClick={() => setUploadedSignature(null)} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow border p-1 hover:bg-red-50">
                                                        <RefreshCw className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Drag & Drop Preview Section */}
                                <div className="p-4 bg-gray-100 border-t flex flex-col items-center">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                                        Drag the signature to position it. Current Page: {pageNumber} of {numPages}
                                    </h3>

                                    <div className="relative border shadow-lg bg-white" ref={pdfWrapperRef}>
                                        <Document
                                            file={file}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                            className="mx-auto"
                                        >
                                            <Page
                                                pageNumber={pageNumber}
                                                width={Math.min(600, window.innerWidth - 40)}
                                            />
                                        </Document>

                                        {/* Draggable Signature Overlay */}
                                        {previewSignature && (
                                            <Draggable
                                                bounds="parent"
                                                onStop={(e, data) => setSignaturePosition({ x: data.x, y: data.y })}
                                                defaultPosition={{ x: 50, y: 50 }}
                                                nodeRef={draggableRef}
                                            >
                                                <div
                                                    ref={draggableRef}
                                                    className="absolute top-0 left-0 cursor-move border-2 border-blue-500 border-dashed hover:border-solid bg-blue-50/30"
                                                    style={{ zIndex: 10 }}
                                                >
                                                    <img
                                                        src={previewSignature}
                                                        alt="Signature"
                                                        className="h-16 pointer-events-none"
                                                    />
                                                </div>
                                            </Draggable>
                                        )}
                                    </div>

                                    {/* Pagination Controls */}
                                    {numPages > 1 && (
                                        <div className="flex items-center gap-4 mt-4">
                                            <button
                                                disabled={pageNumber <= 1}
                                                onClick={() => setPageNumber(prev => prev - 1)}
                                                className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-600">
                                                Page {pageNumber} of {numPages}
                                            </span>
                                            <button
                                                disabled={pageNumber >= numPages}
                                                onClick={() => setPageNumber(prev => prev + 1)}
                                                className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-6 w-full flex justify-end">
                                        <button
                                            onClick={handleSign}
                                            disabled={isProcessing}
                                            className="py-2.5 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium shadow-sm flex items-center gap-2"
                                        >
                                            {isProcessing ? 'Signing...' : 'Sign & Download'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <a
                                        href={processedPdfUrl}
                                        download={`signed-${file.name}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Signed PDF
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
                                        title="Signed PDF Preview"
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfSign;
