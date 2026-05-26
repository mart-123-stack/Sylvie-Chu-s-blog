import { promises as fs } from 'fs';
import path from 'path';
import { query } from './db';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
  published: boolean;
  tags: string[];
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

export async function getPosts(options?: {
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ posts: Post[]; total: number }> {
  const tag = options?.tag;
  const search = options?.search;
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (tag) {
      conditions.push(`$${paramIndex++} = ANY(tags)`);
      params.push(tag);
    }
    if (search) {
      conditions.push(
        `(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM posts ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    const result = await query(
      `SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    if (result.rows && result.rows.length > 0) {
      const posts = result.rows.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        date: post.created_at,
        slug: post.slug,
        published: post.published,
        tags: post.tags || [],
      }));
      return { posts, total };
    }

    return { posts: [], total: 0 };
  } catch (error) {
    console.error('DB posts read failed:', error);
  }

  // Fallback: try reading local JSON cache (may be stale on fresh deploys)
  const allPosts = await readLocalPosts();
  let filtered = allPosts;

  if (tag) {
    filtered = filtered.filter(p => p.tags?.includes(tag));
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const posts = filtered.slice(offset, offset + limit);
  return { posts, total };
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const result = await query('SELECT * FROM posts ORDER BY created_at DESC');
    if (result.rows && result.rows.length > 0) {
      return result.rows.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        date: post.created_at,
        slug: post.slug,
        published: post.published,
        tags: post.tags || [],
      }));
    }
  } catch (error) {
    console.error('DB posts read failed:', error);
  }
  return readLocalPosts();
}

async function queryPostBySlug(slug: string): Promise<Post | null> {
  try {
    const result = await query(
      'SELECT * FROM posts WHERE slug = $1 LIMIT 1',
      [slug]
    );
    if (result.rows && result.rows.length > 0) {
      const post = result.rows[0];
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        date: post.created_at,
        slug: post.slug,
        published: post.published,
        tags: post.tags || [],
      };
    }
  } catch (error) {
    console.error('DB post read failed:', error);
  }
  return null;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Try the slug as-is
  let post = await queryPostBySlug(slug);
  if (post) return post;

  // Try URL-decoded (handles Chinese chars in URLs like /blog/%E7%BE%8E...)
  try {
    const decoded = decodeURIComponent(slug);
    if (decoded !== slug) {
      post = await queryPostBySlug(decoded);
      if (post) return post;
    }
  } catch {}

  // Try URL-encoded (in case DB stores the encoded form)
  try {
    const encoded = encodeURIComponent(slug);
    if (encoded !== slug) {
      post = await queryPostBySlug(encoded);
      if (post) return post;
    }
  } catch {}

  // Fallback to local JSON, trying both raw and decoded
  const posts = await readLocalPosts();
  const decodedSlug = tryDecode(slug);
  return posts.find(p => p.slug === slug || p.slug === decodedSlug) || null;
}

function tryDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export async function getAllTags(): Promise<string[]> {
  try {
    const result = await query('SELECT DISTINCT unnest(tags) AS tag FROM posts ORDER BY tag');
    return result.rows.map(r => r.tag);
  } catch (error) {
    console.error('DB tags read failed:', error);
    const posts = await readLocalPosts();
    const tagSet = new Set<string>();
    posts.forEach(p => p.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }
}

export async function createPost(post: Omit<Post, 'id' | 'date'>): Promise<Post> {
  const newPost: Post = {
    ...post,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    tags: post.tags || [],
  };

  const posts = await readLocalPosts();
  posts.unshift(newPost);
  await writeLocalPosts(posts);

  try {
    const result = await query(
      `INSERT INTO posts (id, title, content, excerpt, author, slug, published, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [newPost.id, post.title, post.content, post.excerpt, post.author, post.slug, post.published, post.tags || []]
    );

    if (result.rows && result.rows.length > 0) {
      const data = result.rows[0];
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        author: data.author,
        date: data.created_at,
        slug: data.slug,
        published: data.published,
        tags: data.tags || [],
      };
    }
  } catch (error) {
    console.error('DB post create failed:', error);
  }

  return newPost;
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push(`content = $${paramIndex++}`);
    values.push(updates.content);
  }
  if (updates.excerpt !== undefined) {
    fields.push(`excerpt = $${paramIndex++}`);
    values.push(updates.excerpt);
  }
  if (updates.author !== undefined) {
    fields.push(`author = $${paramIndex++}`);
    values.push(updates.author);
  }
  if (updates.slug !== undefined) {
    fields.push(`slug = $${paramIndex++}`);
    values.push(updates.slug);
  }
  if (updates.published !== undefined) {
    fields.push(`published = $${paramIndex++}`);
    values.push(updates.published);
  }
  if (updates.tags !== undefined) {
    fields.push(`tags = $${paramIndex++}`);
    values.push(updates.tags);
  }

  if (fields.length === 0) return null;

  try {
    values.push(id);
    const result = await query(
      `UPDATE posts SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows && result.rows.length > 0) {
      const data = result.rows[0];
      // Sync to local file
      const posts = await readLocalPosts();
      const index = posts.findIndex(p => p.id === id);
      if (index !== -1) {
        posts[index] = { ...posts[index], ...updates };
        await writeLocalPosts(posts);
      }
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        author: data.author,
        date: data.created_at,
        slug: data.slug,
        published: data.published,
        tags: data.tags || [],
      };
    }
  } catch (error) {
    console.error('DB post update failed:', error);
  }

  // Fallback to local
  const posts = await readLocalPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;

  posts[index] = { ...posts[index], ...updates };
  await writeLocalPosts(posts);
  return posts[index];
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
    if (result.rows && result.rows.length > 0) {
      const posts = await readLocalPosts();
      await writeLocalPosts(posts.filter(p => p.id !== id));
      return true;
    }
  } catch (error) {
    console.error('DB post delete failed:', error);
  }

  // Fallback to local
  const posts = await readLocalPosts();
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length === posts.length) return false;
  await writeLocalPosts(filtered);
  return true;
}
