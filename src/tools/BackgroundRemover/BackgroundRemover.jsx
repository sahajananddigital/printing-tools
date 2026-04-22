import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Image as ImageIcon, X, Loader2, Palette, Trash2, Upload, Monitor, Smartphone, RefreshCw, Sun, Contrast, Sliders, Shield, Zap, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import DropZone from '../../components/ui/DropZone';
import SEO from '../../components/SEO';
import { removeBackground } from '@imgly/background-removal';

const PRESET_COLORS = [
    { name: 'Transparent', value: 'transparent' },
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Grey', value: '#808080' },
    { name: 'Blue', value: '#0047bb' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#eab308' },
];

const PRESET_GRADIENTS = [
    { name: 'Sunset', value: 'linear-gradient(to right, #ff5f6d, #ffc371)' },
    { name: 'Ocean', value: 'linear-gradient(to right, #2193b0, #6dd5ed)' },
    { name: 'Lush', value: 'linear-gradient(to right, #56ab2f, #a8e063)' },
    { name: 'Purple', value: 'linear-gradient(to right, #8e2de2, #4a00e0)' },
    { name: 'Sky', value: 'linear-gradient(to right, #00c6ff, #0072ff)' },
    { name: 'Fire', value: 'linear-gradient(to right, #f83600, #f9d423)' },
];

const BackgroundRemover = () => {
    const [originalImage, setOriginalImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    const [bgColor, setBgColor] = useState('transparent');
    const [bgGradient, setBgGradient] = useState('');
    const [bgImage, setBgImage] = useState(null);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    
    // New Feature States
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [edgeBlur, setEdgeBlur] = useState(0);
    const [shadowIntensity, setShadowIntensity] = useState(0);
    const [compareSliderPos, setCompareSliderPos] = useState(50);
    const [showCompare, setShowCompare] = useState(false);
    
    const previewCanvasRef = useRef(null);
    const bgInputRef = useRef(null);

    const handleFileSelect = (selectedFiles) => {
        const file = Array.isArray(selectedFiles) ? selectedFiles[0] : selectedFiles;
        
        if (file) {
            const url = URL.createObjectURL(file);
            setOriginalImage(url);
            setProcessedImage(null);
            setError(null);
            setBrightness(100);
            setContrast(100);
            setEdgeBlur(0);
            setShadowIntensity(0);
            // Auto trigger background removal
            handleRemoveBackground(url);
        }
    };

    const handleRemoveBackground = async (imageUrl) => {
        const targetUrl = imageUrl || originalImage;
        if (!targetUrl) return;
        
        setIsRemovingBg(true);
        setError(null);
        
        try {
            const cdns = [
                'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
                'https://static.imgly.com/packages/@imgly/background-removal-data/1.7.0/dist/'
            ];
            
            let blob;
            let lastErr;
            
            for (const cdn of cdns) {
                try {
                    blob = await removeBackground(targetUrl, {
                        publicPath: cdn,
                        debug: false,
                        progress: () => {
                            // Progress feedback could be added here
                        }
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
            setError("Background removal failed. Please try a different image or check your internet connection.");
        } finally {
            setIsRemovingBg(false);
        }
    };

    const handleBgImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setBgImage(url);
            setBgColor('');
            setBgGradient('');
        }
    };

    const drawPreview = useCallback(async () => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;

        const imgUrl = showOriginal ? originalImage : (processedImage || originalImage);
        if (!imgUrl) return;

        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imgUrl;
        
        await new Promise((resolve) => { img.onload = resolve; });
        
        canvas.width = img.width;
        canvas.height = img.height;

        // 1. Draw Background
        if (!showOriginal) {
            if (bgImage) {
                const bgImg = new Image();
                bgImg.crossOrigin = "anonymous";
                bgImg.src = bgImage;
                await new Promise((resolve) => { bgImg.onload = resolve; });
                
                const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
                const x = (canvas.width - bgImg.width * scale) / 2;
                const y = (canvas.height - bgImg.height * scale) / 2;
                ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
            } else if (bgGradient) {
                // Parse linear gradient
                const gradientMatch = bgGradient.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g);
                if (gradientMatch && gradientMatch.length >= 2) {
                    const grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    grd.addColorStop(0, gradientMatch[0]);
                    grd.addColorStop(1, gradientMatch[1]);
                    ctx.fillStyle = grd;
                } else {
                    ctx.fillStyle = '#ffffff';
                }
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (bgColor !== 'transparent') {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Apply Filters to Foreground
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${edgeBlur}px)`;
        
        // 3. Draw Shadow if requested
        if (shadowIntensity > 0 && !showOriginal && processedImage) {
            ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity / 100})`;
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
        }

        // 4. Draw Foreground
        ctx.drawImage(img, 0, 0);
        
        // Reset shadow and filter for next draw
        ctx.shadowColor = 'transparent';
        ctx.filter = 'none';
    }, [originalImage, processedImage, showOriginal, bgColor, bgGradient, bgImage, brightness, contrast, edgeBlur, shadowIntensity]);

    useEffect(() => {
        drawPreview();
    }, [drawPreview]);

    const handleDownload = async (format = 'png') => {
        if (!processedImage) return;
        setIsProcessing(true);

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = processedImage;
            
            await new Promise((resolve) => { img.onload = resolve; });
            
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw Background
            if (bgImage) {
                const bgImg = new Image();
                bgImg.crossOrigin = "anonymous";
                bgImg.src = bgImage;
                await new Promise((resolve) => { bgImg.onload = resolve; });
                const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
                const x = (canvas.width - bgImg.width * scale) / 2;
                const y = (canvas.height - bgImg.height * scale) / 2;
                ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
            } else if (bgGradient) {
                const gradientMatch = bgGradient.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g);
                if (gradientMatch && gradientMatch.length >= 2) {
                    const grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    grd.addColorStop(0, gradientMatch[0]);
                    grd.addColorStop(1, gradientMatch[1]);
                    ctx.fillStyle = grd;
                } else {
                    ctx.fillStyle = '#ffffff';
                }
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (bgColor !== 'transparent') {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (format === 'jpg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Apply Filters
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${edgeBlur}px)`;
            
            if (shadowIntensity > 0) {
                ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity / 100})`;
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 10;
                ctx.shadowOffsetY = 10;
            }

            // Draw Foreground
            ctx.drawImage(img, 0, 0);

            const mimeType = format === 'png' ? 'image/png' : (format === 'webp' ? 'image/webp' : 'image/jpeg');
            const dataUrl = canvas.toDataURL(mimeType, 0.95);
            const link = document.createElement('a');
            link.download = `removed-bg-${Date.now()}.${format}`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
            setError("Failed to generate download.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setOriginalImage(null);
        setProcessedImage(null);
        setBgImage(null);
        setBgColor('transparent');
        setBgGradient('');
        setBrightness(100);
        setContrast(100);
        setEdgeBlur(0);
        setShadowIntensity(0);
        setError(null);
        setShowCompare(false);
        setShowOriginal(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <SEO
                title="Free AI Background Remover - Remove Backgrounds Online"
                description="Remove image backgrounds instantly for free using AI. 100% private, browser-side processing. Change backgrounds to solid colors, gradients or custom images."
                keywords="background remover, remove background, transparent background, ai background removal, free photo editor, online image tool"
                url="/background-remover"
            />

            <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Background Remover</h1>
                        <p className="text-gray-600 mt-2">
                            Automatically remove backgrounds with professional results in seconds.
                        </p>
                    </div>
                    {originalImage && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCompare(!showCompare)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${showCompare ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <RefreshCw className="w-4 h-4" />
                                {showCompare ? 'Disable Compare' : 'Compare Mode'}
                            </button>
                            <button
                                onClick={() => setShowOriginal(!showOriginal)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${showOriginal ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                {showOriginal ? 'Hide Original' : 'View Original'}
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                                Reset
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                {!originalImage ? (
                    <div className="p-12">
                        <DropZone onFileSelect={handleFileSelect} multiple={false} accept="image/*" />
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="p-6 bg-gray-50 rounded-2xl">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold mb-2">Upload Image</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">Select any portrait, product, or object photo from your device.</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl">
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold mb-2">AI Processing</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">Our advanced AI detects and removes the background automatically.</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold mb-2">Personalize</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">Add new backgrounds, adjust edges, and apply fine-tuned effects.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row min-h-[600px]">
                        {/* Preview Area */}
                        <div className="flex-1 p-8 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">
                            {isRemovingBg && (
                                <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <p className="font-bold text-gray-900 text-xl mt-6">Removing Background...</p>
                                    <p className="text-gray-500 text-sm mt-2 italic">This takes a few seconds, processed locally for privacy</p>
                                </div>
                            )}
                            
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="relative shadow-2xl rounded-2xl overflow-hidden bg-white max-w-full max-h-[700px]">
                                    {/* Transparent Checkerboard Background */}
                                    <div 
                                        className="absolute inset-0 pointer-events-none z-0" 
                                        style={{ 
                                            backgroundImage: 'radial-gradient(#ddd 1px, transparent 0)',
                                            backgroundSize: '24px 24px',
                                            backgroundColor: '#f8f8f8'
                                        }} 
                                    />
                                    
                                    {/* Background Styling Layer */}
                                    {!showOriginal && (
                                        <div 
                                            className="absolute inset-0 transition-all duration-300 z-1"
                                            style={{ 
                                                backgroundColor: bgColor,
                                                backgroundImage: bgImage ? `url(${bgImage})` : bgGradient,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                    )}
                                    
                                    <div className="relative z-10">
                                        {!showCompare ? (
                                            <img 
                                                src={showOriginal ? originalImage : (processedImage || originalImage)} 
                                                alt="Preview" 
                                                className={`max-w-full max-h-[700px] object-contain transition-all duration-500 ${!processedImage && !showOriginal ? 'opacity-30 blur-xl scale-110' : 'opacity-100 blur-0'}`}
                                                style={{
                                                    filter: !showOriginal ? `brightness(${brightness}%) contrast(${contrast}%) blur(${edgeBlur}px)` : 'none',
                                                    boxShadow: (!showOriginal && shadowIntensity > 0) ? `${shadowIntensity / 10}px ${shadowIntensity / 10}px 20px rgba(0,0,0,${shadowIntensity / 100})` : 'none'
                                                }}
                                            />
                                        ) : (
                                            <div className="relative max-w-full h-[600px] aspect-[4/3] md:aspect-auto">
                                                {/* Original Background */}
                                                <div 
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${originalImage})` }}
                                                />
                                                
                                                {/* Processed Top Layer */}
                                                <div 
                                                    className="absolute inset-0 overflow-hidden"
                                                    style={{ width: `${compareSliderPos}%`, borderRight: '2px solid white' }}
                                                >
                                                    <div className="absolute inset-0 z-0 bg-white" style={{ 
                                                        backgroundColor: bgColor,
                                                        backgroundImage: bgImage ? `url(${bgImage})` : bgGradient,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }} />
                                                    <img 
                                                        src={processedImage} 
                                                        alt="Processed" 
                                                        className="h-full w-auto max-w-none object-cover absolute"
                                                        style={{ 
                                                            filter: `brightness(${brightness}%) contrast(${contrast}%) blur(${edgeBlur}px)`,
                                                        }}
                                                    />
                                                </div>

                                                {/* Slider Handle */}
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max="100" 
                                                    value={compareSliderPos} 
                                                    onChange={(e) => setCompareSliderPos(e.target.value)}
                                                    className="absolute inset-0 opacity-0 w-full h-full cursor-col-resize z-20"
                                                />
                                                <div 
                                                    className="absolute top-0 bottom-0 z-10 pointer-events-none flex flex-col items-center justify-center"
                                                    style={{ left: `calc(${compareSliderPos}% - 1px)` }}
                                                >
                                                    <div className="w-1 h-full bg-white shadow-lg" />
                                                    <div className="w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center -my-4 border-2 border-blue-600">
                                                        <Sliders className="w-4 h-4 text-blue-600 rotate-90" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Canvas for processing/drawing hidden */}
                                    <canvas ref={previewCanvasRef} className="hidden" />
                                </div>
                            </div>
                        </div>

                        {/* Controls Area */}
                        <div className="w-full lg:w-96 border-l border-gray-100 p-8 space-y-10 bg-white overflow-y-auto max-h-[90vh]">
                            {/* 1. Background Settings */}
                            <div className={isRemovingBg ? 'opacity-30 pointer-events-none' : ''}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                                        <Palette className="w-4 h-4 mr-2" />
                                        Background
                                    </h3>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Color Presets */}
                                    <div className="grid grid-cols-5 gap-2">
                                        {PRESET_COLORS.map((color) => (
                                            <button
                                                key={color.name}
                                                onClick={() => {
                                                    setBgColor(color.value);
                                                    setBgGradient('');
                                                    setBgImage(null);
                                                }}
                                                className={`h-10 rounded-xl border-2 transition-all relative overflow-hidden ${bgColor === color.value ? 'border-blue-600 ring-4 ring-blue-50 scale-105' : 'border-gray-50 hover:border-gray-200'}`}
                                                title={color.name}
                                            >
                                                {color.value === 'transparent' ? (
                                                    <div className="w-full h-full bg-white flex items-center justify-center">
                                                        <div className="w-6 h-6 border border-gray-100 bg-[radial-gradient(#ddd_1px,transparent_0)] bg-[length:4px_4px]" />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full" style={{ backgroundColor: color.value }} />
                                                )}
                                            </button>
                                        ))}
                                        <div className="relative h-10 group">
                                            <input 
                                                type="color" 
                                                onChange={(e) => {
                                                    setBgColor(e.target.value);
                                                    setBgGradient('');
                                                    setBgImage(null);
                                                }}
                                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                            />
                                            <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-blue-400 group-hover:text-blue-500 transition-colors">
                                                <Palette className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gradient Presets */}
                                    <div className="grid grid-cols-6 gap-2">
                                        {PRESET_GRADIENTS.map((gradient) => (
                                            <button
                                                key={gradient.name}
                                                onClick={() => {
                                                    setBgGradient(gradient.value);
                                                    setBgColor('');
                                                    setBgImage(null);
                                                }}
                                                className={`h-8 rounded-lg border-2 transition-all ${bgGradient === gradient.value ? 'border-blue-600 ring-2 ring-blue-50' : 'border-gray-50 hover:border-gray-200'}`}
                                                title={gradient.name}
                                                style={{ backgroundImage: gradient.value }}
                                            />
                                        ))}
                                    </div>

                                    {/* Image Background */}
                                    <div>
                                        {bgImage ? (
                                            <div className="relative group rounded-2xl overflow-hidden aspect-video border-2 border-gray-100">
                                                <img src={bgImage} alt="Custom Background" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <button 
                                                        onClick={() => bgInputRef.current?.click()}
                                                        className="p-3 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform"
                                                        title="Replace Background"
                                                    >
                                                        <RefreshCw className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setBgImage(null)}
                                                        className="p-3 bg-red-600 rounded-full text-white hover:scale-110 transition-transform"
                                                        title="Remove Background"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => bgInputRef.current?.click()}
                                                className="w-full py-6 border-2 border-dashed border-gray-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-400 hover:text-blue-500 flex flex-col items-center gap-2"
                                            >
                                                <ImageIcon className="w-8 h-8" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Custom Image</span>
                                            </button>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={bgInputRef}
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={handleBgImageUpload}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Refine Edges & Effects */}
                            <div className={isRemovingBg || !processedImage ? 'opacity-30 pointer-events-none' : ''}>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                                    <Sliders className="w-4 h-4 mr-2" />
                                    Refine & Effects
                                </h3>
                                
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-gray-600 flex items-center gap-2">
                                                <Sun className="w-4 h-4" /> Brightness
                                            </label>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{brightness}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="200" value={brightness} 
                                            onChange={(e) => setBrightness(e.target.value)}
                                            className="w-full accent-blue-600"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-gray-600 flex items-center gap-2">
                                                <Contrast className="w-4 h-4" /> Contrast
                                            </label>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{contrast}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="200" value={contrast} 
                                            onChange={(e) => setContrast(e.target.value)}
                                            className="w-full accent-blue-600"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-gray-600">Edge Smoothing</label>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{edgeBlur}px</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="10" step="0.5" value={edgeBlur} 
                                            onChange={(e) => setEdgeBlur(e.target.value)}
                                            className="w-full accent-blue-600"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-gray-600">Shadow Intensity</label>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{shadowIntensity}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="100" value={shadowIntensity} 
                                            onChange={(e) => setShadowIntensity(e.target.value)}
                                            className="w-full accent-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-start gap-3 border border-red-100">
                                        <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleDownload('png')}
                                        disabled={isRemovingBg || isProcessing || !processedImage}
                                        className="w-full py-4 px-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:bg-blue-300 transition-all font-bold shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group"
                                    >
                                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />}
                                        Download PNG
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleDownload('jpg')}
                                            disabled={isRemovingBg || isProcessing || !processedImage}
                                            className="py-3 px-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl hover:bg-gray-50 disabled:opacity-50 transition-all font-bold text-sm"
                                        >
                                            JPG
                                        </button>
                                        <button
                                            onClick={() => handleDownload('webp')}
                                            disabled={isRemovingBg || isProcessing || !processedImage}
                                            className="py-3 px-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl hover:bg-gray-50 disabled:opacity-50 transition-all font-bold text-sm"
                                        >
                                            WebP
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-[0.2em] font-black pt-4">
                                        Secure & Local Processing
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Features section */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                        <Monitor className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3">Studio Quality</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Advanced AI trained on millions of images to provide high-precision cutouts even for hair.</p>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                        <Palette className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3">Smart Backgrounds</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Instantly swap backgrounds with professional solid colors, modern gradients, or custom images.</p>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3">100% Private</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Your photos never leave your device. All processing happens locally in your browser.</p>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3">No Install Required</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Works directly in your browser on desktop and mobile. Fast, free, and easy to use.</p>
                </div>
            </div>
        </div>
    );
};

export default BackgroundRemover;
