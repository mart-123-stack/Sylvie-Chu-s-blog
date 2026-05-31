import { getAboutConfig } from "@/lib/config";
import AnimatedSection from "@/components/AnimatedSection";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AboutPage() {
  const config = await getAboutConfig();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-100 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">

      <main className="max-w-4xl mx-auto px-4 py-12">
        <AnimatedSection animation="fade-in-up">
          <h2 className="text-4xl font-bold text-primary-dark mb-8 dark:text-white">About Me</h2>
        </AnimatedSection>

        <AnimatedSection animation="fade-in-up" delay={100}>
          <div className="bg-white/90 rounded-xl shadow-lg shadow-sky-100 p-8 border border-sky-100 dark:bg-slate-800/90 dark:border-slate-700 dark:shadow-slate-900/30">
            <div className="flex items-center mb-8">
              <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                {config.avatar ? (
                  <img src={config.avatar} alt={config.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-bold">{config.initials}</span>
                )}
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-semibold text-primary-dark dark:text-white">{config.name}</h3>
                <p className="text-foreground/60">{config.title}</p>
                <p className="text-foreground/40 mt-2">{config.location}</p>
              </div>
            </div>

            <AnimatedSection animation="fade-in-up" delay={200}>
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-primary-dark mb-4 dark:text-white">Bio</h4>
                <p className="text-foreground/70 whitespace-pre-wrap">
                  {config.bio}
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-in-up" delay={300}>
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-primary-dark mb-4 dark:text-white">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {config.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm dark:bg-sky-900 dark:text-sky-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-in-up" delay={400}>
              <div>
                <h4 className="text-xl font-semibold text-primary-dark mb-4 dark:text-white">Experience</h4>
                <div className="space-y-4">
                  {config.experience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-4 border-primary pl-4 dark:border-sky-400">
                      <h5 className="font-semibold text-primary-dark dark:text-white">{exp.title}</h5>
                      <p className="text-foreground/60">{exp.company}</p>
                      <p className="text-foreground/40 text-sm">{exp.period}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </AnimatedSection>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm mt-12 py-6 border-t border-sky-100 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 text-center text-foreground/50">
          <p>&copy; {new Date().getFullYear()} Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
