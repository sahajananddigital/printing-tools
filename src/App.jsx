import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import InvoiceDuplicator from './tools/InvoiceDuplicator/InvoiceDuplicator';
import PdfMerge from './tools/PdfMerge/PdfMerge';
import PdfSign from './tools/PdfSign/PdfSign';
import ImageToPdf from './tools/ImageToPdf/ImageToPdf';
import TextExtractor from './tools/TextExtractor/TextExtractor';
import GoogleDocToMarkdown from './tools/GoogleDocToMarkdown/GoogleDocToMarkdown';
import PassportPhoto from './tools/PassportPhoto/PassportPhoto';
import Docs from './pages/Docs';
import Contribute from './pages/Contribute';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/invoice-duplicator" element={<InvoiceDuplicator />} />
            <Route path="/pdf-merge" element={<PdfMerge />} />
            <Route path="/pdf-sign" element={<PdfSign />} />
            <Route path="/image-to-pdf" element={<ImageToPdf />} />
            <Route path="/passport-photo" element={<PassportPhoto />} />
            <Route path="/text-extractor" element={<TextExtractor />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/google-doc-to-markdown" element={<GoogleDocToMarkdown />} />
          </Routes>
        </Layout>
      </div>
    </BrowserRouter>
  );
}

export default App;
