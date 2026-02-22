export enum OrganizationPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum OrgMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
}

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  plan: OrganizationPlan;
  monthlyTokenLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface IOrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrgMemberRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  plan?: OrganizationPlan;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  logoUrl?: string;
  plan?: OrganizationPlan;
}

export interface AddMemberRequest {
  userId: string;
  role?: OrgMemberRole;
}

export interface UpdateMemberRoleRequest {
  role: OrgMemberRole;
}
