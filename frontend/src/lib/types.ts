export type UserProfile = {
  email: string;
  avatar: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  reminder_at?: string | null;
};

export type LoginResponse = {
  access_token: string;
  user?: UserProfile;
  message?: string;
};

export type RegisterResponse = {
  message: string;
  user?: UserProfile;
};
