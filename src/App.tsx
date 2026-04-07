import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Profile from './pages/Profile';
import ModuleCenter from './pages/ModuleCenter';
import ModuleDetail from './pages/ModuleDetail';
import MyModules from './pages/MyModules';
import OrderRecords from './pages/OrderRecords';
import PurchaseApplication from './pages/PurchaseApplication';
import UsageStatistics from './pages/UsageStatistics';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Profile />} />
          <Route path="/modules" element={<ModuleCenter />} />
          <Route path="/module/:moduleId" element={<ModuleDetail />} />
          <Route path="/my-modules" element={<MyModules />} />
          <Route path="/orders" element={<OrderRecords />} />
          <Route path="/purchase/:moduleId" element={<PurchaseApplication />} />
          <Route path="/statistics" element={<UsageStatistics />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
