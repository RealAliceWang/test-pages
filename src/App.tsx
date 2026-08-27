import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import RequirePermission from './components/common/RequirePermission';
import RequireAuth from './components/common/RequireAuth';
import { AppProvider } from './store';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Workbench from './pages/Workbench';
import ModuleCenter from './pages/ModuleCenter';
import ModuleDetail from './pages/ModuleDetail';
import ApplyAuthorization from './pages/ApplyAuthorization';
import MyModules from './pages/MyModules';
import MyApplications from './pages/MyApplications';
import Approvals from './pages/Approvals';
import SeatPools from './pages/SeatPools';
import Members from './pages/Members';
import Orders from './pages/Orders';
import Statistics from './pages/Statistics';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import VendorOrgs from './pages/VendorOrgs';
import VendorCatalog from './pages/VendorCatalog';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Auth pages live outside the shell — no sidebar, no task rail. */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/" element={<Workbench />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/modules" element={
              <RequirePermission permissions={['module:browse']}><ModuleCenter /></RequirePermission>
            } />
            <Route path="/module/:moduleId" element={
              <RequirePermission permissions={['module:browse']}><ModuleDetail /></RequirePermission>
            } />
            <Route path="/apply/:moduleId" element={
              <RequirePermission permissions={['application:create']}><ApplyAuthorization /></RequirePermission>
            } />
            <Route path="/my-modules" element={
              <RequirePermission permissions={['assignment:view-own']}><MyModules /></RequirePermission>
            } />
            <Route path="/applications" element={
              <RequirePermission permissions={['application:create']}><MyApplications /></RequirePermission>
            } />

            <Route path="/approvals" element={
              <RequirePermission permissions={['approval:dept', 'approval:org', 'approval:vendor']}><Approvals /></RequirePermission>
            } />
            <Route path="/seats" element={
              <RequirePermission permissions={['seat:view-dept', 'seat:manage']}><SeatPools /></RequirePermission>
            } />
            <Route path="/members" element={
              <RequirePermission permissions={['member:view-dept', 'member:manage']}><Members /></RequirePermission>
            } />
            <Route path="/orders" element={
              <RequirePermission permissions={['order:view']}><Orders /></RequirePermission>
            } />
            <Route path="/statistics" element={
              <RequirePermission permissions={['stats:dept', 'stats:org', 'stats:platform']}><Statistics /></RequirePermission>
            } />
            <Route path="/audit" element={
              <RequirePermission permissions={['audit:dept', 'audit:org', 'audit:platform']}><AuditLogs /></RequirePermission>
            } />

            <Route path="/vendor/orgs" element={
              <RequirePermission permissions={['vendor:org-manage']}><VendorOrgs /></RequirePermission>
            } />
            <Route path="/vendor/catalog" element={
              <RequirePermission permissions={['vendor:catalog']}><VendorCatalog /></RequirePermission>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
