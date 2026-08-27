import { modules as rawModules } from '../data/mock';
import type {
  Application,
  Assignment,
  AuditLog,
  CatalogModule,
  Department,
  Member,
  ModuleCategory,
  Order,
  Organization,
  SeatPool,
} from './types';

/** Fixed "now" so the seeded scenario stays reproducible. */
export const TODAY = '2026-03-31';
export const NOW = '2026-03-31 09:42';

// ---------------------------------------------------------------- catalog
// Reuse the existing module content and normalize it into the new shape.

export const catalog: CatalogModule[] = rawModules.map((m) => ({
  id: m.id,
  name: m.name,
  code: m.code,
  category: m.category as ModuleCategory,
  edition: m.price ? '商业版' : '免费版',
  description: m.description,
  icon: m.icon,
  duration: m.duration,
  nodes: m.nodes,
  unitPrice: m.price ?? 0,
  listed: true,
}));

export const categories: ModuleCategory[] = [
  '结构分析',
  '建筑设计',
  '工业厂房',
  '专项设计',
  '深化工具',
];

// ---------------------------------------------------------------- orgs

export const VENDOR_ORG_ID = 'org-vendor';

/** The customer organization the demo is told from. */
export const DEMO_ORG_ID = 'org-1';

export const organizations: Organization[] = [
  {
    id: 'org-vendor',
    name: '上海同磊土木工程技术有限公司',
    shortName: '同磊土木',
    code: 'VENDOR',
    verified: true,
    freeSeatQuota: 0,
    contactName: '沈涛',
    contactPhone: '021-6598****',
    industry: '工业软件',
    scale: '厂商',
    createdAt: '2020-01-01',
    status: '正常',
  },
  {
    id: 'org-1',
    name: '上海云构结构设计研究院有限公司',
    shortName: '云构设计院',
    code: 'ORG20260001',
    verified: true,
    freeSeatQuota: 40,
    contactName: '王振华',
    contactPhone: '138****2860',
    industry: '建筑设计',
    scale: '200-500 人',
    createdAt: '2025-01-15',
    status: '正常',
  },
  {
    id: 'org-2',
    name: '江苏中钢建筑设计有限公司',
    shortName: '江苏中钢',
    code: 'ORG20260002',
    verified: true,
    freeSeatQuota: 25,
    contactName: '刘长海',
    contactPhone: '139****7412',
    industry: '钢结构设计',
    scale: '100-200 人',
    createdAt: '2025-04-08',
    status: '正常',
  },
  {
    id: 'org-3',
    name: '浙江天工钢结构工程有限公司',
    shortName: '浙江天工',
    code: 'ORG20260003',
    verified: true,
    freeSeatQuota: 15,
    contactName: '陈立群',
    contactPhone: '136****5530',
    industry: '钢结构工程',
    scale: '50-100 人',
    createdAt: '2025-07-22',
    status: '正常',
  },
  {
    id: 'org-4',
    name: '华南工业建筑设计院',
    shortName: '华南工建',
    code: 'ORG20260004',
    verified: false,
    freeSeatQuota: 10,
    contactName: '黄志强',
    contactPhone: '135****9018',
    industry: '工业建筑',
    scale: '50-100 人',
    createdAt: '2026-03-18',
    status: '正常',
  },
];

export const departments: Department[] = [
  { id: 'dept-1', orgId: 'org-1', name: '结构一所', code: 'D101', managerId: 'm-2' },
  { id: 'dept-2', orgId: 'org-1', name: '结构二所', code: 'D102', managerId: 'm-6' },
  { id: 'dept-3', orgId: 'org-1', name: '钢构深化部', code: 'D103', managerId: 'm-9' },
  { id: 'dept-4', orgId: 'org-1', name: '工业厂房部', code: 'D104', managerId: 'm-12' },
  { id: 'dept-5', orgId: 'org-1', name: '总工办', code: 'D105', managerId: 'm-1' },
];

