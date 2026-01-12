import { PDFDocument } from 'pdf-lib';

/**
 * Embeds a signature image into a PDF page.
 * @param {ArrayBuffer} pdfBuffer - The source PDF file buffer.
 * @param {string} signatureDataUrl - Base64 data URL of the signature image (PNG).
 * @param {object} options - Options for placement.
 * @param {number} options.pageIndex - 0-based index of the page to sign (default: last page).
 * @param {number} options.x - X coordinate (default: right aligned).
 * @param {number} options.y - Y coordinate (default: bottom aligned).
 * @param {number} options.scale - Scale of the signature (default: 0.5).
 */
export async function signPdf(pdfBuffer, signatureDataUrl, options = {}) {
    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();
        
        let pageIndex = options.pageIndex;
        // Default to last page if not specified or invalid
        if (pageIndex === undefined || pageIndex < 0 || pageIndex >= pages.length) {
            pageIndex = pages.length - 1;
        }

        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        // Embed the signature image
        const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
        
        // Strategy: 
        // 1. Determine target width of signature on PDF.
        // We used a fixed height in the UI (h-16 = 64px). 
        // We should try to maintain visual scale.
        // If UI rendered width was W_ui, and PDF width is W_pdf. Ratio = W_pdf / W_ui.
        // Signature width on PDF = Sig_ui_width * Ratio.
        
        // If we have normalized coordinates:
        let x, y, sigW, sigH;
        
        if (options.normX !== undefined) {
            // Advanced Positioning
            const { normX, normY, renderedWidth } = options;
            
            // Calculate scale ratio between real PDF and UI preview
            const scaleRatio = width / renderedWidth; // pdfWidth / domWidth
            
            // Signature original dimensions (from PNG) - these might be huge if high-res canvas
            // We want it to look like it did on screen (approx 64px height).
            // Let's assume on screen it was height=64px.
            const uiSigHeight = 64; 
            const aspectRatio = signatureImage.width / signatureImage.height;
            const uiSigWidth = uiSigHeight * aspectRatio;
            
            sigW = uiSigWidth * scaleRatio;
            sigH = uiSigHeight * scaleRatio;
            
            // Calculate X (Left origin same for both)
            x = options.normX * width;
            
            // Calculate Y (PDF is Bottom-Left origin, DOM is Top-Left)
            // domY is distance from Top. 
            // In PDF, distance from Top is (height - y).
            // So: height - y = normY * height => y = height - (normY * height)
            // BUT, y is bottom of image. 
            // Top of image on screen was at normY.
            // So Top of image in PDF is at (height - (normY * height)).
            // Bottom of image in PDF is (Top - sigH).
            y = height - (options.normY * height) - sigH;
            
        } else {
            // Default Positioning (Bottom Right)
            const sigDims = signatureImage.scale(options.scale || 0.5);
            sigW = sigDims.width;
            sigH = sigDims.height;
            
            const padding = 50;
            x = options.x !== undefined ? options.x : (width - sigW - padding);
            y = options.y !== undefined ? options.y : padding;
        }

        // Draw the signature
        page.drawImage(signatureImage, {
            x: x,
            y: y,
            width: sigW,
            height: sigH,
        });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (err) {
        console.error("Error signing PDF:", err);
        throw err;
    }
}
