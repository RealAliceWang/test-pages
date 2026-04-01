// Module types and data
export type ModuleStatus = '可申请' | '已开通' | '审核中';
export type ModuleCategory = '全部模块' | '结构分析' | '建筑设计' | '工业厂房' | '专项设计' | '深化工具' | '付费模块';

export interface Module {
  id: string;
  name: string;
  code: string;
  category: ModuleCategory;
  status: ModuleStatus;
  description: string;
  duration: number;
  nodes: number;
  icon: string;
  price?: number;
}

export const modules: Module[] = [
  { id: '1',  name: '建筑结构',   code: '26D101', category: '结构分析', status: '已开通', description: '建筑结构整体建模与分析，支持框架、剪力墙等多种结构体系', duration: 90, nodes: 50, icon: 'building' },
  { id: '2',  name: '基本分析',   code: '26D102', category: '结构分析', status: '已开通', description: '结构静力分析、模态分析、稳定性分析等基础计算功能', duration: 90, nodes: 50, icon: 'calculator' },
  { id: '3',  name: '高级分析',   code: '26D103', category: '结构分析', status: '可申请', description: '弹塑性时程分析、推覆分析、性能化设计等高级分析功能', duration: 90, nodes: 30, icon: 'chart' },
  { id: '4',  name: '厂房',       code: '26D104', category: '工业厂房', status: '可申请', description: '单层/多层工业厂房设计，支持门式钢架和排架结构', duration: 90, nodes: 40, icon: 'factory' },
  { id: '5',  name: '多高层',     code: '26D105', category: '建筑设计', status: '已开通', description: '多高层钢结构、混合结构整体设计与节点验算', duration: 90, nodes: 50, icon: 'layers' },
  { id: '6',  name: '屋架桁架',   code: '26D106', category: '结构分析', status: '可申请', description: '平面及空间桁架、屋架结构建模与优化设计', duration: 60, nodes: 25, icon: 'triangle' },
  { id: '7',  name: '网架网壳',   code: '26D107', category: '专项设计', status: '可申请', description: '空间网架、网壳结构参数化建模与计算分析', duration: 60, nodes: 30, icon: 'grid' },
  { id: '8',  name: '塔架',       code: '26D108', category: '专项设计', status: '审核中', description: '输电塔架、通讯塔架结构建模与有限元分析', duration: 90, nodes: 35, icon: 'bridge' },
  { id: '9',  name: '辅助结构',   code: '26D109', category: '结构分析', status: '可申请', description: '楼梯、雨篷、挡墙等辅助结构快速设计工具', duration: 30, nodes: 20, icon: 'wrench' },
  { id: '10', name: '幕墙',       code: '26D110', category: '专项设计', status: '可申请', description: '玻璃幕墙、石材幕墙结构计算与安全校核', duration: 60, nodes: 25, icon: 'panel' },
  { id: '11', name: '索膜',       code: '26D111', category: '专项设计', status: '审核中', description: '索膜结构找形分析、裁剪分析与荷载计算', duration: 30, nodes: 20, icon: 'cable' },
  { id: '12', name: '基础设计',   code: '26D112', category: '结构分析', status: '已开通', description: '独立基础、桩基础、筏板基础等基础选型与设计', duration: 90, nodes: 50, icon: 'foundation' },
  { id: '13', name: '变电构架',   code: '26D113', category: '工业厂房', status: '可申请', description: '变电站构架、电力塔架结构设计与分析', duration: 60, nodes: 20, icon: 'zap' },
  { id: '14', name: '光伏支架',   code: '26D114', category: '工业厂房', status: '可申请', description: '固定式、跟踪式光伏支架系统结构设计', duration: 60, nodes: 25, icon: 'sun' },
  { id: '15', name: '通廊',       code: '26D115', category: '工业厂房', status: '可申请', description: '封闭式/开敞式通廊结构、管道支架设计', duration: 30, nodes: 20, icon: 'corridor' },
  { id: '16', name: '钢构深化',   code: '26D116', category: '深化工具', status: '已开通', description: '钢结构详图深化、节点设计、BOM清单自动生成', duration: 90, nodes: 50, icon: 'beam' },
  { id: '17', name: '围护深化',   code: '26D117', category: '深化工具', status: '可申请', description: '屋面墙面围护系统深化设计与排版优化', duration: 60, nodes: 30, icon: 'shield' },
  { id: '18', name: '授权帮助',   code: '26D118', category: '深化工具', status: '可申请', description: '3D3S全模块授权管理与许可证分配工具', duration: 90, nodes: 100, icon: 'key' },
  // Paid modules — same module names, paid versions with extended features
  { id: '19', name: '建筑结构',   code: '26D101', category: '结构分析', status: '可申请', description: '建筑结构高级版，含超限审查、复杂体型分析等增值功能', duration: 90, nodes: 80, icon: 'building', price: 4800 },
  { id: '20', name: '高级分析',   code: '26D102', category: '结构分析', status: '可申请', description: '弹塑性分析商业版，含抗震性能评估报告自动生成', duration: 90, nodes: 50, icon: 'chart', price: 5800 },
  { id: '21', name: '多高层',     code: '26D103', category: '建筑设计', status: '已开通', description: '多高层商业版，含BIM协同接口、Revit/Tekla双向互通', duration: 90, nodes: 80, icon: 'layers', price: 4200 },
  { id: '22', name: '网架网壳',   code: '26D104', category: '专项设计', status: '可申请', description: '网架网壳商业版，含参数化建模与智能截面优选', duration: 90, nodes: 50, icon: 'grid', price: 6800 },
  { id: '23', name: '钢构深化',   code: '26D105', category: '深化工具', status: '审核中', description: '钢构深化商业版，含云端并行计算与自动出图', duration: 90, nodes: 100, icon: 'beam', price: 9800 },
  { id: '24', name: '基础设计',   code: '26D106', category: '结构分析', status: '可申请', description: '基础设计商业版，含桩基负摩阻力、液化判别等高级功能', duration: 90, nodes: 60, icon: 'foundation', price: 3800 },
  { id: '25', name: '幕墙',       code: '26D107', category: '专项设计', status: '可申请', description: '幕墙商业版，含单元式幕墙设计与热工性能分析', duration: 60, nodes: 40, icon: 'panel', price: 5200 },
  { id: '26', name: '厂房',       code: '26D108', category: '工业厂房', status: '可申请', description: '厂房商业版，含吊车梁疲劳验算与抗风柱优化设计', duration: 90, nodes: 60, icon: 'factory', price: 4500 },
  { id: '27', name: '屋架桁架',   code: '26D109', category: '结构分析', status: '可申请', description: '屋架桁架商业版，含大跨度结构施工模拟与找形优化', duration: 60, nodes: 40, icon: 'triangle', price: 3600 },
  { id: '28', name: '塔架',       code: '26D110', category: '专项设计', status: '可申请', description: '塔架商业版，含风荷载动力分析与结构优化设计', duration: 90, nodes: 50, icon: 'bridge', price: 7200 },
  { id: '29', name: '光伏支架',   code: '26D111', category: '工业厂房', status: '已开通', description: '光伏支架商业版，含风洞模拟数据与跟踪系统动力分析', duration: 60, nodes: 40, icon: 'sun', price: 3200 },
  { id: '30', name: '围护深化',   code: '26D112', category: '深化工具', status: '可申请', description: '围护深化商业版，含保温计算、防水节点库与材料清单', duration: 60, nodes: 40, icon: 'shield', price: 4000 },
  { id: '31', name: '索膜',       code: '26D113', category: '专项设计', status: '审核中', description: '索膜商业版，含ETFE气枕分析与膜材裁剪下料优化', duration: 60, nodes: 30, icon: 'cable', price: 5500 },
  { id: '32', name: '变电构架',   code: '26D114', category: '工业厂房', status: '可申请', description: '变电构架商业版，含导线荷载自动计算与塔架优化', duration: 60, nodes: 30, icon: 'zap', price: 3400 },
];

