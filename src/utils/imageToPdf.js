import { PDFDocument, PageSizes } from 'pdf-lib';

/**
 * Converts an array of image files (Buffers or ArrayBuffers) into a single PDF.
 * @param {Array<{buffer: ArrayBuffer, type: string}>} images 
 * @returns {Promise<Uint8Array>} The PDF bytes
 */
export async function convertImagesToPdf(images) {
    try {
        const pdfDoc = await PDFDocument.create();

        for (const imgData of images) {
            let image;
            // Detect type if not explicit, but for now we expect type to be passed or derived
            // We'll rely on the caller to pass { buffer, type } where type is mime type

            if (imgData.type === 'image/jpeg' || imgData.type === 'image/jpg') {
                image = await pdfDoc.embedJpg(imgData.buffer);
            } else if (imgData.type === 'image/png') {
                image = await pdfDoc.embedPng(imgData.buffer);
            } else {
                continue; // Skip unsupported types
            }

            // Create a new page with A4 dimensions
            const page = pdfDoc.addPage(PageSizes.A4); // [595.28, 841.89]
            const { width, height } = page.getSize();

            // Calculate formatting to fit image within page with margins
            const margin = 20;
            const availableWidth = width - (margin * 2);
            const availableHeight = height - (margin * 2);

            const imgDims = image.scaleToFit(availableWidth, availableHeight);

            // Center the image
            const x = (width - imgDims.width) / 2;
            const y = (height - imgDims.height) / 2;

            page.drawImage(image, {
                x: x,
                y: y,
                width: imgDims.width,
                height: imgDims.height,
            });
        }

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (err) {
        console.error("Error converting images to PDF:", err);
        throw err;
    }
}
