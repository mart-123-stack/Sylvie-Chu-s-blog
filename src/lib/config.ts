import { promises as fs } from 'fs';
import path from 'path';
import { query } from './db';

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
  name: 'Sylive Chu',
  initials: 'SC',
  title: 'Full Stack Developer',
  location: 'San Francisco, CA',
  bio: 'I&apos;m a passionate full-stack developer with over 5 years of experience building web applications. I love creating elegant solutions to complex problems and sharing my knowledge with the community.\n\nWhen I&apos;m not coding, you can find me hiking, reading, or exploring new coffee shops in the city.',
  skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'PostgreSQL', 'Tailwind CSS'],
  experience: [
    { title: 'Senior Developer', company: 'Tech Company Inc.', period: '2022 - Present' },
    { title: 'Full Stack Developer', company: 'Startup XYZ', period: '2020 - 2022' },
    { title: 'Junior Developer', company: 'Web Agency ABC', period: '2019 - 2020' },
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
  try {
    const result = await query(
      'SELECT * FROM about_config WHERE id = 1 LIMIT 1'
    );

    if (result.rows && result.rows.length > 0) {
      const data = result.rows[0];
      return {
        name: data.name,
        initials: data.initials,
        title: data.title,
        location: data.location,
        bio: data.bio,
        skills: data.skills || [],
        experience: data.experience || [],
      };
    }
  } catch (error) {
    console.error('DB about config read failed:', error);
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
        bio = $5, skills = $6, experience = $7, updated_at = NOW()
       WHERE id = 1
       RETURNING id`,
      [config.name, config.initials, config.title, config.location,
       config.bio, JSON.stringify(config.skills), JSON.stringify(config.experience)]
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
  try {
    const result = await query(
      'SELECT * FROM photos ORDER BY created_at DESC'
    );

    if (result.rows && result.rows.length > 0) {
      return result.rows.map(photo => ({
        id: photo.id,
        title: photo.title,
        category: photo.category,
        url: photo.url,
      }));
    }
  } catch (error) {
    console.error('DB photos read failed:', error);
  }

  const local = await readLocalFile<Photo[]>(photosConfigPath);
  if (local) return local;

  return defaultPhotos;
}

export async function savePhotos(photos: Photo[]): Promise<boolean> {
  const localSuccess = await writeLocalFile(photosConfigPath, photos);

  let dbSuccess = false;
  try {
    await query('DELETE FROM photos WHERE 1=1');

    for (const photo of photos) {
      await query(
        'INSERT INTO photos (id, title, category, url) VALUES ($1, $2, $3, $4)',
        [photo.id, photo.title, photo.category, photo.url || null]
      );
    }

    dbSuccess = true;
  } catch (error) {
    console.error('DB photos save failed:', error);
  }

  return localSuccess || dbSuccess;
}