export const members: Member[] = [
  { id: 'm-1',  orgId: 'org-1', deptId: 'dept-5', name: '王振华', employeeNo: 'YG0001', title: '总工程师',       role: 'ORG_ADMIN',  email: 'wangzh@yungou.com',  phone: '138****2860', status: '在职',   joinedAt: '2025-01-15', lastLogin: '2026-03-31 08:50', avatarColor: '#2563EB' },
  { id: 'm-2',  orgId: 'org-1', deptId: 'dept-1', name: '李明',   employeeNo: 'YG0002', title: '结构一所所长',   role: 'DEPT_ADMIN', email: 'liming@yungou.com',  phone: '139****3170', status: '在职',   joinedAt: '2025-01-20', lastLogin: '2026-03-31 09:12', avatarColor: '#16A34A' },
  { id: 'm-3',  orgId: 'org-1', deptId: 'dept-1', name: '张思远', employeeNo: 'YG0007', title: '结构工程师',     role: 'MEMBER',     email: 'zhangsy@yungou.com', phone: '136****4425', status: '在职',   joinedAt: '2025-03-02', lastLogin: '2026-03-31 09:42', avatarColor: '#F97316' },
  { id: 'm-4',  orgId: 'org-1', deptId: 'dept-1', name: '陈雨',   employeeNo: 'YG0011', title: '结构工程师',     role: 'MEMBER',     email: 'chenyu@yungou.com',  phone: '137****8890', status: '在职',   joinedAt: '2025-05-14', lastLogin: '2026-03-30 17:20', avatarColor: '#8B5CF6' },
  { id: 'm-5',  orgId: 'org-1', deptId: 'dept-1', name: '刘颖',   employeeNo: 'YG0032', title: '助理工程师',     role: 'MEMBER',     email: 'liuying@yungou.com', phone: '135****2233', status: '待激活', joinedAt: '2026-03-28', lastLogin: '—',                avatarColor: '#EC4899' },
  { id: 'm-6',  orgId: 'org-1', deptId: 'dept-2', name: '赵国栋', employeeNo: 'YG0003', title: '结构二所所长',   role: 'DEPT_ADMIN', email: 'zhaogd@yungou.com',  phone: '138****6614', status: '在职',   joinedAt: '2025-01-20', lastLogin: '2026-03-31 08:33', avatarColor: '#0EA5E9' },
  { id: 'm-7',  orgId: 'org-1', deptId: 'dept-2', name: '孙浩',   employeeNo: 'YG0009', title: '高级结构工程师', role: 'MEMBER',     email: 'sunhao@yungou.com',  phone: '139****1102', status: '在职',   joinedAt: '2025-02-26', lastLogin: '2026-03-31 09:05', avatarColor: '#14B8A6' },
  { id: 'm-8',  orgId: 'org-1', deptId: 'dept-2', name: '周敏',   employeeNo: 'YG0014', title: '结构工程师',     role: 'MEMBER',     email: 'zhoumin@yungou.com', phone: '136****7756', status: '在职',   joinedAt: '2025-06-09', lastLogin: '2026-03-30 16:41', avatarColor: '#F59E0B' },
  { id: 'm-9',  orgId: 'org-1', deptId: 'dept-3', name: '吴建国', employeeNo: 'YG0004', title: '深化部经理',     role: 'DEPT_ADMIN', email: 'wujg@yungou.com',    phone: '137****4408', status: '在职',   joinedAt: '2025-01-25', lastLogin: '2026-03-31 08:12', avatarColor: '#EF4444' },
  { id: 'm-10', orgId: 'org-1', deptId: 'dept-3', name: '郑凯',   employeeNo: 'YG0018', title: '深化设计师',     role: 'MEMBER',     email: 'zhengkai@yungou.com',phone: '135****9964', status: '在职',   joinedAt: '2025-08-11', lastLogin: '2026-03-29 15:30', avatarColor: '#6366F1' },
  { id: 'm-11', orgId: 'org-1', deptId: 'dept-3', name: '何静',   employeeNo: 'YG0021', title: '深化设计师',     role: 'MEMBER',     email: 'hejing@yungou.com',  phone: '138****3345', status: '已停用', joinedAt: '2025-09-01', lastLogin: '2026-02-14 10:02', avatarColor: '#94A3B8' },
  { id: 'm-12', orgId: 'org-1', deptId: 'dept-4', name: '马涛',   employeeNo: 'YG0005', title: '厂房部经理',     role: 'DEPT_ADMIN', email: 'matao@yungou.com',   phone: '139****5087', status: '在职',   joinedAt: '2025-02-01', lastLogin: '2026-03-30 18:05', avatarColor: '#D97706' },
  { id: 'm-13', orgId: 'org-1', deptId: 'dept-4', name: '冯雪',   employeeNo: 'YG0024', title: '结构工程师',     role: 'MEMBER',     email: 'fengxue@yungou.com', phone: '136****2218', status: '在职',   joinedAt: '2025-10-20', lastLogin: '2026-03-31 09:20', avatarColor: '#A855F7' },
  { id: 'm-14', orgId: 'org-1', deptId: 'dept-5', name: '徐磊',   employeeNo: 'YG0016', title: 'BIM 工程师',     role: 'MEMBER',     email: 'xulei@yungou.com',   phone: '137****6673', status: '在职',   joinedAt: '2025-07-07', lastLogin: '2026-03-30 14:15', avatarColor: '#22C55E' },
  // 结构一所 is the department the demo member belongs to, so it is staffed
  // deep enough for the workbench's colleague card to show a full grid.
  { id: 'm-15', orgId: 'org-1', deptId: 'dept-1', name: '许倩',   employeeNo: 'YG0027', title: '结构工程师',     role: 'MEMBER',     email: 'xuqian@yungou.com',  phone: '138****5512', status: '在职',   joinedAt: '2025-04-08', lastLogin: '2026-03-31 08:58', avatarColor: '#0D9488' },
  { id: 'm-16', orgId: 'org-1', deptId: 'dept-1', name: '罗嘉',   employeeNo: 'YG0029', title: '助理工程师',     role: 'MEMBER',     email: 'luojia@yungou.com',  phone: '139****4087', status: '在职',   joinedAt: '2025-09-16', lastLogin: '2026-03-30 11:24', avatarColor: '#7C3AED' },
  { id: 'm-17', orgId: 'org-1', deptId: 'dept-1', name: '邓昊',   employeeNo: 'YG0031', title: '结构工程师',     role: 'MEMBER',     email: 'denghao@yungou.com', phone: '136****9930', status: '在职',   joinedAt: '2025-11-03', lastLogin: '2026-03-31 09:31', avatarColor: '#DC2626' },
  { id: 'm-18', orgId: 'org-1', deptId: 'dept-1', name: '崔敏',   employeeNo: 'YG0035', title: 'BIM 工程师',     role: 'MEMBER',     email: 'cuimin@yungou.com',  phone: '137****2764', status: '在职',   joinedAt: '2026-01-12', lastLogin: '2026-03-30 17:52', avatarColor: '#2563EB' },
  // Other customer organizations. Only ever surfaced in the vendor dashboard,
  // but they must exist so seat holders resolve to real people there too.
  { id: 'x-0',  orgId: 'org-2', deptId: null, name: '黄伟',   employeeNo: 'HT0001', title: '技术负责人',   role: 'ORG_ADMIN', email: 'huangwei@hongtu.com', phone: '021-5566****', status: '在职', joinedAt: '2025-04-10', lastLogin: '2026-03-30 17:40', avatarColor: '#2563EB' },
  { id: 'x-1',  orgId: 'org-2', deptId: null, name: '林芳',   employeeNo: 'HT0014', title: '结构工程师',   role: 'MEMBER',    email: 'linfang@hongtu.com',  phone: '138****7781', status: '在职', joinedAt: '2025-04-10', lastLogin: '2026-03-30 16:12', avatarColor: '#7C3AED' },
  { id: 'x-2',  orgId: 'org-2', deptId: null, name: '许成',   employeeNo: 'HT0022', title: '高级工程师',   role: 'MEMBER',    email: 'xucheng@hongtu.com',  phone: '139****2094', status: '在职', joinedAt: '2025-06-01', lastLogin: '2026-03-31 08:47', avatarColor: '#DB2777' },
  { id: 'x-3',  orgId: 'org-3', deptId: null, name: '谭静',   employeeNo: 'ZY0003', title: '设计部主管',   role: 'ORG_ADMIN', email: 'tanjing@zhongyuan.com', phone: '027-8812****', status: '在职', joinedAt: '2025-07-25', lastLogin: '2026-03-27 15:05', avatarColor: '#059669' },
  { id: 'x-4',  orgId: 'org-3', deptId: null, name: '邵鹏',   employeeNo: 'ZY0011', title: '钢结构工程师', role: 'MEMBER',    email: 'shaopeng@zhongyuan.com', phone: '136****5530', status: '在职', joinedAt: '2025-09-12', lastLogin: '2026-03-31 09:18', avatarColor: '#EA580C' },
  { id: 'x-5',  orgId: 'org-4', deptId: null, name: '钱多',   employeeNo: 'XC0001', title: '总经理',       role: 'ORG_ADMIN', email: 'qianduo@xinchuang.com', phone: '025-8834****', status: '在职', joinedAt: '2026-03-20', lastLogin: '2026-03-24 11:30', avatarColor: '#0891B2' },
  // Vendor side
  { id: 'v-1',  orgId: 'org-vendor', deptId: null, name: '沈涛', employeeNo: 'TL0006', title: '云授权运营专员', role: 'VENDOR_OPS', email: 'shentao@tonglei.com', phone: '021-6598****', status: '在职', joinedAt: '2024-06-01', lastLogin: '2026-03-31 09:00', avatarColor: '#0F2744' },
];

