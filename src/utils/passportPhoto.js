import { PDFDocument, rgb } from 'pdf-lib';

/**
 * Creates a PDF with passport photos tiled on a page.
 * 
 * @param {string} imageDataUrl - The base64/URL of the processed passport photo.
 * @param {Object} options - Tiling options.
 * @param {string} options.paperSize - 'a4' or '4x6'.
 * @param {number} options.photoWidthMm - Width of the passport photo in mm (default 35).
 * @param {number} options.photoHeightMm - Height of the passport photo in mm (default 45).
 * @param {number} options.marginMm - Margin between photos in mm (default 5).
 * @returns {Promise<Uint8Array>} The PDF bytes.
 */
export async function generatePassportPhotoPdf(imageDataUrl, options = {}) {
    const {
        paperSize = 'a4',
        photoWidthMm = 35,
        photoHeightMm = 45,
        marginMm = 2
    } = options;

    const pdfDoc = await PDFDocument.create();
    
    // Page sizes in points (1 point = 1/72 inch, 1 inch = 25.4 mm)
    // 1 mm = 72 / 25.4 = 2.8346 points
    const mmToPt = 2.8346;
    
    let pageWidth, pageHeight;
    if (paperSize === 'a4') {
        pageWidth = 210 * mmToPt;
        pageHeight = 297 * mmToPt;
    } else if (paperSize === 'a5') {
        pageWidth = 148 * mmToPt;
        pageHeight = 210 * mmToPt;
    } else if (paperSize === '4x6') {
        pageWidth = 101.6 * mmToPt; // 4 inch
        pageHeight = 152.4 * mmToPt; // 6 inch
    } else {
        pageWidth = 210 * mmToPt;
        pageHeight = 297 * mmToPt;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Convert image
    const imageBytes = await fetch(imageDataUrl).then(res => res.arrayBuffer());
    let image;
    if (imageDataUrl.startsWith('data:image/png')) {
        image = await pdfDoc.embedPng(imageBytes);
    } else {
        image = await pdfDoc.embedJpg(imageBytes);
    }

    const photoWidth = photoWidthMm * mmToPt;
    const photoHeight = photoHeightMm * mmToPt;
    const margin = marginMm * mmToPt;

    const cols = Math.floor((pageWidth - margin) / (photoWidth + margin));
    const rows = Math.floor((pageHeight - margin) / (photoHeight + margin));

    // Calculate total grid size to center it
    const totalW = cols * photoWidth + (cols - 1) * margin;
    const totalH = rows * photoHeight + (rows - 1) * margin;
    const startX = (pageWidth - totalW) / 2;
    const startY = pageHeight - (pageHeight - totalH) / 2;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = startX + c * (photoWidth + margin);
            const y = startY - photoHeight - r * (photoHeight + margin);
            
            page.drawImage(image, {
                x,
                y,
                width: photoWidth,
                height: photoHeight
            });
            
            // Draw a solid border
            page.drawRectangle({
                x,
                y,
                width: photoWidth,
                height: photoHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 0.5,
            });

            // Draw cutting lines (crop marks)
            const lineLen = margin / 2;
            const lineOpacity = 0.5;
            const lineColor = rgb(0.7, 0.7, 0.7);

            // Vertical marks
            if (c < cols - 1) {
                const markX = x + photoWidth + margin / 2;
                page.drawLine({
                    start: { x: markX, y: y - lineLen },
                    end: { x: markX, y: y + photoHeight + lineLen },
                    thickness: 0.2,
                    color: lineColor,
                    opacity: lineOpacity,
                    dashArray: [2, 2]
                });
            }

            // Horizontal marks
            if (r < rows - 1) {
                const markY = y - margin / 2;
                page.drawLine({
                    start: { x: x - lineLen, y: markY },
                    end: { x: x + photoWidth + lineLen, y: markY },
                    thickness: 0.2,
                    color: lineColor,
                    opacity: lineOpacity,
                    dashArray: [2, 2]
                });
            }
        }
    }

    return await pdfDoc.save();
}
