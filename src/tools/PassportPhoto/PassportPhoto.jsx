import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Image as ImageIcon, X, Loader2, User, Palette, Square, Layout, Check, Shirt, Crop } from 'lucide-react';
import { Link } from 'react-router-dom';
import DropZone from '../../components/ui/DropZone';
import SEO from '../../components/SEO';
import { removeBackground } from '@imgly/background-removal';
import { generatePassportPhotoPdf } from '../../utils/passportPhoto';
import Draggable from 'react-draggable';
import Cropper from 'react-easy-crop';

const PAPER_SIZES = [
    { id: 'a4', label: 'A4 Paper', width: 210, height: 297 },
    { id: 'a5', label: 'A5 Paper', width: 148, height: 210 },
    { id: '4x6', label: '4" x 6" (Standard Photo Paper)', width: 101.6, height: 152.4 }
];

const PHOTO_SIZES = [
    { id: 'standard', label: '35mm x 45mm (Standard)', width: 35, height: 45 },
    { id: 'us', label: '2" x 2" (USA)', width: 50.8, height: 50.8 }
];

const BACKGROUND_COLORS = [
    { name: 'None', value: 'transparent' },
    { name: 'White', value: '#ffffff' },
    { name: 'Blue', value: '#0047bb' },
    { name: 'Light Blue', value: '#a1c4fd' },
    { name: 'Red', value: '#ff0000' }
];

// Simple suit overlay (transparent PNG base64 - simplified placeholder)
const SUIT_OVERLAYS = [
    { id: 'none', label: 'No Suit' },
    { id: 'suit1', label: 'Formal Suit', url: 'https://img.icons8.com/color/512/suit.png' } // Using a placeholder URL for now
];

