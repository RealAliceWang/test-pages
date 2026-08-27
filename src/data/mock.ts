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

export interface ModuleDetailSection {
  title: string;
  content: string;
  features?: string[];
}

export interface ModuleDetailData {
  moduleId: string;
  fullDescription: string;
  sections: ModuleDetailSection[];
  standards?: string[];
  version: string;
  updateDate: string;
  highlights: string[];
}

export const modules: Module[] = [
  { id: '1',  name: '建筑结构',   code: '26D101', category: '结构分析', status: '已开通', description: '建筑整体建模与结构分析', duration: 90, nodes: 50, icon: 'building' },
  { id: '2',  name: '基本分析',   code: '26D102', category: '结构分析', status: '已开通', description: '静力、模态、稳定性基础计算', duration: 90, nodes: 50, icon: 'calculator' },
  { id: '3',  name: '高级分析',   code: '26D103', category: '结构分析', status: '可申请', description: '时程、推覆等高级分析功能', duration: 90, nodes: 30, icon: 'chart' },
  { id: '4',  name: '厂房',       code: '26D104', category: '工业厂房', status: '可申请', description: '工业厂房门式钢架与排架设计', duration: 90, nodes: 40, icon: 'factory' },
  { id: '5',  name: '多高层',     code: '26D105', category: '建筑设计', status: '已开通', description: '多高层钢结构整体设计与验算', duration: 90, nodes: 50, icon: 'layers' },
  { id: '6',  name: '屋架桁架',   code: '26D106', category: '结构分析', status: '可申请', description: '桁架与屋架建模及优化设计', duration: 60, nodes: 25, icon: 'triangle' },
  { id: '7',  name: '网架网壳',   code: '26D107', category: '专项设计', status: '可申请', description: '网架网壳参数化建模与分析', duration: 60, nodes: 30, icon: 'grid' },
  { id: '8',  name: '塔架',       code: '26D108', category: '专项设计', status: '审核中', description: '输电与通讯塔架结构分析', duration: 90, nodes: 35, icon: 'bridge' },
  { id: '9',  name: '辅助结构',   code: '26D109', category: '结构分析', status: '可申请', description: '楼梯、雨篷等辅助结构设计', duration: 30, nodes: 20, icon: 'wrench' },
  { id: '10', name: '幕墙',       code: '26D110', category: '专项设计', status: '可申请', description: '幕墙结构计算与安全校核', duration: 60, nodes: 25, icon: 'panel' },
  { id: '11', name: '索膜',       code: '26D111', category: '专项设计', status: '审核中', description: '索膜找形与裁剪荷载计算', duration: 30, nodes: 20, icon: 'cable' },
  { id: '12', name: '基础设计',   code: '26D112', category: '结构分析', status: '已开通', description: '各类基础选型与设计计算', duration: 90, nodes: 50, icon: 'foundation' },
  { id: '13', name: '变电构架',   code: '26D113', category: '工业厂房', status: '可申请', description: '变电站构架结构设计与分析', duration: 60, nodes: 20, icon: 'zap' },
  { id: '14', name: '光伏支架',   code: '26D114', category: '工业厂房', status: '可申请', description: '光伏支架系统结构设计', duration: 60, nodes: 25, icon: 'sun' },
  { id: '15', name: '通廊',       code: '26D115', category: '工业厂房', status: '可申请', description: '通廊结构与管道支架设计', duration: 30, nodes: 20, icon: 'corridor' },
  { id: '16', name: '钢构深化',   code: '26D116', category: '深化工具', status: '已开通', description: '钢构详图深化与BOM生成', duration: 90, nodes: 50, icon: 'beam' },
  { id: '17', name: '围护深化',   code: '26D117', category: '深化工具', status: '可申请', description: '围护系统深化设计与排版', duration: 60, nodes: 30, icon: 'shield' },
  { id: '18', name: '授权帮助',   code: '26D118', category: '深化工具', status: '可申请', description: '模块授权管理与许可分配', duration: 90, nodes: 100, icon: 'key' },
  { id: '33', name: '节点设计',   code: '26D119', category: '结构分析', status: '可申请', description: '钢结构节点连接设计与验算', duration: 60, nodes: 30, icon: 'wrench' },
  { id: '34', name: '抗震分析',   code: '26D120', category: '结构分析', status: '可申请', description: '多遇地震与罕遇地震性能评估', duration: 90, nodes: 40, icon: 'chart' },
  { id: '35', name: '管桁架',     code: '26D121', category: '专项设计', status: '已开通', description: '圆管与方管桁架节点相贯分析', duration: 60, nodes: 25, icon: 'triangle' },
  { id: '36', name: '储罐',       code: '26D122', category: '工业厂房', status: '可申请', description: '立式与卧式储罐结构计算', duration: 60, nodes: 20, icon: 'factory' },
  { id: '37', name: '看台',       code: '26D123', category: '建筑设计', status: '审核中', description: '体育场馆看台结构设计与分析', duration: 90, nodes: 35, icon: 'layers' },
  { id: '38', name: '桥梁',       code: '26D124', category: '专项设计', status: '可申请', description: '人行天桥与钢桥结构分析', duration: 90, nodes: 40, icon: 'bridge' },
  { id: '39', name: '构件校核',   code: '26D125', category: '深化工具', status: '已开通', description: '单构件快速承载力校核工具', duration: 30, nodes: 50, icon: 'calculator' },
  { id: '40', name: '参数化建模', code: '26D126', category: '深化工具', status: '可申请', description: '参数驱动的结构快速建模工具', duration: 60, nodes: 30, icon: 'grid' },
  // Paid modules — commercial versions with extended features
  { id: '19', name: '建筑结构',   code: '26D101', category: '结构分析', status: '可申请', description: '高级版，含超限审查与复杂体型分析', duration: 90, nodes: 80, icon: 'building', price: 4800 },
  { id: '20', name: '高级分析',   code: '26D102', category: '结构分析', status: '可申请', description: '商业版，含抗震性能评估报告', duration: 90, nodes: 50, icon: 'chart', price: 5800 },
  { id: '21', name: '多高层',     code: '26D103', category: '建筑设计', status: '已开通', description: '商业版，含BIM协同与Revit互通', duration: 90, nodes: 80, icon: 'layers', price: 4200 },
  { id: '22', name: '网架网壳',   code: '26D104', category: '专项设计', status: '可申请', description: '商业版，含智能截面优选', duration: 90, nodes: 50, icon: 'grid', price: 6800 },
  { id: '23', name: '钢构深化',   code: '26D105', category: '深化工具', status: '审核中', description: '商业版，含云端计算与自动出图', duration: 90, nodes: 100, icon: 'beam', price: 9800 },
  { id: '24', name: '基础设计',   code: '26D106', category: '结构分析', status: '可申请', description: '商业版，含桩基与液化判别', duration: 90, nodes: 60, icon: 'foundation', price: 3800 },
  { id: '25', name: '幕墙',       code: '26D107', category: '专项设计', status: '可申请', description: '商业版，含单元式幕墙与热工分析', duration: 60, nodes: 40, icon: 'panel', price: 5200 },
  { id: '26', name: '厂房',       code: '26D108', category: '工业厂房', status: '可申请', description: '商业版，含疲劳验算与抗风优化', duration: 90, nodes: 60, icon: 'factory', price: 4500 },
  { id: '27', name: '屋架桁架',   code: '26D109', category: '结构分析', status: '可申请', description: '商业版，含施工模拟与找形优化', duration: 60, nodes: 40, icon: 'triangle', price: 3600 },
  { id: '28', name: '塔架',       code: '26D110', category: '专项设计', status: '可申请', description: '商业版，含风荷载动力分析', duration: 90, nodes: 50, icon: 'bridge', price: 7200 },
  { id: '29', name: '光伏支架',   code: '26D111', category: '工业厂房', status: '已开通', description: '商业版，含风洞模拟与动力分析', duration: 60, nodes: 40, icon: 'sun', price: 3200 },
  { id: '30', name: '围护深化',   code: '26D112', category: '深化工具', status: '可申请', description: '商业版，含保温计算与材料清单', duration: 60, nodes: 40, icon: 'shield', price: 4000 },
  { id: '31', name: '索膜',       code: '26D113', category: '专项设计', status: '审核中', description: '索膜商业版，含ETFE气枕分析与膜材裁剪下料优化', duration: 60, nodes: 30, icon: 'cable', price: 5500 },
  { id: '32', name: '变电构架',   code: '26D114', category: '工业厂房', status: '可申请', description: '变电构架商业版，含导线荷载自动计算与塔架优化', duration: 60, nodes: 30, icon: 'zap', price: 3400 },
  { id: '41', name: '节点设计',   code: '26D119', category: '结构分析', status: '可申请', description: '商业版，含参数化节点库与焊缝校核', duration: 90, nodes: 50, icon: 'wrench', price: 4600 },
  { id: '42', name: '抗震分析',   code: '26D120', category: '结构分析', status: '可申请', description: '商业版，含减隔震设计与易损性分析', duration: 90, nodes: 60, icon: 'chart', price: 8200 },
  { id: '43', name: '管桁架',     code: '26D121', category: '专项设计', status: '已开通', description: '商业版，含复杂相贯节点与疲劳分析', duration: 90, nodes: 40, icon: 'triangle', price: 5600 },
  { id: '44', name: '储罐',       code: '26D122', category: '工业厂房', status: '可申请', description: '商业版，含大型储罐抗震与热应力分析', duration: 90, nodes: 40, icon: 'factory', price: 6200 },
  { id: '45', name: '看台',       code: '26D123', category: '建筑设计', status: '可申请', description: '商业版，含人致振动舒适度评估', duration: 90, nodes: 50, icon: 'layers', price: 5800 },
  { id: '46', name: '桥梁',       code: '26D124', category: '专项设计', status: '可申请', description: '商业版，含车辆荷载动力分析与疲劳评估', duration: 90, nodes: 60, icon: 'bridge', price: 9200 },
  { id: '47', name: '参数化建模', code: '26D126', category: '深化工具', status: '可申请', description: '商业版，含AI辅助建模与批量参数优化', duration: 90, nodes: 50, icon: 'grid', price: 7500 },
  { id: '48', name: '通廊',       code: '26D115', category: '工业厂房', status: '可申请', description: '商业版，含管道荷载自动导入与支架优化', duration: 90, nodes: 40, icon: 'corridor', price: 3900 },
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
  { id: '6', code: 'AR006', moduleName: '高级分析', moduleCode: '26D103', applicant: '用户名', department: '产品部', applyTime: '2026-03-28 09:30', status: '审核中' },
  { id: '7', code: 'AR007', moduleName: '屋架桁架', moduleCode: '26D106', applicant: '用户名', department: '产品部', applyTime: '2026-03-29 14:00', status: '已通过' },
  { id: '8', code: 'AR008', moduleName: '网架网壳', moduleCode: '26D107', applicant: '用户名', department: '产品部', applyTime: '2026-03-30 10:15', status: '待审核' },
  { id: '9', code: 'AR009', moduleName: '辅助结构', moduleCode: '26D109', applicant: '用户名', department: '产品部', applyTime: '2026-03-27 16:40', status: '已通过' },
  { id: '10', code: 'AR010', moduleName: '幕墙', moduleCode: '26D110', applicant: '用户名', department: '产品部', applyTime: '2026-03-26 10:20', status: '已拒绝' },
  { id: '11', code: 'AR011', moduleName: '变电构架', moduleCode: '26D113', applicant: '用户名', department: '产品部', applyTime: '2026-03-25 11:15', status: '已通过' },
  { id: '12', code: 'AR012', moduleName: '光伏支架', moduleCode: '26D114', applicant: '用户名', department: '产品部', applyTime: '2026-03-24 09:00', status: '审核中' },
  { id: '13', code: 'AR013', moduleName: '参数化建模', moduleCode: '26D126', applicant: '用户名', department: '产品部', applyTime: '2026-03-31 08:45', status: '待审核' },
  { id: '14', code: 'AR014', moduleName: '通廊', moduleCode: '26D115', applicant: '张三', department: '技术部', applyTime: '2026-03-30 15:30', status: '审核中' },
  { id: '15', code: 'AR015', moduleName: '抗震分析', moduleCode: '26D120', applicant: '李四', department: '设计部', applyTime: '2026-03-29 10:00', status: '待审核' },
  { id: '16', code: 'AR016', moduleName: '储罐', moduleCode: '26D122', applicant: '王五', department: '产品部', applyTime: '2026-03-28 14:20', status: '已通过' },
];