/** The identity the demo starts from: an ordinary engineer. */
export const DEFAULT_MEMBER_ID = 'm-3';

// ---------------------------------------------------------------- pools
// Free pools come from the vendor's grant, commercial pools from purchases.
// Deliberate scenarios: p-3 and p-6 are fully allocated, and the three
// purchased pools were all bought last April, so they now renew together
// inside the 30-day warning window (10, 18 and 28 days out).

export const seatPools: SeatPool[] = [
  { id: 'p-1', orgId: 'org-1', moduleId: '1',  total: 12, startDate: '2025-01-20', expireDate: '2026-12-31', source: '厂商赠予' },
  { id: 'p-2', orgId: 'org-1', moduleId: '2',  total: 12, startDate: '2025-01-20', expireDate: '2026-12-31', source: '厂商赠予' },
  { id: 'p-3', orgId: 'org-1', moduleId: '5',  total: 6,  startDate: '2025-01-20', expireDate: '2026-12-31', source: '厂商赠予' },
  { id: 'p-4', orgId: 'org-1', moduleId: '12', total: 6,  startDate: '2025-03-01', expireDate: '2026-12-31', source: '厂商赠予' },
  { id: 'p-5', orgId: 'org-1', moduleId: '16', total: 4,  startDate: '2025-03-01', expireDate: '2026-12-31', source: '厂商赠予' },
  { id: 'p-6', orgId: 'org-1', moduleId: '19', total: 5,  startDate: '2025-04-28', expireDate: '2026-04-28', source: '采购' },
  { id: 'p-7', orgId: 'org-1', moduleId: '21', total: 3,  startDate: '2025-04-20', expireDate: '2026-04-10', source: '采购' },
  { id: 'p-8', orgId: 'org-1', moduleId: '23', total: 2,  startDate: '2025-04-18', expireDate: '2026-04-18', source: '采购' },
  // Other organizations, only surfaced in the vendor dashboard
  { id: 'p-20', orgId: 'org-2', moduleId: '1',  total: 8, startDate: '2025-04-10', expireDate: '2026-12-31', source: '厂商赠予' },
  { id: 'p-21', orgId: 'org-2', moduleId: '19', total: 4, startDate: '2025-06-01', expireDate: '2026-06-01', source: '采购' },
  { id: 'p-22', orgId: 'org-3', moduleId: '1',  total: 5, startDate: '2025-07-25', expireDate: '2026-12-31', source: '厂商赠予' },
  { id: 'p-23', orgId: 'org-3', moduleId: '23', total: 2, startDate: '2025-09-12', expireDate: '2026-09-12', source: '采购' },
  { id: 'p-24', orgId: 'org-4', moduleId: '1',  total: 3, startDate: '2026-03-20', expireDate: '2027-03-20', source: '厂商赠予' },
];

