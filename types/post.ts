
export type PostStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'x' | 'linkedin';
export type AuditAction = 'CREATE' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'EDIT';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
}

export interface AuditEntry {
  at: string; // ISO timestamp
  actor: string;
  action: AuditAction;
  note?: string;
}

export interface Post {
  id: string;
  title: string;
  caption: string;
  mediaUris: string[]; // local or remote URIs
  platforms: Platform[];
  scheduledAt?: string; // ISO timestamp
  status: PostStatus;
  rejectionReason?: string;
  createdBy: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  audit: AuditEntry[];
}