// Purchase order types and data
export type PurchaseOrderStatus = '待支付' | '已支付' | '已完成' | '已取消';

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  moduleName: string;
  moduleCode: string;
  amount: number;
  payMethod: string;
  buyer: string;
  department: string;
  orderTime: string;
  status: PurchaseOrderStatus;
}

export const purchaseOrders: PurchaseOrder[] = [
  { id: '1', orderNo: 'ORD202603251020001', moduleName: '建筑结构（商业版）', moduleCode: '26D101', amount: 4800, payMethod: '支付宝', buyer: '张三', department: '技术部', orderTime: '2026-03-25 10:20', status: '已完成' },
  { id: '2', orderNo: 'ORD202603261430002', moduleName: '多高层（商业版）', moduleCode: '26D103', amount: 4200, payMethod: '对公转账', buyer: '李四', department: '设计部', orderTime: '2026-03-26 14:30', status: '已支付' },
  { id: '3', orderNo: 'ORD202603270900003', moduleName: '网架网壳（商业版）', moduleCode: '26D104', amount: 6800, payMethod: '微信支付', buyer: '王五', department: '产品部', orderTime: '2026-03-27 09:00', status: '待支付' },
  { id: '4', orderNo: 'ORD202603281100004', moduleName: '基础设计（商业版）', moduleCode: '26D106', amount: 3800, payMethod: '支付宝', buyer: '赵六', department: '运营部', orderTime: '2026-03-28 11:00', status: '已完成' },
  { id: '5', orderNo: 'ORD202603290830005', moduleName: '钢构深化（商业版）', moduleCode: '26D105', amount: 9800, payMethod: '对公转账', buyer: '张三', department: '技术部', orderTime: '2026-03-29 08:30', status: '已取消' },
  { id: '6', orderNo: 'ORD202603301600006', moduleName: '幕墙（商业版）', moduleCode: '26D107', amount: 5200, payMethod: '支付宝', buyer: '孙七', department: '技术部', orderTime: '2026-03-30 16:00', status: '已支付' },
  { id: '7', orderNo: 'ORD202603311045007', moduleName: '多高层（商业版）', moduleCode: '26D103', amount: 4200, payMethod: '支付宝', buyer: '用户名', department: '产品部', orderTime: '2026-03-31 10:45', status: '已完成' },
  { id: '8', orderNo: 'ORD202604010900008', moduleName: '基础设计（商业版）', moduleCode: '26D106', amount: 3800, payMethod: '微信支付', buyer: '用户名', department: '产品部', orderTime: '2026-04-01 09:00', status: '待支付' },
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
  { id: '1', code: 'U001', name: '张三', department: '技术部', email: 'zhangsan@example.com', phone: '138****1234', moduleCount: 3, status: '使用中', registerTime: '2025-01-15', company: '公司A', avatarColor: '#2563EB' },
  { id: '2', code: 'U002', name: '李四', department: '产品部', email: 'lisi@example.com', phone: '139****5678', moduleCount: 2, status: '使用中', registerTime: '2025-02-20', company: '公司B', avatarColor: '#22C55E' },
  { id: '3', code: 'U003', name: '王五', department: '设计部', email: 'wangwu@example.com', phone: '136****9012', moduleCount: 0, status: '待审核', registerTime: '2025-03-10', company: '公司C', avatarColor: '#F59E0B' },
  { id: '4', code: 'U004', name: '赵六', department: '运营部', email: 'zhaoliu@example.com', phone: '137****3456', moduleCount: 5, status: '使用中', registerTime: '2025-01-25', company: '公司D', avatarColor: '#EF4444' },
  { id: '5', code: 'U005', name: '孙七', department: '市场部', email: 'sunqi@example.com', phone: '135****7890', moduleCount: 1, status: '停用', registerTime: '2024-12-05', company: '公司E', avatarColor: '#8B5CF6' },
  { id: '6', code: 'U006', name: '周八', department: '技术部', email: 'zhouba@example.com', phone: '133****2345', moduleCount: 4, status: '使用中', registerTime: '2025-02-01', company: '公司F', avatarColor: '#EC4899' },
];