export const moduleCategories: ModuleCategory[] = ['全部模块', '结构分析', '建筑设计', '工业厂房', '专项设计', '深化工具'];
export const paidModuleCategories: ModuleCategory[] = ['全部模块', '结构分析', '建筑设计', '工业厂房', '专项设计', '深化工具'];

// Application record types and data
export type ApplicationStatus = '待审核' | '审核中' | '已通过' | '已拒绝';

export interface ApplicationRecord {
  id: string;
  code: string;
  moduleName: string;
  moduleCode: string;
  applicant: string;
  department: string;
  applyTime: string;
  status: ApplicationStatus;
}

export const applicationRecords: ApplicationRecord[] = [
  { id: '1', code: 'AR001', moduleName: '基本分析模块', moduleCode: '26D101', applicant: '张三', department: '技术部', applyTime: '2026-03-25 10:30', status: '已通过' },
  { id: '2', code: 'AR002', moduleName: '高级建模模块', moduleCode: '27D102', applicant: '李四', department: '设计部', applyTime: '2026-03-26 09:15', status: '审核中' },
  { id: '3', code: 'AR003', moduleName: '渲染输出模块', moduleCode: '29D104', applicant: '王五', department: '产品部', applyTime: '2026-03-26 14:45', status: '待审核' },
  { id: '4', code: 'AR004', moduleName: '数据导入导出', moduleCode: '30D105', applicant: '赵六', department: '运营部', applyTime: '2026-03-24 16:20', status: '已拒绝' },
  { id: '5', code: 'AR005', moduleName: '智能优化模块', moduleCode: '31D106', applicant: '孙七', department: '技术部', applyTime: '2026-03-27 11:00', status: '待审核' },
];

