import { getAboutConfig } from "@/lib/config";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AboutPage() {
  const config = await getAboutConfig();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-100 to-indigo-100">

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-primary-dark mb-8">About Me</h2>

        <div className="bg-white/90 rounded-xl shadow-lg shadow-sky-100 p-8 border border-sky-100">
          <div className="flex items-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {config.initials}
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-semibold text-primary-dark">{config.name}</h3>
              <p className="text-foreground/60">{config.title}</p>
              <p className="text-foreground/40 mt-2">{config.location}</p>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-semibold text-primary-dark mb-4">Bio</h4>
            <p className="text-foreground/70 whitespace-pre-wrap">
              {config.bio}
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-semibold text-primary-dark mb-4">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {config.skills.map((skill: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-primary-dark mb-4">Experience</h4>
            <div className="space-y-4">
              {config.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <h5 className="font-semibold text-primary-dark">{exp.title}</h5>
                  <p className="text-foreground/60">{exp.company}</p>
                  <p className="text-foreground/40 text-sm">{exp.period}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm mt-12 py-6 border-t border-sky-100">
        <div className="max-w-6xl mx-auto px-4 text-center text-foreground/50">
          <p>&copy; {new Date().getFullYear()} Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
