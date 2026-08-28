// Domain model for the B2B multi-tenant cloud licensing system.
// Core concept: an organization buys a pool of seats for a module; admins
// allocate and reclaim those seats for members. Nothing is owned by a person.

// ---------------------------------------------------------------- identity

export type Role = 'ORG_ADMIN' | 'DEPT_ADMIN' | 'MEMBER' | 'VENDOR_OPS';

export const roleLabels: Record<Role, string> = {
  ORG_ADMIN: '企业管理员',
  DEPT_ADMIN: '部门管理员',
  MEMBER: '普通成员',
  VENDOR_OPS: '厂商运营',
};

export type MemberStatus = '在职' | '待激活' | '已停用';

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  code: string;
  /** Business licence verified by the vendor. */
  verified: boolean;
  /** Upper bound of free-edition seats the vendor grants this org. */
  freeSeatQuota: number;
  contactName: string;
  contactPhone: string;
  industry: string;
  scale: string;
  createdAt: string;
  status: '正常' | '已停用';
}

export interface Department {
  id: string;
  orgId: string;
  name: string;
  code: string;
  /** Member id of the department admin. */
  managerId: string;
}

export interface Member {
  id: string;
  orgId: string;
  /** Vendor operators do not belong to a department. */
  deptId: string | null;
  name: string;
  employeeNo: string;
  title: string;
  role: Role;
  email: string;
  phone: string;
  status: MemberStatus;
  joinedAt: string;
  lastLogin: string;
  avatarColor: string;
}

// ---------------------------------------------------------------- catalog

export type ModuleEdition = '免费版' | '商业版';

export type ModuleCategory =
  | '结构分析'
  | '建筑设计'
  | '工业厂房'
  | '专项设计'
  | '深化工具';

export interface CatalogModule {
  id: string;
  name: string;
  code: string;
  category: ModuleCategory;
  edition: ModuleEdition;
  description: string;
  icon: string;
  /** Licence term in days, sold per seat. */
  duration: number;
  /** Compute nodes granted per seat. */
  nodes: number;
  /** Yearly list price per seat. Free editions are 0. */
  unitPrice: number;
  /** Vendor can delist a module without deleting historical records. */
  listed: boolean;
}

// ---------------------------------------------------------------- licensing

/** A batch of seats an organization holds for one module. */
export interface SeatPool {
  id: string;
  orgId: string;
  moduleId: string;
  /** Total seats held. Grows through purchase or vendor quota grants. */
  total: number;
  startDate: string;
  expireDate: string;
  source: '采购' | '厂商赠予';
}

export type AssignmentStatus = '生效中' | '已回收' | '已过期';

/** One seat of a pool, held by one member. */
export interface Assignment {
  id: string;
  poolId: string;
  orgId: string;
  moduleId: string;
  memberId: string;
  assignedById: string;
  assignedAt: string;
  revokedAt?: string;
  revokedById?: string;
  status: AssignmentStatus;
  /** Days the member has actually opened the module. */
  usedDays: number;
  lastUsed: string;
}

// ---------------------------------------------------------------- approval

/**
 * How a request must be satisfied, decided at submission time:
 * - SEAT     pool has spare seats, department admin approval is enough
 * - PURCHASE commercial module, needs paid expansion of the pool
 * - QUOTA    free module out of seats, needs a vendor quota grant
 */
export type ApplicationKind = 'SEAT' | 'PURCHASE' | 'QUOTA';

export type ApplicationStatus =
  | '待部门审批'
  | '待企业审批'
  | '待厂商审批'
  | '待采购'
  /** Approved and an order is already in flight, so it no longer needs one. */
  | '已下单'
  | '已完成'
  | '已驳回'
  | '已撤销';

export type ApprovalAction = '待审批' | '通过' | '驳回';

export interface ApprovalStep {
  /** Which role owns this step. */
  role: Role;
  label: string;
  action: ApprovalAction;
  approverId?: string;
  approverName?: string;
  comment?: string;
  actedAt?: string;
}

export interface Application {
  id: string;
  code: string;
  orgId: string;
  deptId: string;
  applicantId: string;
  moduleId: string;
  kind: ApplicationKind;
  /** Seats requested. A member asking for themselves requests 1. */
  seats: number;
  reason: string;
  projectName: string;
  status: ApplicationStatus;
  steps: ApprovalStep[];
  createdAt: string;
  /** Set once the purchase branch generates an order. */
  orderId?: string;
}

// ---------------------------------------------------------------- commerce

/** 退款中: money already left the customer, so the vendor settles the reversal. */
export type OrderStatus = '待支付' | '待厂商确认' | '退款中' | '已完成' | '已取消';
export type PayMethod = '对公转账' | '在线支付';

/** The buyer's bank details on a transfer payment — what the vendor reconciles against. */
export interface Remittance {
  company: string;
  bank: string;
  account: string;
}

export interface Order {
  id: string;
  orderNo: string;
  orgId: string;
  moduleId: string;
  seats: number;
  unitPrice: number;
  amount: number;
  payMethod: PayMethod;
  status: OrderStatus;
  createdById: string;
  createdAt: string;
  paidAt?: string;
  confirmedAt?: string;
  /** Renewals extend an existing pool instead of creating one. */
  renewPoolId?: string;
  applicationId?: string;
  invoiceNo?: string;
  /** Present once a bank-transfer payment has been submitted. */
  remittance?: Remittance;
}

// ---------------------------------------------------------------- audit

export type AuditAction =
  | '提交申请'
  | '撤销申请'
  | '部门审批通过'
  | '部门审批驳回'
  | '企业审批通过'
  | '企业审批驳回'
  | '厂商审批通过'
  | '厂商审批驳回'
  | '分配席位'
  | '回收席位'
  | '创建订单'
  | '支付订单'
  | '确认到账'
  | '取消订单'
  | '续费席位池'
  | '邀请成员'
  | '注册申请'
  | '停用成员'
  | '启用成员'
  | '变更角色'
  | '变更部门'
  | '模块上架'
  | '模块下架'
  | '调整定价'
  | '调整免费额度'
  | '停用企业'
  | '启用企业';

export interface AuditLog {
  id: string;
  /** Vendor-side actions are not scoped to a customer org. */
  orgId: string | null;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: AuditAction;
  target: string;
  detail: string;
  createdAt: string;
  ip: string;
}

// ---------------------------------------------------------------- usage

export interface UsagePoint {
  date: string;
  /** Module launches across the scope. */
  launches: number;
  /** Distinct members active that day. */
  activeMembers: number;
}
