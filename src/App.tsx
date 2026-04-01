import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ModuleManagement from './pages/ModuleManagement';
import PaidModules from './pages/PaidModules';
import ApplicationRecords from './pages/ApplicationRecords';
import UsageStatistics from './pages/UsageStatistics';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';
import Profile from './pages/Profile';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Profile />} />
          <Route path="/modules" element={<ModuleManagement />} />
          <Route path="/paid-modules" element={<PaidModules />} />
          <Route path="/applications" element={<ApplicationRecords />} />
          <Route path="/statistics" element={<UsageStatistics />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/settings" element={<SystemSettings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
