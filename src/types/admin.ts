export type AdminRole = 'core' | 'hr' | 'pr' | 'event' | 'organizer' | 'design' | 'visual';

export interface AdminProfile {
  id: string;
  email: string;
  display_name: string;
  role: AdminRole;
  is_active: boolean;
}

export interface Member {
  id: string;
  student_id: string;
  member_name: string;
  email: string;
  phone: string;
  department: string;
  session: string;
  status: 'pending' | 'approved' | 'rejected' | 'alumni';
  created_at: string;
}

export interface CommitteeMember {
  id: string;
  student_id: string | null;
  member_name: string;
  designation: string;
  department: string;
  year: string;
  category: 'CORE' | 'Head' | 'Asst. Head' | 'Executive';
  image_url: string | null;
  image?: string | null; // For legacy/modernization compatibility
  club_department: string | null;
  blood_group: string | null;
  email: string | null;
  phone: string | null;
  social_links?: any;
  order_index: number;
}

export interface ExhibitionSubmission {
  id: string;
  participant_name: string;
  institute: string;
  photo_title: string;
  photo_url: string;
  category: string;
  status: 'pending' | 'selected' | 'rejected';
  submitted_at: string;
  email?: string;
  featured_on_hero?: boolean;
}

export interface FinanceRecord {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}