// User types and data
export type UserStatus = '使用中' | '待审核' | '停用';

export interface User {
  id: string;
  code: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  moduleCount: number;
  status: UserStatus;
  registerTime: string;
  company: string;
  avatarColor: string;
}

export const users: User[] = [
  { id: '1', code: 'U001', name: '张三', department: '技术部', email: 'zhangsan@example.com', phone: '138****1234', moduleCount: 3, status: '使用中', registerTime: '2025-01-15', company: '公司A', avatarColor: '#1C71D8' },
  { id: '2', code: 'U002', name: '李四', department: '产品部', email: 'lisi@example.com', phone: '139****5678', moduleCount: 2, status: '使用中', registerTime: '2025-02-20', company: '公司B', avatarColor: '#22C55E' },
  { id: '3', code: 'U003', name: '王五', department: '设计部', email: 'wangwu@example.com', phone: '136****9012', moduleCount: 0, status: '待审核', registerTime: '2025-03-10', company: '公司C', avatarColor: '#F59E0B' },
  { id: '4', code: 'U004', name: '赵六', department: '运营部', email: 'zhaoliu@example.com', phone: '137****3456', moduleCount: 5, status: '使用中', registerTime: '2025-01-25', company: '公司D', avatarColor: '#EF4444' },
  { id: '5', code: 'U005', name: '孙七', department: '市场部', email: 'sunqi@example.com', phone: '135****7890', moduleCount: 1, status: '停用', registerTime: '2024-12-05', company: '公司E', avatarColor: '#8B5CF6' },
  { id: '6', code: 'U006', name: '周八', department: '技术部', email: 'zhouba@example.com', phone: '133****2345', moduleCount: 4, status: '使用中', registerTime: '2025-02-01', company: '公司F', avatarColor: '#EC4899' },
];

// Usage statistics data
export const usageTrend = [
  { date: '03-21', usage: 42, activeUsers: 48 },
  { date: '03-22', usage: 55, activeUsers: 52 },
  { date: '03-23', usage: 48, activeUsers: 47 },
  { date: '03-24', usage: 60, activeUsers: 58 },
  { date: '03-25', usage: 65, activeUsers: 62 },
  { date: '03-26', usage: 70, activeUsers: 68 },
  { date: '03-27', usage: 72, activeUsers: 73 },
];