function seat(
  id: string,
  poolId: string,
  moduleId: string,
  memberId: string,
  assignedAt: string,
  usedDays: number,
  lastUsed: string,
  orgId = 'org-1',
  assignedById = 'm-1',
): Assignment {
  return {
    id,
    poolId,
    orgId,
    moduleId,
    memberId,
    assignedById,
    assignedAt,
    status: '生效中',
    usedDays,
    lastUsed,
  };
}

export const assignments: Assignment[] = [
  // p-1 建筑结构（免费版）— 7 of 12 seats used
  seat('as-1',  'p-1', '1', 'm-3',  '2025-03-02', 52, '2026-03-31'),
  seat('as-2',  'p-1', '1', 'm-4',  '2025-05-14', 38, '2026-03-30'),
  seat('as-3',  'p-1', '1', 'm-7',  '2025-02-26', 61, '2026-03-31'),
  seat('as-4',  'p-1', '1', 'm-8',  '2025-06-09', 25, '2026-03-28'),
  seat('as-5',  'p-1', '1', 'm-10', '2025-08-11', 19, '2026-03-27'),
  seat('as-6',  'p-1', '1', 'm-13', '2025-10-20', 30, '2026-03-31'),
  seat('as-7',  'p-1', '1', 'm-14', '2025-07-07', 14, '2026-03-24'),
  // p-2 基本分析（免费版）— 5 of 12
  seat('as-8',  'p-2', '2', 'm-3',  '2025-03-02', 48, '2026-03-30'),
  seat('as-9',  'p-2', '2', 'm-4',  '2025-05-14', 33, '2026-03-29'),
  seat('as-10', 'p-2', '2', 'm-7',  '2025-02-26', 55, '2026-03-31'),
  seat('as-11', 'p-2', '2', 'm-8',  '2025-06-09', 21, '2026-03-26'),
  seat('as-12', 'p-2', '2', 'm-13', '2025-10-20', 26, '2026-03-30'),
  // p-3 多高层（免费版）— 6 of 6, pool exhausted
  seat('as-13', 'p-3', '5', 'm-3',  '2025-03-10', 81, '2026-03-31'),
  seat('as-14', 'p-3', '5', 'm-4',  '2025-05-20', 44, '2026-03-28'),
  seat('as-15', 'p-3', '5', 'm-7',  '2025-03-10', 67, '2026-03-30'),
  seat('as-16', 'p-3', '5', 'm-8',  '2025-06-15', 29, '2026-03-25'),
  seat('as-17', 'p-3', '5', 'm-13', '2025-11-02', 18, '2026-03-29'),
  seat('as-18', 'p-3', '5', 'm-14', '2025-07-20', 12, '2026-03-20'),
  // p-4 基础设计（免费版）— 2 of 6
  seat('as-19', 'p-4', '12', 'm-3', '2025-04-01', 30, '2026-03-28'),
  seat('as-20', 'p-4', '12', 'm-7', '2025-04-01', 41, '2026-03-31'),
  // p-5 钢构深化（免费版）— 1 active, 1 reclaimed after a member left
  seat('as-21', 'p-5', '16', 'm-10', '2025-08-11', 18, '2026-03-29'),
  {
    id: 'as-22', poolId: 'p-5', orgId: 'org-1', moduleId: '16', memberId: 'm-11',
    assignedById: 'm-9', assignedAt: '2025-09-01', revokedAt: '2026-02-20', revokedById: 'm-9',
    status: '已回收', usedDays: 22, lastUsed: '2026-02-14',
  },
  // p-6 建筑结构（商业版）— 5 of 5, pool exhausted
  seat('as-23', 'p-6', '19', 'm-1',  '2025-10-01', 40, '2026-03-30'),
  seat('as-24', 'p-6', '19', 'm-2',  '2025-10-01', 58, '2026-03-31'),
  seat('as-25', 'p-6', '19', 'm-6',  '2025-10-01', 62, '2026-03-31'),
  seat('as-26', 'p-6', '19', 'm-9',  '2025-10-08', 35, '2026-03-28'),
  seat('as-27', 'p-6', '19', 'm-12', '2025-10-08', 27, '2026-03-27'),
  // p-7 多高层（商业版）— expires 2026-04-10, renewal scenario
  seat('as-28', 'p-7', '21', 'm-2', '2025-04-20', 78, '2026-03-31'),
  seat('as-29', 'p-7', '21', 'm-6', '2025-04-20', 71, '2026-03-30'),
  // p-8 钢构深化（商业版）— 2 of 2
  seat('as-30', 'p-8', '23', 'm-9',  '2025-11-15', 44, '2026-03-31'),
  seat('as-31', 'p-8', '23', 'm-10', '2025-11-15', 39, '2026-03-29'),
  // Other organizations
  seat('as-40', 'p-20', '1',  'x-1', '2025-04-10', 30, '2026-03-30', 'org-2', 'x-0'),
  seat('as-41', 'p-21', '19', 'x-2', '2025-06-01', 44, '2026-03-31', 'org-2', 'x-0'),
  seat('as-42', 'p-22', '1',  'x-3', '2025-07-25', 22, '2026-03-27', 'org-3', 'x-0'),
  seat('as-43', 'p-23', '23', 'x-4', '2025-09-12', 51, '2026-03-31', 'org-3', 'x-0'),
];

