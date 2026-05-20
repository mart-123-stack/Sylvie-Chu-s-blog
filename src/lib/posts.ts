import { promises as fs } from 'fs';
import path from 'path';
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

const postsFilePath = path.join(process.cwd(), 'data', 'posts.json');

async function readLocalPosts(): Promise<Post[]> {
  try {
    const data = await fs.readFile(postsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeLocalPosts(posts: Post[]): Promise<boolean> {
  try {
    await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing posts:', error);
    return false;
  }
}

export async function getPosts(): Promise<Post[]> {
  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data)) {
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
    }
  } catch (error) {
    console.error('Supabase posts read failed:', error);
  }

  // Fallback: read from local file
  return readLocalPosts();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
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
    }
  } catch (error) {
    console.error('Supabase post read failed:', error);
  }

  // Fallback: find in local file
  const posts = await readLocalPosts();
  return posts.find(p => p.slug === slug) || null;
}

export async function createPost(post: Omit<Post, 'id' | 'date'>): Promise<Post> {
  const newPost: Post = {
    ...post,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };

  // Always save locally first
  const posts = await readLocalPosts();
  posts.unshift(newPost);
  await writeLocalPosts(posts);

  // Try Supabase
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

    if (!error && data) {
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
    }
  } catch (error) {
    console.error('Supabase post create failed:', error);
  }

  return newPost;
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
  // Always update locally first
  const posts = await readLocalPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;

  posts[index] = { ...posts[index], ...updates };
  await writeLocalPosts(posts);

  // Try Supabase
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

    if (!error && data) {
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
    }
  } catch (error) {
    console.error('Supabase post update failed:', error);
  }

  return posts[index];
}

export async function deletePost(id: string): Promise<boolean> {
  // Always delete locally first
  const posts = await readLocalPosts();
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length === posts.length) return false;
  await writeLocalPosts(filtered);

  // Try Supabase
  try {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      console.error('Supabase post delete failed:', error);
    }
  } catch (error) {
    console.error('Supabase post delete failed:', error);
  }

  return true;
}
