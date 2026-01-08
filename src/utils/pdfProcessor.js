import { PDFDocument, PageSizes, rgb } from 'pdf-lib';

export async function duplicateInvoice(fileBuffer, splitPercentage = 50) {
  try {
    const sourcePdfDoc = await PDFDocument.load(fileBuffer);
    const sourcePages = sourcePdfDoc.getPages();
    
    if (sourcePages.length === 0) {
      throw new Error("PDF has no pages");
    }

    const firstPage = sourcePages[0];
    const { width: srcWidth, height: srcHeight } = firstPage.getSize();

    // Create a new PDF with A4 size
    const newPdfDoc = await PDFDocument.create();
    const [a4Width, a4Height] = PageSizes.A4;
    const newPage = newPdfDoc.addPage(PageSizes.A4);

    // Embed the WHOLE first page unmodified
    const embeddedPage = await newPdfDoc.embedPage(firstPage);

    // Calculate dimensions
    // Scaling: Fit width of A4
    const scaleFactor = a4Width / srcWidth;
    const scaledFullHeight = srcHeight * scaleFactor;

    // Calculate the height of the segment we want to keep (from the top of the invoice)
    const keepHeight = scaledFullHeight * (splitPercentage / 100);

    // Helper to draw and mask
    const drawAndMask = (yTop) => {
        // 1. Draw the full image positioned such that its top is at yTop
        // y param in drawPage is the bottom-left corner of the image.
        // So if top is yTop, bottom is yTop - scaledFullHeight.
        const imageBottomY = yTop - scaledFullHeight;

        newPage.drawPage(embeddedPage, {
            x: 0,
            y: imageBottomY,
            width: a4Width,
            height: scaledFullHeight,
        });

        // 2. Mask the unwanted bottom part of this specific image copy
        // We want to see content from yTop down to (yTop - keepHeight).
        // We want to HIDE content from (yTop - keepHeight) down to imageBottomY.
        const maskHeight = scaledFullHeight - keepHeight;
        
        if (maskHeight > 0) {
            newPage.drawRectangle({
                x: 0,
                y: imageBottomY, // Start at bottom of image
                width: a4Width,
                height: maskHeight, // Go up to the cut line
                color: rgb(1, 1, 1), // White mask
            });
        }
    };

    // Position 1: Top of A4 page
    drawAndMask(a4Height);

    // Position 2: Immediately below the first kept segment
    drawAndMask(a4Height - keepHeight);

    // Serialize the PDF
    const pdfBytes = await newPdfDoc.save();
    return pdfBytes;
  } catch (err) {
    console.error("Error duplicing invoice:", err);
    throw err;
  }
}
