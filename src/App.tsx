/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { HistoricoPage } from './pages/HistoricoPage';
import { EsteirasPage } from './pages/EsteirasPage';
import { AnalistasPage } from './pages/AnalistasPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="historico" element={<HistoricoPage />} />
          <Route path="esteiras" element={<EsteirasPage />} />
          <Route path="analistas" element={<AnalistasPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
