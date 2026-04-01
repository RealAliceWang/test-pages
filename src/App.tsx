import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Profile from './pages/Profile';
import ModuleCenter from './pages/ModuleCenter';
import MyModules from './pages/MyModules';
import OrderRecords from './pages/OrderRecords';
import PurchaseApplication from './pages/PurchaseApplication';
import UsageStatistics from './pages/UsageStatistics';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Profile />} />
          <Route path="/modules" element={<ModuleCenter />} />
          <Route path="/my-modules" element={<MyModules />} />
          <Route path="/orders" element={<OrderRecords />} />
          <Route path="/purchase/:moduleId" element={<PurchaseApplication />} />
          <Route path="/statistics" element={<UsageStatistics />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/settings" element={<SystemSettings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
