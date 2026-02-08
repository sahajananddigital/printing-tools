import Tesseract from 'tesseract.js';

/**
 * Extract text from an image buffer using Tesseract.js OCR
 * @param {ArrayBuffer|Blob|string} imageSource - Image data (buffer, blob, or URL)
 * @param {Function} onProgress - Progress callback (0-100)
 * @param {string} language - OCR language (default: 'eng')
 * @returns {Promise<{text: string, confidence: number}>}
 */
export async function extractTextFromImage(imageSource, onProgress = () => { }, language = 'eng') {
    const result = await Tesseract.recognize(imageSource, language, {
        logger: (m) => {
            if (m.status === 'recognizing text' && m.progress) {
                onProgress(Math.round(m.progress * 100));
            }
        }
    });

    return {
        text: result.data.text,
        confidence: result.data.confidence
    };
}

/**
 * Extract text from a PDF by converting pages to images first
 * Uses pdf.js to render pages, then OCR each page
 * @param {ArrayBuffer} pdfBuffer - PDF file buffer
 * @param {Function} onProgress - Progress callback with {page, totalPages, progress}
 * @param {string} language - OCR language (default: 'eng')
 * @returns {Promise<{text: string, pages: Array}>}
 */
export async function extractTextFromPdf(pdfBuffer, onProgress = () => { }, language = 'eng') {
    // Dynamic import of pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');

    // Use unpkg CDN which mirrors npm packages directly
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    const totalPages = pdf.numPages;
    const pages = [];
    let fullText = '';

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        // Render page to canvas
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Convert canvas to blob for OCR
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

        // OCR the page image
        const pageResult = await extractTextFromImage(
            blob,
            (progress) => {
                onProgress({
                    page: pageNum,
                    totalPages,
                    progress
                });
            },
            language
        );

        pages.push({
            pageNumber: pageNum,
            text: pageResult.text,
            confidence: pageResult.confidence
        });

        fullText += `--- Page ${pageNum} ---\n${pageResult.text}\n\n`;
    }

    return {
        text: fullText.trim(),
        pages
    };
}

/**
 * Detect file type and extract text accordingly
 * @param {File} file - The file to process
 * @param {Function} onProgress - Progress callback
 * @param {string} language - OCR language
 * @returns {Promise<{text: string, type: string}>}
 */
export async function extractText(file, onProgress = () => { }, language = 'eng') {
    const buffer = await file.arrayBuffer();

    if (file.type === 'application/pdf') {
        const result = await extractTextFromPdf(buffer, onProgress, language);
        return {
            text: result.text,
            type: 'pdf',
            pages: result.pages
        };
    } else if (file.type.startsWith('image/')) {
        const result = await extractTextFromImage(buffer, onProgress, language);
        return {
            text: result.text,
            type: 'image',
            confidence: result.confidence
        };
    } else {
        throw new Error(`Unsupported file type: ${file.type}`);
    }
}
