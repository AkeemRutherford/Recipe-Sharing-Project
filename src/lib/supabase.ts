import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Recipe = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  prep_time: string;
  cook_time: string;
  servings: number;
  difficulty: string;
  tags: string[];
  ingredients: Array<{ amount: string; name: string }>;
  instructions: string[];
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    profile_pic_url: string;
  };
};

export type RecipeModification = {
  id: string;
  recipe_id: string;
  user_id: string;
  modification_type: 'substitution' | 'addition' | 'tip' | 'question';
  description: string;
  change_data: {
    type?: string;
    from?: string;
    to?: string;
    ingredient?: string;
    amount?: string;
  };
  likes_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    profile_pic_url: string;
  };
};

export type Notification = {
  id: string;
  user_id: string;
  recipe_id: string;
  modification_id?: string;
  actor_id?: string;
  notification_type: 'modification' | 'like' | 'comment';
  message: string;
  read: boolean;
  created_at: string;
  recipes?: {
    title: string;
  };
  profiles?: {
    full_name: string;
    profile_pic_url: string;
  };
};