export const moduleDistribution = [
  { name: '基本分析', value: 35, color: '#1C71D8' },
  { name: '高级建模', value: 26, color: '#22C55E' },
  { name: '协同设计', value: 20, color: '#F59E0B' },
  { name: '渲染输出', value: 11, color: '#EF4444' },
  { name: '数据导入', value: 8, color: '#8B5CF6' },
];

export const moduleRanking = [
  { name: '基本分析', count: 320 },
  { name: '高级建模', count: 245 },
  { name: '协同设计', count: 180 },
  { name: '渲染输出', count: 120 },
  { name: '数据导入', count: 75 },
];

export const departmentUsage = [
  { name: '技术部', current: 38, total: 45 },
  { name: '设计部', current: 28, total: 32 },
  { name: '产品部', current: 25, total: 28 },
  { name: '运营部', current: 15, total: 18 },
  { name: '市场部', current: 10, total: 12 },
];

// Current user profile (logged-in user)
export interface UserProfile {
  name: string;
  role: string;
  userId: string;
  avatar: string;
  company: string;
  companyVerified: boolean;
  phone: string;
  email: string;
  serverIp: string;
  serverConnected: boolean;
  registerTime: string;
  lastLogin: string;
  associatedCompany: string;
}

export const currentUser: UserProfile = {
  name: '用户名',
  role: '产品经理',
  userId: '123456789',
  avatar: '',
  company: '上海同磊土木工程技术有限公司',
  companyVerified: true,
  phone: '12345678900',
  email: 'user@tonglei.com',
  serverIp: '192.168.100.10',
  serverConnected: true,
  registerTime: '2025-01-15',
  lastLogin: '2026-03-31 09:42',
  associatedCompany: '上海同磊建筑科技有限公司',
};

export interface MyModuleUsage {
  moduleId: string;
  moduleName: string;
  moduleCode: string;
  icon: string;
  status: '使用中' | '已过期' | '即将到期';
  expireDate: string;
  totalDays: number;
  usedDays: number;
  lastUsed: string;
}

export const myModuleUsages: MyModuleUsage[] = [
  { moduleId: '1',  moduleName: '建筑结构', moduleCode: '26D101', icon: 'building',    status: '使用中',  expireDate: '2026-06-15', totalDays: 90,  usedDays: 52,  lastUsed: '2026-03-31' },
  { moduleId: '2',  moduleName: '基本分析', moduleCode: '26D102', icon: 'calculator',  status: '使用中',  expireDate: '2026-06-15', totalDays: 90,  usedDays: 48,  lastUsed: '2026-03-30' },
  { moduleId: '5',  moduleName: '多高层',   moduleCode: '26D105', icon: 'layers',      status: '即将到期', expireDate: '2026-04-10', totalDays: 90,  usedDays: 81,  lastUsed: '2026-03-31' },
  { moduleId: '12', moduleName: '基础设计', moduleCode: '26D112', icon: 'foundation',  status: '使用中',  expireDate: '2026-07-20', totalDays: 90,  usedDays: 30,  lastUsed: '2026-03-28' },
  { moduleId: '16', moduleName: '钢构深化', moduleCode: '26D116', icon: 'beam',        status: '使用中',  expireDate: '2026-08-01', totalDays: 90,  usedDays: 18,  lastUsed: '2026-03-29' },
  { moduleId: '21', moduleName: '多高层(商业版)', moduleCode: '26D103', icon: 'layers', status: '已过期',  expireDate: '2026-02-28', totalDays: 90,  usedDays: 90,  lastUsed: '2026-02-27' },
];

// Notification settings
export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export const defaultNotificationSettings: NotificationSetting[] = [
  { id: 'email', label: '邮件通知', description: '通过邮件发送通知', enabled: true, icon: 'mail' },
  { id: 'sms', label: '短信通知', description: '通过短信发送通知', enabled: false, icon: 'bell' },
  { id: 'approval', label: '审批通知', description: '审批结果通知申请人', enabled: true, icon: 'check-circle' },
  { id: 'expiry', label: '到期提醒', description: '试用期即将到期提醒', enabled: true, icon: 'clock' },
];
