import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import InvoiceDuplicator from './tools/InvoiceDuplicator/InvoiceDuplicator';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="invoice-duplicator" element={<InvoiceDuplicator />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
