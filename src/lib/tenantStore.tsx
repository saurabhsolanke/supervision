'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Organization,
  Workspace,
  Project,
  WorkItem,
  User,
  Role,
  PlanTier,
  WorkItemState,
  WorkItemType,
  Priority,
  BoardColumn,
  BoardFilterState,
} from '@/types';
import { PLAN_CONFIGS } from './constants';

interface TenantContextType {
  // Current Tenant & Hierarchy
  organizations: Organization[];
  currentOrg: Organization | null;
  currentWorkspace: Workspace | null;
  currentProject: Project | null;
  workspaces: Workspace[];
  projects: Project[];
  isLoading: boolean;

  // Active User Persona & RBAC
  currentUser: User | null;
  currentRole: Role;
  allUsers: User[];
  tenantMembers: { user: User; role: Role }[];

  // Board Filter State
  filterState: BoardFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<BoardFilterState>>;
  resetFilters: () => void;
  filteredWorkItems: WorkItem[];

  // Selected Item Drawer
  selectedWorkItem: WorkItem | null;
  setSelectedWorkItem: (item: WorkItem | null) => void;

  // Actions connecting to Supabase Database
  switchOrganization: (orgId: string) => void;
  switchProject: (projectId: string) => void;
  switchUser: (userId: string) => void;
  createWorkItem: (item: Partial<WorkItem>) => Promise<{ success: boolean; error?: string; item?: WorkItem }>;
  updateWorkItem: (id: string, updates: Partial<WorkItem>) => Promise<{ success: boolean; error?: string }>;
  moveWorkItem: (itemId: string, destinationColumnId: string, destinationIndex: number) => Promise<{ success: boolean; error?: string }>;
  deleteWorkItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  addComment: (workItemId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  inviteMember: (email: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  upgradePlan: (tier: PlanTier, billingCycle?: 'monthly' | 'annual') => Promise<{ success: boolean; error?: string }>;
  updateColumnWipLimit: (columnId: string, limit: number | null) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;

  // Authentication & Session
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  loginAsUser: (userId: string, orgId?: string) => Promise<void>;
  logout: () => Promise<void>;

  // RBAC Permission Checks
  canEditWorkItem: boolean;
  canDeleteWorkItem: boolean;
  canInviteMembers: boolean;
  canManageBilling: boolean;
  canCustomizeWip: boolean;
}

const defaultFilterState: BoardFilterState = {
  searchQuery: '',
  selectedTypes: [],
  selectedAssignees: [],
  selectedPriorities: [],
  selectedStates: [],
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>('');
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const [filterState, setFilterState] = useState<BoardFilterState>(defaultFilterState);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Fetch Organizations and Users from Supabase on mount
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/tenants');
      const data = await res.json();

      if (data.organizations && data.organizations.length > 0) {
        setOrganizations(data.organizations);
        setAllUsers(data.users || []);

        // Check localStorage for saved session
        const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('supervision_user_id') : null;
        const savedOrgId = typeof window !== 'undefined' ? localStorage.getItem('supervision_org_id') : null;

        let effectiveOrgId = currentOrgId || savedOrgId || data.organizations[0].id;
        if (!data.organizations.some((o: any) => o.id === effectiveOrgId)) {
          effectiveOrgId = data.organizations[0].id;
        }
        setCurrentOrgId(effectiveOrgId);

        // Strictly authenticate: only restore user if explicitly saved in session
        let effectiveUserId = '';
        if (savedUserId && data.users?.some((u: any) => u.id === savedUserId)) {
          effectiveUserId = savedUserId;
        }
        setCurrentUserId(effectiveUserId);
      }
    } catch (err) {
      console.error('Failed to load initial tenant data from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrgId, currentUserId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. Fetch Workspaces and Projects whenever active organization changes
  const loadTenantWorkspaces = useCallback(async (orgId: string) => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/tenants/${orgId}/workspaces`);
      const data = await res.json();
      if (data.workspaces) {
        setWorkspaces(data.workspaces);
        const allProjs = data.workspaces.flatMap((w: any) => w.projects);
        if (allProjs.length > 0) {
          setCurrentProjectId(allProjs[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load workspaces from Supabase:', err);
    }
  }, []);

  useEffect(() => {
    if (currentOrgId) {
      loadTenantWorkspaces(currentOrgId);
    }
  }, [currentOrgId, loadTenantWorkspaces]);

  // Current Organization & Project derivations
  const currentOrg = organizations.find((o) => o.id === currentOrgId) || organizations[0] || null;
  const projects = workspaces.flatMap((w) => w.projects);
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0] || null;
  const currentWorkspace = workspaces.find((w) => w.projects.some((p) => p.id === currentProject?.id)) || workspaces[0] || null;

  // Active User & RBAC derivations
  const currentUser = allUsers.find((u) => u.id === currentUserId) || allUsers[0] || null;
  const isSuperAdmin = Boolean(currentUser?.isSuperAdmin || currentUser?.email?.includes('superadmin'));
  const membership = currentOrg?.memberships?.find((m) => m.userId === currentUser?.id);
  const currentRole: Role = isSuperAdmin ? 'OWNER' : (membership?.role || 'VIEWER');

  // Permissions based on Role and Plan
  const canEditWorkItem = isSuperAdmin || currentRole !== 'VIEWER';
  const canDeleteWorkItem = isSuperAdmin || currentRole === 'OWNER' || currentRole === 'ADMIN';
  const canInviteMembers = isSuperAdmin || currentRole === 'OWNER' || currentRole === 'ADMIN';
  const canManageBilling = isSuperAdmin || currentRole === 'OWNER';
  const planTier = currentOrg?.subscription?.planTier || 'STARTER';
  const canCustomizeWip =
    isSuperAdmin ||
    ((currentRole === 'OWNER' || currentRole === 'ADMIN') &&
    PLAN_CONFIGS[planTier]?.hasCustomWipLimits);

  const tenantMembers =
    currentOrg?.memberships?.map((m) => ({
      user: m.user,
      role: m.role,
    })) || [];

  // Switch Organization
  const switchOrganization = (orgId: string) => {
    const targetOrg = organizations.find((o) => o.id === orgId);
    if (!targetOrg) return;
    setCurrentOrgId(orgId);

    // Pick first member in target tenant
    if (targetOrg.memberships && targetOrg.memberships.length > 0) {
      const userInOrg = targetOrg.memberships.find((m) => m.userId === currentUserId);
      if (!userInOrg) {
        setCurrentUserId(targetOrg.memberships[0].userId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('supervision_user_id', targetOrg.memberships[0].userId);
        }
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('supervision_org_id', orgId);
    }
    setSelectedWorkItem(null);
    setFilterState(defaultFilterState);
  };

  const switchProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      setCurrentProjectId(proj.id);
      setSelectedWorkItem(null);
    }
  };

  const switchUser = (userId: string) => {
    const u = allUsers.find((user) => user.id === userId);
    if (u) {
      setCurrentUserId(userId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('supervision_user_id', userId);
      }
    }
  };

  // Auth Operations
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid email or password' };
      }

      const authedUser = data.user;
      setAllUsers((prev) => {
        const exists = prev.some((u) => u.id === authedUser.id);
        return exists ? prev : [...prev, authedUser];
      });

      setCurrentUserId(authedUser.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('supervision_user_id', authedUser.id);
        if (data.token) {
          localStorage.setItem('supervision_token', data.token);
        }
      }

      if (data.primaryOrgId) {
        setCurrentOrgId(data.primaryOrgId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('supervision_org_id', data.primaryOrgId);
        }
      }

      await loadInitialData();
      return { success: true, user: authedUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login request failed' };
    }
  };

  const loginAsUser = async (userId: string, orgId?: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('supervision_token', data.token);
      }
    } catch (err) {
      console.error('Failed to issue session token:', err);
    }

    setCurrentUserId(userId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('supervision_user_id', userId);
    }

    if (orgId) {
      setCurrentOrgId(orgId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('supervision_org_id', orgId);
      }
    } else {
      const userOrg = organizations.find((o) => o.memberships?.some((m) => m.userId === userId));
      if (userOrg) {
        setCurrentOrgId(userOrg.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('supervision_org_id', userOrg.id);
        }
      }
    }
  };

  const logout = async () => {
    setCurrentUserId('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supervision_user_id');
      localStorage.removeItem('supervision_org_id');
      localStorage.removeItem('supervision_token');
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
  };

  const resetFilters = () => setFilterState(defaultFilterState);

  // Filtered work items from live Supabase data
  const rawWorkItems = currentProject?.workItems || [];
  const filteredWorkItems = rawWorkItems.filter((item) => {
    if (currentOrg && item.organizationId !== currentOrg.id) return false;

    if (filterState.searchQuery.trim()) {
      const q = filterState.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchId = `ab#${item.itemNumber}`.includes(q) || `${item.itemNumber}`.includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchId && !matchTags) return false;
    }

    if (filterState.selectedTypes.length > 0 && !filterState.selectedTypes.includes(item.type)) {
      return false;
    }

    if (
      filterState.selectedAssignees.length > 0 &&
      (!item.assigneeId || !filterState.selectedAssignees.includes(item.assigneeId))
    ) {
      return false;
    }

    if (filterState.selectedPriorities.length > 0 && !filterState.selectedPriorities.includes(item.priority)) {
      return false;
    }

    if (filterState.selectedStates.length > 0 && !filterState.selectedStates.includes(item.state)) {
      return false;
    }

    return true;
  });

  // Mutator helper to optimistically update work items in UI
  const updateProjectWorkItemsState = (updater: (prevItems: WorkItem[]) => WorkItem[]) => {
    if (!currentProject) return;
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((ws) => ({
        ...ws,
        projects: ws.projects.map((proj) => {
          if (proj.id !== currentProject.id) return proj;
          return {
            ...proj,
            workItems: updater(proj.workItems),
          };
        }),
      }))
    );
  };

