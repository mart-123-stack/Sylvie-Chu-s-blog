import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Blog</h1>
            <div className="space-x-6">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Home
              </Link>
              <Link href="/blog" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Blog
              </Link>
              <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                About
              </Link>
              <Link href="/gallery" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">About Me</h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              JD
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">John Doe</h3>
              <p className="text-gray-600 dark:text-gray-300">Full Stack Developer</p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">San Francisco, CA</p>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Bio</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              I'm a passionate full-stack developer with over 5 years of experience building web applications. 
              I love creating elegant solutions to complex problems and sharing my knowledge with the community.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              When I'm not coding, you can find me hiking, reading, or exploring new coffee shops in the city.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Skills</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">JavaScript</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">TypeScript</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">React</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Next.js</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Node.js</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Python</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">PostgreSQL</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Tailwind CSS</span>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Experience</h4>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h5 className="font-semibold text-gray-800 dark:text-white">Senior Developer</h5>
                <p className="text-gray-600 dark:text-gray-300">Tech Company Inc.</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">2022 - Present</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h5 className="font-semibold text-gray-800 dark:text-white">Full Stack Developer</h5>
                <p className="text-gray-600 dark:text-gray-300">Startup XYZ</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">2020 - 2022</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h5 className="font-semibold text-gray-800 dark:text-white">Junior Developer</h5>
                <p className="text-gray-600 dark:text-gray-300">Web Agency ABC</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">2019 - 2020</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2024 Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
