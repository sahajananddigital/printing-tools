import { describe, it, expect } from 'vitest';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { duplicateInvoice } from './pdfProcessor';

describe('duplicateInvoice', () => {
    it('should generate a valid PDF', async () => {
        // Create a mock source PDF
        const doc = await PDFDocument.create();
        const sourcePage = doc.addPage([500, 500]);
        sourcePage.drawRectangle({ x: 0, y: 0, width: 50, height: 50 }); // Add content
        const pdfBytes = await doc.save();
        
        // Convert to ArrayBuffer
        const buffer = pdfBytes.buffer;

        // Process
        const resultBytes = await duplicateInvoice(buffer, 50);
        
        // Check if result is valid PDF
        expect(resultBytes).toBeInstanceOf(Uint8Array);
        expect(resultBytes.length).toBeGreaterThan(0);
        
        // Load result to verify content
        const resultDoc = await PDFDocument.load(resultBytes);
        const pages = resultDoc.getPages();
        
        // Should have 1 page
        expect(pages.length).toBe(1);
        
        // Should be A4
        const page = pages[0];
        const { width, height } = page.getSize();
        
        // Precision issues possible, check close to A4
        expect(width).toBeCloseTo(PageSizes.A4[0], 1);
        expect(height).toBeCloseTo(PageSizes.A4[1], 1);
    });

    it('should throw error for invalid input', async () => {
        await expect(duplicateInvoice(new ArrayBuffer(0))).rejects.toThrow();
    });
});