  // 1. Create Work Item in Supabase
  const createWorkItem = async (itemData: Partial<WorkItem>) => {
    if (!canEditWorkItem) {
      return { success: false, error: 'Viewers have read-only access.' };
    }
    if (!currentOrg || !currentProject) {
      return { success: false, error: 'No active project selected.' };
    }

    const defaultColumn = currentProject.columns[0];
    const targetColumn = currentProject.columns.find((c) => c.id === itemData.columnId) || defaultColumn;

    try {
      const res = await fetch('/api/work-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemData,
          organizationId: currentOrg.id,
          projectId: currentProject.id,
          columnId: targetColumn.id,
          sprintId: currentProject.sprints[0]?.id,
          reporterId: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create work item' };
      }

      const created: WorkItem = data.workItem;
      updateProjectWorkItemsState((prev) => [created, ...prev]);
      return { success: true, item: created };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // 2. Update Work Item in Supabase
  const updateWorkItem = async (id: string, updates: Partial<WorkItem>) => {
    if (!canEditWorkItem) {
      return { success: false, error: 'Viewers have read-only permissions.' };
    }

    // Optimistic UI update
    updateProjectWorkItemsState((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        if (selectedWorkItem?.id === id) setSelectedWorkItem(updated);
        return updated;
      })
    );

    try {
      const res = await fetch(`/api/work-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // 3. Move Work Item between columns or reorder in Supabase
  const moveWorkItem = async (itemId: string, destinationColumnId: string, destinationIndex: number) => {
    if (!canEditWorkItem) {
      return { success: false, error: 'Viewers cannot move work items.' };
    }
    if (!currentProject) return { success: false, error: 'No active project' };

    const destCol = currentProject.columns.find((c) => c.id === destinationColumnId);
    if (!destCol) return { success: false, error: 'Target column does not exist' };

    // Optimistic local move
    updateProjectWorkItemsState((prev) => {
      const itemToMove = prev.find((i) => i.id === itemId);
      if (!itemToMove) return prev;

      const remaining = prev.filter((i) => i.id !== itemId);
      const colItems = remaining
        .filter((i) => i.columnId === destinationColumnId)
        .sort((a, b) => a.order - b.order);

      const movedItem: WorkItem = {
        ...itemToMove,
        columnId: destinationColumnId,
        state: destCol.state,
        updatedAt: new Date().toISOString(),
      };

      colItems.splice(destinationIndex, 0, movedItem);
      const reindexed = colItems.map((it, idx) => ({ ...it, order: idx }));
      const otherItems = remaining.filter((i) => i.columnId !== destinationColumnId);

      const result = [...otherItems, ...reindexed];
      if (selectedWorkItem?.id === itemId) setSelectedWorkItem(movedItem);
      return result;
    });

    // Persist to Supabase
    try {
      await fetch(`/api/work-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columnId: destinationColumnId,
          order: destinationIndex,
        }),
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // 4. Delete Work Item in Supabase
  const deleteWorkItem = async (id: string) => {
    if (!canDeleteWorkItem) {
      return { success: false, error: 'Only Admins and Owners can delete work items.' };
    }

    updateProjectWorkItemsState((prev) => prev.filter((i) => i.id !== id));
    if (selectedWorkItem?.id === id) {
      setSelectedWorkItem(null);
    }

    try {
      const res = await fetch(`/api/work-items/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // 5. Add Comment in Supabase
  const addComment = async (workItemId: string, content: string) => {
    if (!canEditWorkItem) {
      return { success: false, error: 'Viewers cannot post comments.' };
    }
    if (!content.trim()) return { success: false, error: 'Comment cannot be empty.' };

    try {
      const res = await fetch(`/api/work-items/${workItemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          authorId: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }

      const newComment = data.comment;
      updateProjectWorkItemsState((prev) =>
        prev.map((item) => {
          if (item.id !== workItemId) return item;
          const updated = { ...item, comments: [...(item.comments || []), newComment] };
          if (selectedWorkItem?.id === workItemId) setSelectedWorkItem(updated);
          return updated;
        })
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // 6. Invite Member in Supabase
  const inviteMember = async (email: string, role: Role) => {
    if (!canInviteMembers) {
      return { success: false, error: 'Only Organization Owners and Admins can invite team members.' };
    }
    if (!currentOrg) return { success: false, error: 'No active organization' };

    try {
      const res = await fetch('/api/tenants/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          email,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to invite member' };
      }

      // Refresh organizations to get updated membership and seat count
      await loadInitialData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // 7. Upgrade Plan in Supabase
  const upgradePlan = async (tier: PlanTier, billingCycle: 'monthly' | 'annual' = 'monthly') => {
    if (!canManageBilling) {
      return { success: false, error: 'Only the Organization Owner can modify billing.' };
    }
    if (!currentOrg) return { success: false, error: 'No active organization' };

    try {
      const res = await fetch(`/api/tenants/${currentOrg.id}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier: tier, billingCycle }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update plan' };
      }

      // Refresh data
      await loadInitialData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // 8. Update Column WIP Limit in Supabase
  const updateColumnWipLimit = async (columnId: string, limit: number | null) => {
    if (!canCustomizeWip) {
      return {
        success: false,
        error: 'Custom WIP limits require a Pro or Enterprise subscription, and Admin permissions.',
      };
    }

    // Optimistic UI update
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((ws) => ({
        ...ws,
        projects: ws.projects.map((proj) => {
          if (proj.id !== currentProject?.id) return proj;
          return {
            ...proj,
            columns: proj.columns.map((col) => {
              if (col.id !== columnId) return col;
              return { ...col, wipLimit: limit };
            }),
          };
        }),
      }))
    );

    try {
      const res = await fetch(`/api/columns/${columnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wipLimit: limit }),
      });
      return { success: res.ok };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <TenantContext.Provider
      value={{
        organizations,
        currentOrg,
        currentWorkspace,
        currentProject,
        workspaces,
        projects,
        isLoading,
        currentUser,
        currentRole,
        allUsers,
        tenantMembers,
        filterState,
        setFilterState,
        resetFilters,
        filteredWorkItems,
        selectedWorkItem,
        setSelectedWorkItem,
        switchOrganization,
        switchProject,
        switchUser,
        createWorkItem,
        updateWorkItem,
        moveWorkItem,
        deleteWorkItem,
        addComment,
        inviteMember,
        upgradePlan,
        updateColumnWipLimit,
        refreshData: loadInitialData,
        isAuthenticated: Boolean(currentUserId && currentUser),
        isSuperAdmin,
        login,
        loginAsUser,
        logout,
        canEditWorkItem,
        canDeleteWorkItem,
        canInviteMembers,
        canManageBilling,
        canCustomizeWip,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
