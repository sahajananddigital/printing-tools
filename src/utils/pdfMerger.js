import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(filesBuffers) {
    try {
        const mergedPdf = await PDFDocument.create();

        for (const buffer of filesBuffers) {
            const pdf = await PDFDocument.load(buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        return mergedPdfBytes;
    } catch (err) {
        console.error("Error merging PDFs:", err);
        throw err;
    }
}
