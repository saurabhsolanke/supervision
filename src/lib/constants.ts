//    DevOps Boards Constants & Theme Tokens
import { WorkItemType, Priority, WorkItemState, PlanTier, PlanConfig } from '@/types';

export const WORK_ITEM_TYPE_CONFIG: Record<
  WorkItemType,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    indicatorColor: string;
    iconName: string;
    description: string;
  }
> = {
  USER_STORY: {
    label: 'User Story',
    color: '#0078D4', //    Brand Blue
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700 dark:text-blue-300',
    indicatorColor: '#0078D4',
    iconName: 'BookOpen',
    description: 'User requirement or functional deliverable',
  },
  TASK: {
    label: 'Task',
    color: '#0078D4', // Blue for Task
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    borderColor: 'border-sky-500',
    textColor: 'text-sky-700 dark:text-sky-300',
    indicatorColor: '#0078D4',
    iconName: 'CheckSquare',
    description: 'Granular unit of work',
  },
  BUG: {
    label: 'Bug',
    color: '#CC293D', // Vermilion /    DevOps Red
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-500',
    textColor: 'text-red-700 dark:text-red-300',
    indicatorColor: '#CC293D',
    iconName: 'Bug',
    description: 'Defect or unintended software behavior',
  },
  FEATURE: {
    label: 'Feature',
    color: '#7738D8', //    Purple
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-700 dark:text-purple-300',
    indicatorColor: '#7738D8',
    iconName: 'Trophy',
    description: 'Significant product feature or milestone',
  },
  EPIC: {
    label: 'Epic',
    color: '#FF8C00', //    Orange
    bgColor: 'bg-orange-50 dark:bg-orange-950/40',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700 dark:text-orange-300',
    indicatorColor: '#FF8C00',
    iconName: 'Crown',
    description: 'Broad business initiative spanning sprints',
  },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string;
    shortLabel: string;
    badgeClass: string;
    color: string;
  }
> = {
  P1_CRITICAL: {
    label: 'P1 - Critical',
    shortLabel: 'P1',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
    color: '#CC293D',
  },
  P2_HIGH: {
    label: 'P2 - High',
    shortLabel: 'P2',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
    color: '#D97706',
  },
  P3_MEDIUM: {
    label: 'P3 - Medium',
    shortLabel: 'P3',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
    color: '#2563EB',
  },
  P4_LOW: {
    label: 'P4 - Low',
    shortLabel: 'P4',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    color: '#64748B',
  },
};

export const STATE_CONFIG: Record<
  WorkItemState,
  {
    label: string;
    headerColor: string;
    dotColor: string;
  }
> = {
  NEW: {
    label: 'New',
    headerColor: 'text-slate-700 dark:text-slate-200 border-t-slate-400',
    dotColor: 'bg-slate-400',
  },
  ACTIVE: {
    label: 'Active',
    headerColor: 'text-blue-700 dark:text-blue-300 border-t-blue-500',
    dotColor: 'bg-blue-500',
  },
  RESOLVED: {
    label: 'Resolved',
    headerColor: 'text-purple-700 dark:text-purple-300 border-t-purple-500',
    dotColor: 'bg-purple-500',
  },
  CLOSED: {
    label: 'Closed',
    headerColor: 'text-emerald-700 dark:text-emerald-300 border-t-emerald-500',
    dotColor: 'bg-emerald-500',
  },
};

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  STARTER: {
    name: 'Starter',
    tier: 'STARTER',
    monthlyPrice: 0,
    annualPrice: 0,
    maxSeats: 3,
    maxProjects: 2,
    features: [
      'Up to 3 team members',
      '2 Projects / Apps',
      'Standard    DevOps Kanban Board',
      'Basic Work Item Management',
      'Community Support',
    ],
    hasCustomWipLimits: false,
    hasSprintPlanning: false,
    hasExport: false,
    hasAuditLogs: false,
  },
  PRO: {
    name: 'Pro',
    tier: 'PRO',
    monthlyPrice: 29,
    annualPrice: 24, // $24/mo billed annually
    maxSeats: 10,
    maxProjects: 'Unlimited',
    features: [
      'Up to 10 team members',
      'Unlimited Projects & Repos',
      'Custom Column WIP Limits',
      'Sprint & Iteration Planning',
      'JSON / CSV Backlog Export',
      'Priority Email Support',
    ],
    hasCustomWipLimits: true,
    hasSprintPlanning: true,
    hasExport: true,
    hasAuditLogs: false,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    tier: 'ENTERPRISE',
    monthlyPrice: 99,
    annualPrice: 79,
    maxSeats: 50,
    maxProjects: 'Unlimited',
    features: [
      'Up to 50 team members (Expandable)',
      'Unlimited Workspaces & Projects',
      'Advanced WIP Policies & Swimlanes',
      'Full Multi-Tenant Security & Audit Logs',
      'Sprint Velocity Analytics',
      'Dedicated Customer Success Architect',
      '99.99% Uptime SLA',
    ],
    hasCustomWipLimits: true,
    hasSprintPlanning: true,
    hasExport: true,
    hasAuditLogs: true,
  },
};
