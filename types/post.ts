
export type PostStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
}

export interface Post {
  id: string;
  content: string;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  requestedApprovals: Contact[];
  approvals: {
    [contactId: string]: {
      status: 'approved' | 'rejected' | 'pending';
      respondedAt?: Date;
      feedback?: string;
    };
  };
  imageUris?: string[];
  videoUris?: string[];
}
