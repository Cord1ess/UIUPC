export type AdminRole = 'core' | 'hr' | 'pr' | 'event' | 'organizer' | 'design' | 'visual' | 'alumni_advisor';

export interface AdminProfile {
  id: string;
  email: string;
  display_name: string;
  role: AdminRole;
  is_active: boolean;
}

export interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  tags?: string[];
  countdown_target?: string | null;
  show_in_more_events?: boolean;
  event_images?: string[];
  gallery_folder_id?: string | null;
  has_timer?: boolean;
  marker_color?: string;
  marker_link_url?: string;
}

export interface Member {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  session: string;
  status: 'pending' | 'approved' | 'rejected' | 'alumni';
  created_at: string;
  image_url?: string | null;
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
  drive_file_ids?: string[];
  category: string;
  status: 'pending' | 'selected' | 'rejected';
  payment_status: 'paid' | 'unpaid';
  transaction_id?: string;
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
