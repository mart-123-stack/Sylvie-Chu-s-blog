'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Experience {
  title: string;
  company: string;
  period: string;
}

interface AboutConfig {
  name: string;
  initials: string;
  title: string;
  location: string;
  bio: string;
  skills: string[];
  experience: Experience[];
  avatar?: string;
}

export default function AdminAboutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AboutConfig>({
    name: '',
    initials: '',
    title: '',
    location: '',
    bio: '',
    skills: [],
    experience: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // Resize large avatars client-side
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        const resized = c.toDataURL('image/jpeg', 0.7);
        setAvatarPreview(resized);
        setFormData({ ...formData, avatar: resized });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormData({ ...formData, avatar: undefined });
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`/api/config/about?t=${Date.now()}`);
      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError('Failed to fetch config');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('/api/config/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setError('');
        alert('Changes saved successfully!');
      } else {
        let errorMsg = `Failed to save config (status: ${response.status})`;
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {}
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Save config error:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown'}. Token: ${token ? 'exists' : 'missing'}`);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, ''] });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData({ ...formData, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { title: '', company: '', period: '' }],
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperience = [...formData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setFormData({ ...formData, experience: newExperience });
  };

  const removeExperience = (index: number) => {
    const newExperience = formData.experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: newExperience });
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-100 dark:from-sky-950 dark:to-indigo-950 flex items-center justify-center">
        <p className="text-sky-900 dark:text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-100 dark:from-sky-950 dark:to-indigo-950">
      <nav className="bg-white dark:bg-sky-950 shadow-sm border-b border-sky-100 dark:border-sky-900">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-sky-900 dark:text-white">Edit About Page</h1>
            <Link
              href="/admin"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
            >
              ← Back
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-sky-950 rounded-lg shadow-lg shadow-sky-100 dark:shadow-sky-900/20 p-8 border border-sky-100 dark:border-sky-900">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
              Initials
            </label>
            <input
              type="text"
              value={formData.initials}
              onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
              Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-sky-300 to-sky-500 flex items-center justify-center flex-shrink-0">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{formData.initials || '?'}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition cursor-pointer text-sm text-center">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              rows={5}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
              Skills
            </label>
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
            >
              Add Skill
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
              Experience
            </label>
            {formData.experience.map((exp, index) => (
              <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Title"
                    value={exp.title}
                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Period (e.g., 2020 - 2022)"
                    value={exp.period}
                    onChange={(e) => updateExperience(index, 'period', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
            >
              Add Experience
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
}
