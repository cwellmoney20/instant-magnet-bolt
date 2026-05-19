export type PhotoStatus = 'new' | 'printed' | 'completed';
export type EventStatus = 'draft' | 'active' | 'archived';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type EventType = 'wedding' | 'market' | 'birthday' | 'corporate' | 'other';
export type PaymentStatus = 'free' | 'unpaid' | 'paid';

export interface Event {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  event_type: EventType | null;
  date: string;
  time: string | null;
  location: string | null;
  cover_photo_path: string | null;
  slug: string;
  status: EventStatus;
  is_paid_event: boolean;
  photo_price_cents: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EventGuest {
  id: string;
  event_id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Photo {
  id: string;
  event_id: string;
  event_guest_id: string;
  storage_path: string;
  status: PhotoStatus;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  uploaded_at: string;
  status_updated_at: string;
  event_guests?: EventGuest;
}

export interface UserPlan {
  user_id: string;
  plan: 'free' | 'pro';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailNotification {
  id: string;
  event_guest_id: string;
  photo_id: string | null;
  email: string;
  type: string;
  status: NotificationStatus;
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
      event_guests: {
        Row: EventGuest;
        Insert: Omit<EventGuest, 'id' | 'created_at'>;
        Update: Partial<Omit<EventGuest, 'id' | 'created_at'>>;
      };
      photos: {
        Row: Photo;
        Insert: Omit<Photo, 'id' | 'uploaded_at' | 'status_updated_at'>;
        Update: Partial<Omit<Photo, 'id' | 'uploaded_at'>>;
      };
      email_notifications: {
        Row: EmailNotification;
        Insert: Omit<EmailNotification, 'id' | 'created_at'>;
        Update: Partial<Omit<EmailNotification, 'id' | 'created_at'>>;
      };
      user_plans: {
        Row: UserPlan;
        Insert: Omit<UserPlan, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPlan, 'user_id' | 'created_at'>>;
      };
    };
  };
}
