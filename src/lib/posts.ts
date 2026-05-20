import { promises as fs } from 'fs';
import path from 'path';
import { supabase, supabaseAdmin } from './supabase';

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

// Use admin client for writes when available (bypasses RLS on server side)
function writeClient() {
  return supabaseAdmin || supabase;
}

export async function getPosts(): Promise<Post[]> {
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

  return readLocalPosts();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
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

  const posts = await readLocalPosts();
  return posts.find(p => p.slug === slug) || null;
}

export async function createPost(post: Omit<Post, 'id' | 'date'>): Promise<Post> {
  const newPost: Post = {
    ...post,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };

  const posts = await readLocalPosts();
  posts.unshift(newPost);
  await writeLocalPosts(posts);

  try {
    const client = writeClient();
    const { data, error } = await client
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
  const posts = await readLocalPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;

  posts[index] = { ...posts[index], ...updates };
  await writeLocalPosts(posts);

  try {
    const client = writeClient();
    const { data, error } = await client
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
  const posts = await readLocalPosts();
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length === posts.length) return false;
  await writeLocalPosts(filtered);

  try {
    const client = writeClient();
    const { error } = await client.from('posts').delete().eq('id', id);
    if (error) {
      console.error('Supabase post delete failed:', error);
    }
  } catch (error) {
    console.error('Supabase post delete failed:', error);
  }

  return true;
}
