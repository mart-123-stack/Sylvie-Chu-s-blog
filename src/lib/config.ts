import { supabase } from './supabase';

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
  // Return default during build time
  if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL === '') {
    return defaultAboutConfig;
  }

  try {
    const { data, error } = await supabase
      .from('about_config')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) throw error;
    
    return {
      name: data.name,
      initials: data.initials,
      title: data.title,
      location: data.location,
      bio: data.bio,
      skills: data.skills,
      experience: data.experience,
    };
  } catch (error) {
    console.error('Error reading about config:', error);
    return defaultAboutConfig;
  }
}

export async function saveAboutConfig(config: AboutConfig): Promise<boolean> {
  try {
    const { error } = await supabase
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
      .eq('id', 1);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving about config:', error);
    return false;
  }
}

export async function getPhotos(): Promise<Photo[]> {
  // Return default during build time
  if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL === '') {
    return defaultPhotos;
  }

  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data || !Array.isArray(data)) {
      return defaultPhotos;
    }
    
    return data.map(photo => ({
      id: photo.id,
      title: photo.title,
      category: photo.category,
      url: photo.url,
    }));
  } catch (error) {
    console.error('Error reading photos:', error);
    return defaultPhotos;
  }
}

export async function savePhotos(photos: Photo[]): Promise<boolean> {
  try {
    // Delete all existing photos
    await supabase.from('photos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new photos
    const { error } = await supabase
      .from('photos')
      .insert(
        photos.map(photo => ({
          id: photo.id,
          title: photo.title,
          category: photo.category,
          url: photo.url,
        }))
      );
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving photos:', error);
    return false;
  }
}
