import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Priorizacion from './pages/Priorizacion';
import Gestion from './pages/Gestion';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/priorizacion" element={<Priorizacion />} />
          <Route path="/gestion" element={<Gestion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