// ---------------------------------------------------------------- applications
// One live case per branch of the approval chain.

export const applications: Application[] = [
  {
    id: 'a-1', code: 'AP20260331001', orgId: 'org-1', deptId: 'dept-1', applicantId: 'm-3',
    moduleId: '3', kind: 'QUOTA', seats: 1,
    reason: '苏州工业园区研发楼项目需做罕遇地震时程分析，现有基本分析模块无法覆盖。',
    projectName: '苏州园区研发楼', status: '待部门审批',
    steps: [
      { role: 'DEPT_ADMIN', label: '部门审批', action: '待审批' },
      { role: 'ORG_ADMIN',  label: '企业审批', action: '待审批' },
      { role: 'VENDOR_OPS', label: '厂商额度审批', action: '待审批' },
    ],
    createdAt: '2026-03-31 09:20',
  },
  {
    id: 'a-2', code: 'AP20260330002', orgId: 'org-1', deptId: 'dept-1', applicantId: 'm-4',
    moduleId: '22', kind: 'PURCHASE', seats: 2,
    reason: '杭州亚运训练馆屋盖为网壳结构，需商业版的智能截面优选功能控制用钢量。',
    projectName: '杭州亚运训练馆', status: '待企业审批',
    steps: [
      { role: 'DEPT_ADMIN', label: '部门审批', action: '通过', approverId: 'm-2', approverName: '李明', comment: '项目确有需求，同意上报。', actedAt: '2026-03-30 15:10' },
      { role: 'ORG_ADMIN',  label: '企业审批', action: '待审批' },
    ],
    createdAt: '2026-03-30 14:22',
  },
  {
    id: 'a-3', code: 'AP20260329003', orgId: 'org-1', deptId: 'dept-2', applicantId: 'm-7',
    moduleId: '19', kind: 'PURCHASE', seats: 1,
    reason: '南京超高层项目需做超限审查，商业版席位已全部占满。',
    projectName: '南京河西超高层', status: '待采购',
    steps: [
      { role: 'DEPT_ADMIN', label: '部门审批', action: '通过', approverId: 'm-6', approverName: '赵国栋', comment: '同意。', actedAt: '2026-03-29 16:40' },
      { role: 'ORG_ADMIN',  label: '企业审批', action: '通过', approverId: 'm-1', approverName: '王振华', comment: '超限审查为刚性需求，同意扩容 1 个席位。', actedAt: '2026-03-30 09:15' },
    ],
    createdAt: '2026-03-29 15:02',
  },
  {
    id: 'a-4', code: 'AP20260328004', orgId: 'org-1', deptId: 'dept-2', applicantId: 'm-8',
    moduleId: '2', kind: 'SEAT', seats: 1,
    reason: '新入职承接常规厂房计算，需要基本分析模块。',
    projectName: '常州厂房改扩建', status: '已完成',
    steps: [
      { role: 'DEPT_ADMIN', label: '部门审批', action: '通过', approverId: 'm-6', approverName: '赵国栋', comment: '池内有余量，直接分配。', actedAt: '2026-03-28 10:05' },
    ],
    createdAt: '2026-03-28 09:31',
  },
  {
    id: 'a-5', code: 'AP20260327005', orgId: 'org-1', deptId: 'dept-4', applicantId: 'm-13',
    moduleId: '4', kind: 'QUOTA', seats: 3,
    reason: '连云港化工厂房群项目需门式刚架批量计算，本部门三人并行作业。',
    projectName: '连云港化工厂房群', status: '待厂商审批',
    steps: [
      { role: 'DEPT_ADMIN', label: '部门审批', action: '通过', approverId: 'm-12', approverName: '马涛', comment: '项目工期紧，同意。', actedAt: '2026-03-27 14:20' },
      { role: 'ORG_ADMIN',  label: '企业审批', action: '通过', approverId: 'm-1', approverName: '王振华', comment: '免费额度内，已上报厂商。', actedAt: '2026-03-27 17:02' },
      { role: 'VENDOR_OPS', label: '厂商额度审批', action: '待审批' },
    ],
    createdAt: '2026-03-27 11:45',
  },
  {
    id: 'a-6', code: 'AP20260326006', orgId: 'org-1', deptId: 'dept-3', applicantId: 'm-10',
    moduleId: '25', kind: 'PURCHASE', seats: 1,
    reason: '想试用幕墙商业版的热工分析。',
    projectName: '—', status: '已驳回',
    steps: [
      { role: 'DEPT_ADMIN', label: '部门审批', action: '驳回', approverId: 'm-9', approverName: '吴建国', comment: '当前无幕墙项目落地，暂不采购，等中标后再提。', actedAt: '2026-03-26 16:30' },
    ],
    createdAt: '2026-03-26 13:12',
  },
  {
    id: 'a-7', code: 'AP20260331007', orgId: 'org-1', deptId: 'dept-5', applicantId: 'm-14',
    moduleId: '5', kind: 'QUOTA', seats: 1,
    reason: '需要参与多高层项目的 BIM 模型对接，免费版席位已被占满。',
    projectName: '合肥政务中心', status: '待部门审批',
    steps: [
      { role: 'DEPT_ADMIN', label: '部门审批', action: '待审批' },
      { role: 'ORG_ADMIN',  label: '企业审批', action: '待审批' },
      { role: 'VENDOR_OPS', label: '厂商额度审批', action: '待审批' },
    ],
    createdAt: '2026-03-31 08:55',
  },
];

