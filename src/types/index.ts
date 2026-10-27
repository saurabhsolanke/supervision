//    DevOps Boards SaaS Domain Types
// Strict Multi-Tenant Data Isolation Model

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type PlanTier = 'STARTER' | 'PRO' | 'ENTERPRISE';

export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';

export type WorkItemType = 'USER_STORY' | 'TASK' | 'BUG' | 'FEATURE' | 'EPIC';

export type WorkItemState = 'NEW' | 'ACTIVE' | 'RESOLVED' | 'CLOSED';

export type Priority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export interface Subscription {
  id: string;
  organizationId: string;
  planTier: PlanTier;
  status: SubscriptionStatus;
  seatCount: number;
  maxSeats: number;
  currentPeriodEnd: string;
  billingCycle: 'monthly' | 'annual';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  initials: string;
  jobTitle: string;
  isSuperAdmin?: boolean;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  user: User;
  role: Role;
  joinedAt: string;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  logo: string;
  subscription: Subscription;
  memberships: OrganizationMembership[];
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  projects: Project[];
}

export interface BoardColumn {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  state: WorkItemState;
  order: number;
  wipLimit: number | null; // null = unlimited
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface WorkItemComment {
  id: string;
  workItemId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface WorkItem {
  id: string;
  itemNumber: number; // e.g. 1024 -> AB#1024
  organizationId: string; // Mandatory tenant isolation key
  projectId: string;
  columnId: string;
  sprintId?: string;
  type: WorkItemType;
  state: WorkItemState;
  priority: Priority;
  title: string;
  description: string;
  acceptanceCriteria?: string;
  effort: number; // Story points
  order: number;
  tags: string[];
  assigneeId?: string;
  assignee?: User;
  reporterId: string;
  reporter?: User;
  createdAt: string;
  updatedAt: string;
  comments: WorkItemComment[];
}

export interface Project {
  id: string;
  organizationId: string;
  workspaceId: string;
  name: string;
  key: string; // e.g. "AZP", "CORE"
  description: string;
  columns: BoardColumn[];
  sprints: Sprint[];
  workItems: WorkItem[];
}

export interface PlanConfig {
  name: string;
  tier: PlanTier;
  monthlyPrice: number;
  annualPrice: number;
  maxSeats: number;
  maxProjects: number | 'Unlimited';
  features: string[];
  hasCustomWipLimits: boolean;
  hasSprintPlanning: boolean;
  hasExport: boolean;
  hasAuditLogs: boolean;
}

export interface BoardFilterState {
  searchQuery: string;
  selectedTypes: WorkItemType[];
  selectedAssignees: string[]; // User IDs
  selectedPriorities: Priority[];
  selectedStates: WorkItemState[];
}
