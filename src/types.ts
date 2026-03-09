export type Profile = {
  id: string;
  nickname: string;
};

export type Post = {
  id: number;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile: Profile | null;
};

export type Comment = {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile: Profile | null;
};
