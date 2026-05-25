import { promises as fs } from 'fs';
import path from 'path';
import { query, pool } from './db';

export interface AboutConfig {
  name: string;
  initials: string;
  title: string;
  location: string;
  bio: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    period: string;
  }>;
  avatar?: string;
}

export interface Photo {
  id: string;
  title: string;
  category: string;
  url?: string;
}

const dataDir = path.join(process.cwd(), 'data', 'config');
const aboutConfigPath = path.join(dataDir, 'about.json');
const photosConfigPath = path.join(dataDir, 'photos.json');

async function readLocalFile<T>(filePath: string): Promise<T | null> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function writeLocalFile<T>(filePath: string, data: T): Promise<boolean> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
}

const defaultAboutConfig: AboutConfig = {
  name: '你的姓名',
  initials: 'YZ',
  title: '大一学生 · 计算机科学与技术',
  location: '你的大学 · 所在城市',
  bio: '你好！我是一名计算机科学与技术专业的大一学生，目前正在探索编程世界的奥秘。\n\n这个博客是我记录学习笔记、项目经验和日常生活的地方。我目前主要在学习 C/C++、Python 和前端开发基础，希望能够通过不断地实践和总结，逐步成长为一名合格的程序员。\n\n课余时间我喜欢打篮球、摄影和阅读。如果你对博客内容有任何问题或建议，欢迎在评论区留言交流！\n\n## 学习目标\n\n- 打好计算机基础（数据结构、算法、操作系统）\n- 掌握至少一门编程语言（正在学习 C++/Python）\n- 参与开源项目，积累实战经验\n- 建立自己的技术博客，记录成长过程',
  skills: ['C/C++（学习中）', 'Python（基础）', 'HTML & CSS', 'JavaScript（入门）', 'Git & GitHub', 'VS Code', 'Markdown', 'Linux（基础）'],
  experience: [
    { title: '计算机科学与技术 本科生', company: '你的大学', period: '2025 - 至今' },
    { title: '个人博客搭建', company: '独立项目', period: '2026' },
    { title: '程序设计竞赛 参赛经历', company: '校级 / 院级', period: '2025' },
  ],
};

const defaultPhotos: Photo[] = [
  { id: '1', title: 'Mountain View', category: 'Nature' },
  { id: '2', title: 'City Lights', category: 'Urban' },
  { id: '3', title: 'Ocean Sunset', category: 'Nature' },
  { id: '4', title: 'Forest Path', category: 'Nature' },
  { id: '5', title: 'Street Art', category: 'Urban' },
  { id: '6', title: 'Desert Dunes', category: 'Nature' },
  { id: '7', title: 'Architecture', category: 'Urban' },
  { id: '8', title: 'Autumn Leaves', category: 'Nature' },
  { id: '9', title: 'Night Sky', category: 'Nature' },
];

export async function getAboutConfig(): Promise<AboutConfig> {
  // Try DB read with retry for cold-start resilience
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await query(
        'SELECT * FROM about_config WHERE id = 1 LIMIT 1'
      );

      if (result.rows && result.rows.length > 0) {
        const data = result.rows[0];
        const config: AboutConfig = {
          name: data.name,
          initials: data.initials,
          title: data.title,
          location: data.location,
          bio: data.bio,
          skills: data.skills || [],
          experience: data.experience || [],
          avatar: data.avatar_url || undefined,
        };
        // Sync DB data to local file so fallback stays current
        writeLocalFile(aboutConfigPath, config).catch(() => {});
        return config;
      }
    } catch (error) {
      console.error(`DB about config read failed (attempt ${attempt + 1}):`, error);
      if (attempt === 0) {
        // Wait briefly before retry (cold start mitigation)
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  const local = await readLocalFile<AboutConfig>(aboutConfigPath);
  if (local) return local;

  return defaultAboutConfig;
}

export async function saveAboutConfig(config: AboutConfig): Promise<boolean> {
  const localSuccess = await writeLocalFile(aboutConfigPath, config);

  let dbSuccess = false;
  try {
    const result = await query(
      `UPDATE about_config SET
        name = $1, initials = $2, title = $3, location = $4,
        bio = $5, skills = $6, experience = $7, avatar_url = $8, updated_at = NOW()
       WHERE id = 1
       RETURNING id`,
      [config.name, config.initials, config.title, config.location,
       config.bio, JSON.stringify(config.skills), JSON.stringify(config.experience),
       config.avatar || null]
    );

    if (result.rows && result.rows.length > 0) {
      dbSuccess = true;
    }
  } catch (error) {
    console.error('DB about config save failed:', error);
  }

  return localSuccess || dbSuccess;
}

export async function getPhotos(): Promise<Photo[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await query(
        'SELECT * FROM photos ORDER BY created_at DESC'
      );

      // Always return DB result even if empty — avoids falling through to stale file
      const photos = result.rows.map(photo => ({
        id: photo.id,
        title: photo.title,
        category: photo.category,
        url: photo.url,
      }));
      writeLocalFile(photosConfigPath, photos).catch(() => {});
      return photos;
    } catch (error) {
      console.error(`DB photos read failed (attempt ${attempt + 1}):`, error);
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  // DB unavailable — fall back to local file
  const local = await readLocalFile<Photo[]>(photosConfigPath);
  if (local && local.length > 0) return local;

  return [];
}

export async function savePhotos(photos: Photo[]): Promise<boolean> {
  const localSuccess = await writeLocalFile(photosConfigPath, photos);

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query('DELETE FROM photos WHERE 1=1');

    for (const photo of photos) {
      await client.query(
        'INSERT INTO photos (id, title, category, url) VALUES ($1, $2, $3, $4)',
        [photo.id, photo.title, photo.category, photo.url || null]
      );
    }

    await client.query('COMMIT');
    return true;
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('DB photos save failed:', error);
  } finally {
    if (client) client.release();
  }

  return localSuccess;
}