// Usage statistics data — admin view (system-wide)
export const usageTrend = [
  { date: '03-21', usage: 42, activeUsers: 48 },
  { date: '03-22', usage: 55, activeUsers: 52 },
  { date: '03-23', usage: 48, activeUsers: 47 },
  { date: '03-24', usage: 60, activeUsers: 58 },
  { date: '03-25', usage: 65, activeUsers: 62 },
  { date: '03-26', usage: 70, activeUsers: 68 },
  { date: '03-27', usage: 72, activeUsers: 73 },
];

// Usage statistics data — user view (personal)
export const myUsageTrend = [
  { date: '03-21', usage: 5, duration: 2.5 },
  { date: '03-22', usage: 8, duration: 3.8 },
  { date: '03-23', usage: 3, duration: 1.2 },
  { date: '03-24', usage: 7, duration: 3.5 },
  { date: '03-25', usage: 9, duration: 4.2 },
  { date: '03-26', usage: 6, duration: 3.0 },
  { date: '03-27', usage: 10, duration: 4.8 },
];

export const moduleDistribution = [
  { name: '基本分析', value: 35, color: '#2563EB' },
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

export const myModuleRanking = [
  { name: '建筑结构', count: 52 },
  { name: '基本分析', count: 48 },
  { name: '多高层', count: 35 },
  { name: '基础设计', count: 30 },
  { name: '钢构深化', count: 18 },
];

export const departmentUsage = [
  { name: '技术部', current: 38, total: 45 },
  { name: '设计部', current: 28, total: 32 },
  { name: '产品部', current: 25, total: 28 },
  { name: '运营部', current: 15, total: 18 },
  { name: '市场部', current: 10, total: 12 },
];

export const myModuleStats = [
  { name: '建筑结构', usedDays: 52, totalDays: 90, status: '使用中' as const },
  { name: '基本分析', usedDays: 48, totalDays: 90, status: '使用中' as const },
  { name: '多高层', usedDays: 81, totalDays: 90, status: '即将到期' as const },
  { name: '基础设计', usedDays: 30, totalDays: 90, status: '使用中' as const },
  { name: '钢构深化', usedDays: 18, totalDays: 90, status: '使用中' as const },
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
  role: '结构工程师',
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

// Module detail data
export const moduleDetails: Record<string, ModuleDetailData> = {
  '1': {
    moduleId: '1',
    fullDescription: '支持任意结构类型及组合结构的建模、计算分析、设计验算、绘制结构布置图等一整套设计流程，支持钢结构防火设计，支持外部调用API，对创建和编辑模型，读取计算结果等操作进行大量的简化和封装。',
    sections: [
      {
        title: '核心功能',
        content: '包含梁柱单元、杆单元、只拉只压单元等线单元，以及楼板、剪力墙（板、壳、膜）等面单元的建模和计算验算；支持建模、计算、验算过程中信息的显示查询以及文本表格输出；支持虚杆实杆无缝转化。',
        features: [
          '任意结构类型及组合结构建模',
          '梁柱单元、杆单元、面单元建模与验算',
          '钢结构防火设计',
          '外部API调用支持',
          '计算结果查询与报告输出',
          '虚杆实杆无缝转化',
        ],
      },
      {
        title: '深化加工',
        content: '支持计算模型的一键导入3D3S Solid进行深化设计加工，实现从设计到加工的无缝对接，大幅提升工作效率。',
        features: [
          '一键导入3D3S Solid',
          '从设计到加工无缝对接',
          '自动化出图与BOM生成',
        ],
      },
    ],
    standards: [
      '《建筑与市政工程抗震通用规范》',
      '《建筑结构可靠度设计统一标准》',
      '《建筑结构荷载规范》',
      '《建筑抗震设计规范》',
      '《钢结构设计标准》',
      '《钢结构通用规范》',
      '《工程结构通用规范》',
      '《混凝土结构设计规范》',
      '《铝合金结构设计规范》',
      '《不锈钢结构技术规范》',
      '《锅炉钢结构设计规范》',
      '《建筑钢结构防火技术规范》',
      '《欧洲钢结构规范 EN1993-1-1》',
      '《2005美国钢结构设计规范 ANSI/AISC 360-16》',
    ],
    version: 'V3.2.1',
    updateDate: '2026-03-15',
    highlights: ['支持复杂组合结构', '完整设计验算流程', '丰富的规范支持', 'API扩展能力'],
  },
  '2': {
    moduleId: '2',
    fullDescription: '支持任意结构类型及组合结构的建模、计算分析、设计验算、绘制结构布置图等一整套设计流程，支持钢结构防火设计，支持外部调用API，对创建和编辑模型，读取计算结果等操作进行大量的简化和封装。',
    sections: [
      {
        title: '静力分析',
        content: '提供完整的静力分析功能，包括线性静力分析、几何非线性分析、材料非线性分析等。支持多种荷载类型和荷载组合，可自动生成最不利荷载组合进行包络设计。',
        features: [
          '线性静力分析',
          '几何非线性P-Delta分析',
          '材料非线性分析',
          '多种荷载类型支持',
          '自动荷载组合生成',
        ],
      },
      {
        title: '模态分析',
        content: '支持结构动力特性分析，可计算结构的自振频率和振型。采用Lanczos法和子空间迭代法求解特征值问题，适用于大型复杂结构。',
        features: [
          '自振频率与振型计算',
          'Lanczos法特征值求解',
          '子空间迭代法',
          '质量参与系数计算',
          '振型动画显示',
        ],
      },
      {
        title: '稳定性分析',
        content: '提供结构整体稳定性分析和构件稳定性验算功能，包括弹性屈曲分析、考虑初始缺陷的非线性屈曲分析，以及基于规范的构件稳定性验算。',
        features: [
          '弹性屈曲分析',
          '非线性屈曲分析',
          '初始缺陷模拟',
          '构件稳定性验算',
          '整体与局部稳定性评估',
        ],
      },
    ],
    standards: [
      '《建筑与市政工程抗震通用规范》',
      '《建筑结构可靠度设计统一标准》',
      '《建筑结构荷载规范》',
      '《建筑抗震设计规范》',
      '《钢结构设计标准》',
      '《钢结构通用规范》',
      '《工程结构通用规范》',
      '《混凝土结构设计规范》',
      '《铝合金结构设计规范》',
      '《不锈钢结构技术规范》',
      '《锅炉钢结构设计规范》',
      '《建筑钢结构防火技术规范》',
      '《欧洲钢结构规范 EN1993-1-1》',
      '《2005美国钢结构设计规范 ANSI/AISC 360-16》',
    ],
    version: 'V3.2.1',
    updateDate: '2026-03-15',
    highlights: ['静力/模态/稳定性三大核心分析', '支持非线性分析', '丰富的规范支持', '大型结构高效求解'],
  },
  '3': {
    moduleId: '3',
    fullDescription: '提供时程分析、推覆分析（Pushover）、反应谱分析等高级动力分析方法，适用于复杂结构的抗震性能评估与设计优化。',
    sections: [
      {
        title: '时程分析',
        content: '支持线性和非线性时程分析，可采用直接积分法和振型叠加法。内置丰富的地震波库，支持人工波和天然波的选择与调幅。',
        features: ['线性/非线性时程分析', '直接积分法与振型叠加法', '地震波库与选波调幅', '多点激励分析'],
      },
      {
        title: '推覆分析',
        content: '基于性能的抗震设计方法，通过逐步增加水平荷载评估结构从弹性到塑性的全过程响应，生成能力谱曲线与性能点评估。',
        features: ['静力弹塑性分析', '能力谱方法', '性能点评估', '塑性铰发展过程追踪'],
      },
    ],
    standards: ['《建筑抗震设计规范》', '《建筑与市政工程抗震通用规范》', '《高层建筑混凝土结构技术规程》'],
    version: 'V3.1.0',
    updateDate: '2026-02-20',
    highlights: ['时程/推覆/反应谱分析', '非线性动力分析', '性能化抗震设计', '丰富地震波库'],
  },
  '4': {
    moduleId: '4',
    fullDescription: '专用于工业厂房结构设计，支持门式钢架、排架结构的快速建模与设计验算，提供完整的荷载计算与构件优化功能。',
    sections: [
      {
        title: '门式钢架设计',
        content: '支持单跨、多跨门式刚架的参数化快速建模，自动生成吊车荷载、风荷载等工业荷载，提供截面优化与经济性分析。',
        features: ['参数化快速建模', '吊车荷载自动生成', '风荷载计算', '截面优化设计', '经济性分析'],
      },
      {
        title: '排架结构',
        content: '支持钢筋混凝土排架柱与钢结构排架的设计计算，包含牛腿设计、柱间支撑设计等专项功能。',
        features: ['排架柱设计计算', '牛腿设计', '柱间支撑设计', '基础设计接口'],
      },
    ],
    standards: ['《门式刚架轻型房屋钢结构技术规范》', '《钢结构设计标准》', '《建筑结构荷载规范》'],
    version: 'V3.0.2',
    updateDate: '2026-01-10',
    highlights: ['门式钢架快速设计', '排架结构支持', '自动荷载计算', '截面优化'],
  },
  '5': {
    moduleId: '5',
    fullDescription: '针对多高层钢结构的专业设计工具，支持框架、框架-支撑、框架-核心筒等多种结构体系的整体分析与设计验算。',
    sections: [
      {
        title: '整体分析',
        content: '支持多高层钢结构的整体建模与分析，包括层间位移角、整体稳定、舒适度验算等，自动判断结构规则性。',
        features: ['多种结构体系支持', '层间位移角计算', '整体稳定性分析', '舒适度验算', '结构规则性判断'],
      },
      {
        title: '构件设计',
        content: '提供梁、柱、支撑等构件的截面设计与验算，支持组合截面、变截面构件，自动进行长细比和宽厚比验算。',
        features: ['梁柱截面设计', '支撑构件验算', '组合截面支持', '长细比/宽厚比自动验算'],
      },
    ],
    standards: ['《钢结构设计标准》', '《高层民用建筑钢结构技术规程》', '《建筑抗震设计规范》'],
    version: 'V3.1.5',
    updateDate: '2026-02-28',
    highlights: ['多种结构体系', '整体与构件设计', '规则性自动判断', '完整设计报告'],
  },
  '6': {
    moduleId: '6',
    fullDescription: '专业的桁架与屋架结构设计工具，支持各类平面桁架、空间桁架的建模分析与优化设计。',
    sections: [
      {
        title: '桁架建模',
        content: '支持三角形、梯形、平行弦等多种桁架形式的参数化建模，自动生成节点与杆件，支持复杂拓扑结构。',
        features: ['多种桁架形式', '参数化建模', '自动节点生成', '复杂拓扑支持'],
      },
      {
        title: '优化设计',
        content: '提供截面优化与拓扑优化功能，在满足规范要求的前提下寻找最经济的设计方案。',
        features: ['截面优化', '拓扑优化', '经济性评估', '多方案比选'],
      },
    ],
    standards: ['《钢结构设计标准》', '《冷弯薄壁型钢结构技术规范》'],
    version: 'V2.8.0',
    updateDate: '2025-12-15',
    highlights: ['参数化桁架建模', '截面与拓扑优化', '多形式桁架支持', '经济性分析'],
  },
  '7': {
    moduleId: '7',
    fullDescription: '网架网壳结构专业设计工具，支持正放四角锥、斜放四角锥、三角锥等多种网格形式的参数化建模与分析。',
    sections: [
      {
        title: '参数化建模',
        content: '支持平板网架、球面网壳、柱面网壳等多种结构形式的快速参数化生成，可自定义网格密度与边界条件。',
        features: ['多种网格形式', '平板/球面/柱面支持', '网格密度自定义', '边界条件设定'],
      },
      {
        title: '分析计算',
        content: '提供整体稳定性分析、非线性屈曲分析、风荷载体型系数计算等专项分析功能。',
        features: ['整体稳定性分析', '非线性屈曲分析', '风荷载体型系数', '节点承载力验算'],
      },
    ],
    standards: ['《空间网格结构技术规程》', '《钢结构设计标准》'],
    version: 'V2.9.0',
    updateDate: '2026-01-20',
    highlights: ['参数化网架生成', '多种网格形式', '稳定性专项分析', '风荷载计算'],
  },
  '8': {
    moduleId: '8',
    fullDescription: '输电塔架与通讯塔架的专业结构分析工具，支持角钢塔、钢管塔等多种塔型的建模、荷载计算与设计验算。',
    sections: [
      {
        title: '塔架建模',
        content: '支持自立式铁塔、拉线塔等多种塔型的参数化快速建模，自动生成主材、斜材、辅材等杆件。',
        features: ['多种塔型支持', '参数化快速建模', '自动杆件生成', '节点板设计'],
      },
      {
        title: '荷载与验算',
        content: '内置电力行业风荷载规范，支持覆冰荷载、导线荷载的自动计算，提供完整的杆件验算与基础设计接口。',
        features: ['风荷载自动计算', '覆冰荷载模拟', '导线荷载计算', '杆件验算'],
      },
    ],
    standards: ['《架空输电线路杆塔结构设计规定》', '《高耸结构设计标准》', '《钢结构设计标准》'],
    version: 'V2.7.0',
    updateDate: '2025-11-30',
    highlights: ['多种塔型设计', '电力行业荷载', '覆冰模拟', '完整验算报告'],
  },
  '9': {
    moduleId: '9',
    fullDescription: '楼梯、雨篷、挡墙等辅助结构的快速设计工具，支持常见辅助结构的参数化建模与设计验算。',
    sections: [
      {
        title: '辅助结构类型',
        content: '支持钢楼梯、雨篷、平台、栏杆等常见辅助结构的设计，提供参数化模板快速生成模型。',
        features: ['钢楼梯设计', '雨篷设计', '平台设计', '栏杆计算', '参数化模板'],
      },
    ],
    standards: ['《钢结构设计标准》', '《建筑结构荷载规范》'],
    version: 'V2.5.0',
    updateDate: '2025-10-15',
    highlights: ['多种辅助结构', '参数化模板', '快速设计出图'],
  },
  '10': {
    moduleId: '10',
    fullDescription: '幕墙结构计算与安全校核专业工具，支持框架式、单元式、点支式等多种幕墙类型的结构计算。',
    sections: [
      {
        title: '幕墙类型',
        content: '支持框架式幕墙、单元式幕墙、点支撑玻璃幕墙、全玻幕墙等多种类型的结构计算与安全校核。',
        features: ['框架式幕墙', '单元式幕墙', '点支撑幕墙', '全玻幕墙', '石材幕墙'],
      },
      {
        title: '安全验算',
        content: '提供面板强度、立柱挠度、连接件承载力等全面的安全验算，支持风荷载与地震作用的组合计算。',
        features: ['面板强度验算', '立柱挠度验算', '连接件承载力', '风荷载计算', '地震作用组合'],
      },
    ],
    standards: ['《玻璃幕墙工程技术规范》', '《金属与石材幕墙工程技术规范》', '《建筑幕墙》'],
    version: 'V2.6.0',
    updateDate: '2025-11-20',
    highlights: ['多种幕墙类型', '完整安全验算', '风荷载计算', '规范验算报告'],
  },
  '11': {
    moduleId: '11',
    fullDescription: '索膜结构专业设计工具，支持索膜结构的找形分析、荷载分析和裁剪分析全流程设计。',
    sections: [
      {
        title: '找形分析',
        content: '采用力密度法和动力松弛法进行索膜结构的初始形态找形，支持多种膜面形态的生成与优化。',
        features: ['力密度法找形', '动力松弛法', '膜面形态优化', '边界条件设定'],
      },
      {
        title: '裁剪分析',
        content: '根据找形结果进行膜材裁剪下料计算，生成裁剪图与下料清单，支持膜材补偿量的精确计算。',
        features: ['裁剪图生成', '下料清单', '补偿量计算', '膜材利用率优化'],
      },
    ],
    standards: ['《膜结构技术规程》', '《索结构技术规程》'],
    version: 'V2.4.0',
    updateDate: '2025-09-10',
    highlights: ['找形/荷载/裁剪全流程', '多种找形方法', '裁剪下料优化'],
  },
  '12': {
    moduleId: '12',
    fullDescription: '各类基础选型与设计计算工具，支持独立基础、条形基础、筏板基础、桩基础等多种基础形式。',
    sections: [
      {
        title: '基础类型',
        content: '支持独立基础、联合基础、条形基础、筏板基础、桩基础等多种基础形式的选型与设计计算。',
        features: ['独立基础设计', '条形基础设计', '筏板基础设计', '桩基础设计', '联合基础设计'],
      },
      {
        title: '地基计算',
        content: '提供地基承载力计算、沉降计算、地基稳定性分析等功能，支持多种地基处理方案的对比分析。',
        features: ['承载力计算', '沉降计算', '稳定性分析', '地基处理方案', '方案对比分析'],
      },
    ],
    standards: ['《建筑地基基础设计规范》', '《建筑桩基技术规范》', '《建筑地基处理技术规范》'],
    version: 'V3.0.0',
    updateDate: '2026-01-05',
    highlights: ['多种基础类型', '完整地基计算', '方案对比分析', '规范验算报告'],
  },
  '16': {
    moduleId: '16',
    fullDescription: '钢结构详图深化与BOM生成工具，实现从设计模型到加工图纸的自动化转换。',
    sections: [
      {
        title: '详图深化',
        content: '自动从设计模型提取构件信息，生成加工详图，包括零件图、组装图、安装图等，支持自定义出图模板。',
        features: ['自动提取构件信息', '零件图/组装图/安装图', '自定义出图模板', '批量出图'],
      },
      {
        title: 'BOM生成',
        content: '自动统计材料清单，生成BOM表格，支持按工程、楼层、构件类型等多维度汇总。',
        features: ['自动材料统计', '多维度BOM汇总', '材料利用率分析', '采购清单生成'],
      },
    ],
    standards: ['《钢结构工程施工质量验收标准》', '《钢结构焊接规范》'],
    version: 'V3.2.0',
    updateDate: '2026-03-01',
    highlights: ['自动化出图', 'BOM自动生成', '多维度统计', '加工图纸输出'],
  },
};
