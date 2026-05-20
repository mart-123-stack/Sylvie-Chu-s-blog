import { promises as fs } from 'fs';
import path from 'path';
import { supabase, supabaseAdmin } from './supabase';

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

// Use admin client for writes when available (bypasses RLS on server side)
function writeClient() {
  return supabaseAdmin || supabase;
}

export async function getAboutConfig(): Promise<AboutConfig> {
  try {
    const { data, error } = await supabase
      .from('about_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (!error && data) {
      return {
        name: data.name,
        initials: data.initials,
        title: data.title,
        location: data.location,
        bio: data.bio,
        skills: data.skills,
        experience: data.experience,
      };
    }
  } catch (error) {
    console.error('Supabase read failed:', error);
  }

  const local = await readLocalFile<AboutConfig>(aboutConfigPath);
  if (local) return local;

  return defaultAboutConfig;
}

export async function saveAboutConfig(config: AboutConfig): Promise<boolean> {
  const localSuccess = await writeLocalFile(aboutConfigPath, config);

  let supabaseSuccess = false;
  try {
    const client = writeClient();
    const { error } = await client
      .from('about_config')
      .update({
        name: config.name,
        initials: config.initials,
        title: config.title,
        location: config.location,
        bio: config.bio,
        skills: config.skills,
        experience: config.experience,
      })
      .eq('id', 1)
      .select();

    if (error) {
      console.error('Supabase error saving about config:', error);
    } else {
      console.log('About config saved to Supabase successfully');
      supabaseSuccess = true;
    }
  } catch (error) {
    console.error('Supabase save failed:', error);
  }

  return localSuccess || supabaseSuccess;
}

export async function getPhotos(): Promise<Photo[]> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data)) {
      return data.map(photo => ({
        id: photo.id,
        title: photo.title,
        category: photo.category,
        url: photo.url,
      }));
    }
  } catch (error) {
    console.error('Supabase photos read failed:', error);
  }

  const local = await readLocalFile<Photo[]>(photosConfigPath);
  if (local) return local;

  return defaultPhotos;
}

export async function savePhotos(photos: Photo[]): Promise<boolean> {
  const localSuccess = await writeLocalFile(photosConfigPath, photos);

  let supabaseSuccess = false;
  try {
    const client = writeClient();
    const { error: deleteError } = await client.from('photos').delete().neq('id', '');
    if (deleteError) {
      console.error('Supabase error deleting photos:', deleteError);
    }

    const { error } = await client
      .from('photos')
      .insert(
        photos.map(photo => ({
          id: photo.id,
          title: photo.title,
          category: photo.category,
          url: photo.url,
        }))
      )
      .select();

    if (error) {
      console.error('Supabase error saving photos:', error);
    } else {
      console.log('Photos saved to Supabase successfully');
      supabaseSuccess = true;
    }
  } catch (error) {
    console.error('Supabase photos save failed:', error);
  }

  return localSuccess || supabaseSuccess;
}
