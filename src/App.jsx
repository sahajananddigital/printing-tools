import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import InvoiceDuplicator from './tools/InvoiceDuplicator/InvoiceDuplicator';
import PdfMerge from './tools/PdfMerge/PdfMerge';
import PdfSign from './tools/PdfSign/PdfSign';
import ImageToPdf from './tools/ImageToPdf/ImageToPdf';
import TextExtractor from './tools/TextExtractor/TextExtractor';
import GoogleDocToMarkdown from './tools/GoogleDocToMarkdown/GoogleDocToMarkdown';
import Docs from './pages/Docs';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/invoice-duplicator" element={<InvoiceDuplicator />} />
            <Route path="/pdf-merge" element={<PdfMerge />} />
            <Route path="/pdf-sign" element={<PdfSign />} />
            <Route path="/image-to-pdf" element={<ImageToPdf />} />
            <Route path="/text-extractor" element={<TextExtractor />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/google-doc-to-markdown" element={<GoogleDocToMarkdown />} />
          </Routes>
        </Layout>
      </div>
    </HashRouter>
  );
}

export default App;