const PassportPhoto = () => {
    const [originalImage, setOriginalImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    const [bgColor, setBgColor] = useState('#ffffff');
    const [paperSize, setPaperSize] = useState('a4');
    const [photoSize, setPhotoSize] = useState('standard');
    const [isProcessing, setIsProcessing] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [error, setError] = useState(null);
    const [showSuit, setShowSuit] = useState(false);
    const [, setSuitPosition] = useState({ x: 0, y: 0 });
    const [suitScale, setSuitScale] = useState(1);
    
    // Cropping state
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    
    const previewCanvasRef = useRef(null);
    const suitRef = useRef(null);

    const handleFileSelect = (selectedFiles) => {
        const file = Array.isArray(selectedFiles) ? selectedFiles[0] : selectedFiles;
        
        if (file) {
            const url = URL.createObjectURL(file);
            setOriginalImage(url);
            setProcessedImage(url);
            setPdfUrl(null);
            setError(null);
            // Auto-open cropper for better UX
            setIsCropping(true);
        }
    };

    const handleRemoveBackground = async () => {
        if (!processedImage) return;
        
        setIsRemovingBg(true);
        setError(null);
        
        try {
            // Try both common CDNs if one fails
            const cdns = [
                'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
                'https://static.imgly.com/packages/@imgly/background-removal-data/1.7.0/dist/'
            ];
            
            let blob;
            let lastErr;
            
            for (const cdn of cdns) {
                try {
                    blob = await removeBackground(processedImage, {
                        publicPath: cdn,
                        debug: true
                    });
                    if (blob) break;
                } catch (e) {
                    lastErr = e;
                    console.warn(`Failed to fetch from ${cdn}, trying next...`);
                }
            }
            
            if (!blob) throw lastErr || new Error("Failed to remove background from all sources.");

            const url = URL.createObjectURL(blob);
            setProcessedImage(url);
        } catch (err) {
            console.error("Background removal error:", err);
            setError("Background removal failed. You can still use the manual crop tool.");
        } finally {
            setIsRemovingBg(false);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createCroppedImage = async () => {
        try {
            const canvas = document.createElement('canvas');
            const img = new Image();
            img.src = originalImage;
            await new Promise(resolve => img.onload = resolve);

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                img,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            const croppedDataUrl = canvas.toDataURL('image/jpeg');
            setProcessedImage(croppedDataUrl);
            setIsCropping(false);
        } catch (e) {
            console.error(e);
            setError("Failed to crop image.");
        }
    };

    const drawPreview = useCallback(() => {
        const canvas = previewCanvasRef.current;
        if (!canvas || !processedImage) return;

        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = processedImage;
        
        img.onload = () => {
            const selectedPhotoSize = PHOTO_SIZES.find(s => s.id === photoSize);
            const ratio = selectedPhotoSize.width / selectedPhotoSize.height;
            
            canvas.width = 400;
            canvas.height = 400 / ratio;

            // Fill background
            if (bgColor === 'transparent') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw photo (cropped/fitted)
            const imgRatio = img.width / img.height;
            let drawW, drawH, drawX, drawY;

            if (imgRatio > ratio) {
                drawH = canvas.height;
                drawW = canvas.height * imgRatio;
                drawX = (canvas.width - drawW) / 2;
                drawY = 0;
            } else {
                drawW = canvas.width;
                drawH = canvas.width / imgRatio;
                drawX = 0;
                drawY = (canvas.height - drawH) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
        };
    }, [processedImage, photoSize, bgColor]);

    useEffect(() => {
        if (processedImage) {
            drawPreview();
        }
    }, [processedImage, drawPreview]);

    const handleGeneratePdf = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const canvas = document.createElement('canvas');
            const selectedPhotoSize = PHOTO_SIZES.find(s => s.id === photoSize);
            const scale = 11.81; // 300 DPI
            canvas.width = selectedPhotoSize.width * scale;
            canvas.height = selectedPhotoSize.height * scale;
            
            const ctx = canvas.getContext('2d');
            
            if (bgColor !== 'transparent') {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = processedImage;
            await new Promise(resolve => img.onload = resolve);
            
            const ratio = selectedPhotoSize.width / selectedPhotoSize.height;
            const imgRatio = img.width / img.height;
            let drawW, drawH, drawX, drawY;

            if (imgRatio > ratio) {
                drawH = canvas.height;
                drawW = canvas.height * imgRatio;
                drawX = (canvas.width - drawW) / 2;
                drawY = 0;
            } else {
                drawW = canvas.width;
                drawH = canvas.width / imgRatio;
                drawX = 0;
                drawY = (canvas.height - drawH) / 2;
            }
            ctx.drawImage(img, drawX, drawY, drawW, drawH);

            if (showSuit) {
                const suitImg = new Image();
                suitImg.crossOrigin = "anonymous";
                suitImg.src = SUIT_OVERLAYS[1].url;
                await new Promise(resolve => suitImg.onload = resolve);
                
                const previewCanvas = previewCanvasRef.current;
                const previewRect = previewCanvas.getBoundingClientRect();
                const suitElement = suitRef.current;
                const suitRect = suitElement.getBoundingClientRect();
                
                const relativeX = (suitRect.left - previewRect.left) / previewRect.width;
                const relativeY = (suitRect.top - previewRect.top) / previewRect.height;
                const relativeW = suitRect.width / previewRect.width;
                const relativeH = suitRect.height / previewRect.height;
                
                ctx.drawImage(
                    suitImg, 
                    relativeX * canvas.width, 
                    relativeY * canvas.height, 
                    relativeW * canvas.width, 
                    relativeH * canvas.height
                );
            }

            const mergedImageData = canvas.toDataURL('image/jpeg', 0.95);
            const selectedPaper = PAPER_SIZES.find(p => p.id === paperSize);
            const pdfBytes = await generatePassportPhotoPdf(mergedImageData, {
                paperSize: selectedPaper.id,
                photoWidthMm: selectedPhotoSize.width,
                photoHeightMm: selectedPhotoSize.height,
                marginMm: 2
            });

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (err) {
            console.error(err);
            setError("Failed to generate PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setOriginalImage(null);
        setProcessedImage(null);
        setPdfUrl(null);
        setError(null);
        setShowSuit(false);
        setIsCropping(false);
    };

    const selectedPhotoSizeData = PHOTO_SIZES.find(s => s.id === photoSize);

    return (
        <div className="max-w-5xl mx-auto px-4">
            <SEO
                title="Passport Size Photo Maker Online - Free Background Remover & Suit Overlay"
                description="Create professional passport photos in seconds. Remove backgrounds, change colors, add a formal suit, and tile for A4 printing. 100% private, browser-side processing."
                keywords="passport photo maker, visa photo, background remover, online photo editor, id card photo, suit overlay, printing tools"
                url="/passport-photo"
            />

            <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Passport Photo Maker</h1>
                <p className="text-gray-600 mt-2">
                    Create professional passport photos with background removal and tiling.
                </p>
            </div>

            {/* Cropping Modal */}
            {isCropping && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold">Adjust Photo Frame</h3>
                            <button onClick={() => setIsCropping(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative flex-1 bg-gray-900 min-h-[400px]">
                            <Cropper
                                image={originalImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={selectedPhotoSizeData.width / selectedPhotoSizeData.height}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                            <button
                                onClick={createCroppedImage}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                            >
                                Apply Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {!originalImage ? (
                    <div className="p-12">
                        <DropZone onFileSelect={handleFileSelect} multiple={false} accept="image/*" />
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div className="p-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold">1. Upload</h3>
                                <p className="text-sm text-gray-500">Upload a clear portrait photo</p>
                            </div>
                            <div className="p-4">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Palette className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold">2. Customize</h3>
                                <p className="text-sm text-gray-500">Remove bg, change color or add suit</p>
                            </div>
                            <div className="p-4">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Download className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold">3. Download</h3>
                                <p className="text-sm text-gray-500">Get a print-ready PDF</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row h-full">
                        {/* Preview Area */}
                        <div className="flex-1 p-6 bg-gray-50 flex flex-center justify-center items-center min-h-[400px]">
                            <div className="relative shadow-2xl bg-white border border-gray-300 overflow-hidden" style={{ 
                                width: '300px', 
                                height: 300 / (selectedPhotoSizeData.width / selectedPhotoSizeData.height)
                            }}>
                                <canvas 
                                    ref={previewCanvasRef} 
                                    className="w-full h-full"
                                />
                                
                                {showSuit && (
                                    <Draggable
                                        nodeRef={suitRef}
                                        bounds="parent"
                                        onDrag={(e, data) => setSuitPosition({ x: data.x, y: data.y })}
                                    >
                                        <div 
                                            ref={suitRef}
                                            className="suit-overlay absolute cursor-move"
                                            style={{ 
                                                width: 150 * suitScale,
                                                top: '50%',
                                                left: '25%'
                                            }}
                                        >
                                            <img 
                                                src={SUIT_OVERLAYS[1].url} 
                                                alt="Suit" 
                                                className="w-full pointer-events-none select-none"
                                            />
                                            <div className="absolute -top-8 left-0 flex gap-2 bg-black/50 p-1 rounded backdrop-blur-sm">
                                                <button onClick={() => setSuitScale(s => s + 0.1)} className="text-white text-xs px-2">+</button>
                                                <button onClick={() => setSuitScale(s => s - 0.1)} className="text-white text-xs px-2">-</button>
                                            </div>
                                        </div>
                                    </Draggable>
                                )}
                            </div>
                        </div>

                        {/* Controls Area */}
                        <div className="w-full lg:w-96 border-l border-gray-200 p-6 space-y-8 overflow-y-auto max-h-[800px]">
                            {/* Step 1: Background & Crop */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                                    <Palette className="w-4 h-4 mr-2" />
                                    Background & Image
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={handleRemoveBackground}
                                            disabled={isRemovingBg}
                                            className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                        >
                                            {isRemovingBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                            {isRemovingBg ? 'Removing...' : 'Remove BG'}
                                        </button>
                                        <button
                                            onClick={() => setIsCropping(true)}
                                            className="py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                        >
                                            <Crop className="w-4 h-4" />
                                            Manual Crop
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-5 gap-2">
                                        {BACKGROUND_COLORS.map((color) => (
                                            <button
                                                key={color.name}
                                                onClick={() => setBgColor(color.value)}
                                                className={`h-10 rounded-md border-2 transition-all ${bgColor === color.value ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
                                                style={{ backgroundColor: color.value === 'transparent' ? 'white' : color.value }}
                                                title={color.name}
                                            >
                                                {color.value === 'transparent' && <X className="w-4 h-4 mx-auto text-gray-400" />}
                                                {bgColor === color.value && color.value !== 'transparent' && <Check className="w-4 h-4 mx-auto text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Clothes */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                                    <Shirt className="w-4 h-4 mr-2" />
                                    Clothes (BETA)
                                </h3>
                                <button
                                    onClick={() => setShowSuit(!showSuit)}
                                    className={`w-full py-2 px-4 border-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${showSuit ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                >
                                    <Shirt className="w-4 h-4" />
                                    {showSuit ? 'Remove Suit Overlay' : 'Add Formal Suit Overlay'}
                                </button>
                                {showSuit && (
                                    <p className="text-[10px] text-gray-500 mt-2 italic">
                                        Drag and resize the suit in the preview to fit.
                                    </p>
                                )}
                            </div>

                            {/* Step 3: Photo Size */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                                    <Square className="w-4 h-4 mr-2" />
                                    Photo Size
                                </h3>
                                <div className="space-y-2">
                                    {PHOTO_SIZES.map(size => (
                                        <button
                                            key={size.id}
                                            onClick={() => setPhotoSize(size.id)}
                                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${photoSize === size.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <p className="text-sm font-semibold">{size.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Step 4: Paper Size */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                                    <Layout className="w-4 h-4 mr-2" />
                                    Output Paper
                                </h3>
                                <div className="space-y-2">
                                    {PAPER_SIZES.map(size => (
                                        <button
                                            key={size.id}
                                            onClick={() => setPaperSize(size.id)}
                                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${paperSize === size.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <p className="text-sm font-semibold">{size.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">
                                        {error}
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleGeneratePdf}
                                        disabled={isProcessing}
                                        className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-all font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                        Generate PDF
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="p-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors"
                                        title="Start Over"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {pdfUrl && (
                                <div className="mt-4 animate-bounce">
                                    <a
                                        href={pdfUrl}
                                        download="passport_photos.pdf"
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Ready!
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {pdfUrl && (
                <div className="mt-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold mb-4">Print Preview</h3>
                    <iframe src={pdfUrl} className="w-full h-[600px] rounded-lg border border-gray-100" />
                </div>
            )}
        </div>
    );
};

export default PassportPhoto;