// ---------------------------------------------------------------- orders

export const orders: Order[] = [
  {
    id: 'o-1', orderNo: 'ORD20251001001', orgId: 'org-1', moduleId: '19', seats: 5,
    unitPrice: 4800, amount: 24000, payMethod: '对公转账', status: '已完成',
    createdById: 'm-1', createdAt: '2025-09-28 10:20', paidAt: '2025-09-30 14:00',
    confirmedAt: '2025-10-01 09:30', invoiceNo: 'INV20251001001',
  },
  {
    id: 'o-2', orderNo: 'ORD20250420002', orgId: 'org-1', moduleId: '21', seats: 3,
    unitPrice: 4200, amount: 12600, payMethod: '对公转账', status: '已完成',
    createdById: 'm-1', createdAt: '2025-04-16 11:05', paidAt: '2025-04-18 16:20',
    confirmedAt: '2025-04-20 10:00', invoiceNo: 'INV20250420002',
  },
  {
    id: 'o-3', orderNo: 'ORD20251115003', orgId: 'org-1', moduleId: '23', seats: 2,
    unitPrice: 9800, amount: 19600, payMethod: '在线支付', status: '已完成',
    createdById: 'm-1', createdAt: '2025-11-15 09:40', paidAt: '2025-11-15 09:45',
    confirmedAt: '2025-11-15 09:45', invoiceNo: 'INV20251115003',
  },
  {
    id: 'o-4', orderNo: 'ORD20260328004', orgId: 'org-1', moduleId: '42', seats: 2,
    unitPrice: 8200, amount: 16400, payMethod: '对公转账', status: '待厂商确认',
    createdById: 'm-1', createdAt: '2026-03-28 15:30', paidAt: '2026-03-30 10:12',
  },
  {
    id: 'o-5', orderNo: 'ORD20260330005', orgId: 'org-1', moduleId: '24', seats: 2,
    unitPrice: 3800, amount: 7600, payMethod: '在线支付', status: '待支付',
    createdById: 'm-1', createdAt: '2026-03-30 17:45',
  },
  // Other organizations, vendor view only
  {
    id: 'o-20', orderNo: 'ORD20250601020', orgId: 'org-2', moduleId: '19', seats: 4,
    unitPrice: 4800, amount: 19200, payMethod: '对公转账', status: '已完成',
    createdById: 'x-0', createdAt: '2025-05-28 09:00', paidAt: '2025-05-30 15:00',
    confirmedAt: '2025-06-01 10:00', invoiceNo: 'INV20250601020',
  },
  {
    id: 'o-21', orderNo: 'ORD20260329021', orgId: 'org-3', moduleId: '46', seats: 1,
    unitPrice: 9200, amount: 9200, payMethod: '对公转账', status: '待厂商确认',
    createdById: 'x-0', createdAt: '2026-03-27 14:20', paidAt: '2026-03-29 11:30',
  },
  {
    id: 'o-22', orderNo: 'ORD20260320022', orgId: 'org-4', moduleId: '20', seats: 2,
    unitPrice: 5800, amount: 11600, payMethod: '在线支付', status: '待支付',
    createdById: 'x-0', createdAt: '2026-03-20 16:10',
  },
];

