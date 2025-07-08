// src/components/HomePage.tsx
import { projectRegistry } from '@/projectRegistry';
import { Link } from 'react-router-dom';


const HomePage = () => (
  <div className="max-w-3xl mx-auto py-12 px-4">
    <h1 className="text-4xl font-bold text-center mb-8">Projekty</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projectRegistry.map((project) => (
        <Link
          key={project.id}
          to={project.path}
          className="block bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors"
        >
          <h2 className="text-xl font-semibold mb-1">{project.name}</h2>
          <p className="text-gray-400 text-sm">{project.path}</p>
        </Link>
      ))}
    </div>
  </div>
);

export default HomePage;
