import { supabase } from './supabase';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
  published: boolean;
}

export async function getPosts(): Promise<Post[]> {
  // Return empty during build time
  if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL === '') {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    return data.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      date: post.created_at,
      slug: post.slug,
      published: post.published,
    }));
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      author: data.author,
      date: data.created_at,
      slug: data.slug,
      published: data.published,
    };
  } catch (error) {
    console.error('Error reading post:', error);
    return null;
  }
}

export async function createPost(post: Omit<Post, 'id' | 'date'>): Promise<Post> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        slug: post.slug,
        published: post.published,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      author: data.author,
      date: data.created_at,
      slug: data.slug,
      published: data.published,
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({
        title: updates.title,
        content: updates.content,
        excerpt: updates.excerpt,
        author: updates.author,
        slug: updates.slug,
        published: updates.published,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      author: data.author,
      date: data.created_at,
      slug: data.slug,
      published: data.published,
    };
  } catch (error) {
    console.error('Error updating post:', error);
    return null;
  }
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}