// ---------------------------------------------------------------- audit trail

export const auditLogs: AuditLog[] = [
  { id: 'log-1',  orgId: 'org-1', actorId: 'm-3',  actorName: '张思远', actorRole: 'MEMBER',     action: '提交申请',     target: 'AP20260331001', detail: '申请「高级分析」免费额度 1 个席位',            createdAt: '2026-03-31 09:20', ip: '192.168.100.42' },
  { id: 'log-2',  orgId: 'org-1', actorId: 'm-14', actorName: '徐磊',   actorRole: 'MEMBER',     action: '提交申请',     target: 'AP20260331007', detail: '申请「多高层」免费额度 1 个席位',              createdAt: '2026-03-31 08:55', ip: '192.168.100.61' },
  { id: 'log-3',  orgId: 'org-1', actorId: 'm-1',  actorName: '王振华', actorRole: 'ORG_ADMIN',  action: '企业审批通过', target: 'AP20260329003', detail: '同意为「建筑结构（商业版）」扩容 1 个席位',    createdAt: '2026-03-30 09:15', ip: '192.168.100.10' },
  { id: 'log-4',  orgId: 'org-1', actorId: 'm-1',  actorName: '王振华', actorRole: 'ORG_ADMIN',  action: '支付订单',     target: 'ORD20260328004', detail: '对公转账支付 ¥16,400，等待厂商确认到账',       createdAt: '2026-03-30 10:12', ip: '192.168.100.10' },
  { id: 'log-5',  orgId: 'org-1', actorId: 'm-2',  actorName: '李明',   actorRole: 'DEPT_ADMIN', action: '部门审批通过', target: 'AP20260330002', detail: '同意上报「网架网壳（商业版）」采购申请',      createdAt: '2026-03-30 15:10', ip: '192.168.100.17' },
  { id: 'log-6',  orgId: 'org-1', actorId: 'm-1',  actorName: '王振华', actorRole: 'ORG_ADMIN',  action: '创建订单',     target: 'ORD20260330005', detail: '为「基础设计（商业版）」采购 2 个席位',        createdAt: '2026-03-30 17:45', ip: '192.168.100.10' },
  { id: 'log-7',  orgId: 'org-1', actorId: 'm-6',  actorName: '赵国栋', actorRole: 'DEPT_ADMIN', action: '部门审批通过', target: 'AP20260329003', detail: '同意上报「建筑结构（商业版）」采购申请',      createdAt: '2026-03-29 16:40', ip: '192.168.100.23' },
  { id: 'log-8',  orgId: 'org-1', actorId: 'm-6',  actorName: '赵国栋', actorRole: 'DEPT_ADMIN', action: '分配席位',     target: '周敏',           detail: '从「基本分析」池分配 1 个席位给周敏',          createdAt: '2026-03-28 10:05', ip: '192.168.100.23' },
  { id: 'log-9',  orgId: 'org-1', actorId: 'm-1',  actorName: '王振华', actorRole: 'ORG_ADMIN',  action: '邀请成员',     target: '刘颖',           detail: '邀请刘颖加入结构一所，待激活',                createdAt: '2026-03-28 09:10', ip: '192.168.100.10' },
  { id: 'log-10', orgId: 'org-1', actorId: 'm-12', actorName: '马涛',   actorRole: 'DEPT_ADMIN', action: '部门审批通过', target: 'AP20260327005', detail: '同意上报「厂房」免费额度扩容申请',            createdAt: '2026-03-27 14:20', ip: '192.168.100.35' },
  { id: 'log-11', orgId: 'org-1', actorId: 'm-9',  actorName: '吴建国', actorRole: 'DEPT_ADMIN', action: '部门审批驳回', target: 'AP20260326006', detail: '驳回「幕墙（商业版）」采购申请：暂无项目落地', createdAt: '2026-03-26 16:30', ip: '192.168.100.28' },
  { id: 'log-12', orgId: 'org-1', actorId: 'm-9',  actorName: '吴建国', actorRole: 'DEPT_ADMIN', action: '回收席位',     target: '何静',           detail: '何静离职，回收「钢构深化」席位 1 个',          createdAt: '2026-02-20 11:20', ip: '192.168.100.28' },
  { id: 'log-13', orgId: null,    actorId: 'v-1',  actorName: '沈涛',   actorRole: 'VENDOR_OPS', action: '确认到账',     target: 'ORD20251115003', detail: '确认「钢构深化（商业版）」2 席位到账',        createdAt: '2025-11-15 09:45', ip: '58.246.***.12' },
  { id: 'log-14', orgId: null,    actorId: 'v-1',  actorName: '沈涛',   actorRole: 'VENDOR_OPS', action: '调整免费额度', target: '上海云构结构设计研究院有限公司', detail: '免费席位额度由 30 调整为 40',   createdAt: '2026-01-12 10:30', ip: '58.246.***.12' },
  { id: 'log-15', orgId: null,    actorId: 'v-1',  actorName: '沈涛',   actorRole: 'VENDOR_OPS', action: '模块上架',     target: '参数化建模（商业版）', detail: '新增商业版模块并定价 ¥7,500/席位/年',    createdAt: '2026-02-08 15:00', ip: '58.246.***.12' },
];

// ---------------------------------------------------------------- usage

/** 14 days of launches, deterministic so charts do not jitter on re-render. */
export const usageHistory = [
  { date: '03-18', launches: 63, activeMembers: 9 },
  { date: '03-19', launches: 71, activeMembers: 10 },
  { date: '03-20', launches: 58, activeMembers: 8 },
  { date: '03-21', launches: 22, activeMembers: 4 },
  { date: '03-22', launches: 15, activeMembers: 3 },
  { date: '03-23', launches: 78, activeMembers: 11 },
  { date: '03-24', launches: 84, activeMembers: 11 },
  { date: '03-25', launches: 92, activeMembers: 12 },
  { date: '03-26', launches: 87, activeMembers: 11 },
  { date: '03-27', launches: 95, activeMembers: 12 },
  { date: '03-28', launches: 31, activeMembers: 5 },
  { date: '03-29', launches: 26, activeMembers: 4 },
  { date: '03-30', launches: 101, activeMembers: 12 },
  { date: '03-31', launches: 68, activeMembers: 10 },
];
