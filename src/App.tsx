// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import HomePage from './components/HomePage';
import { projectRegistry } from './projectRegistry';

const App = () => (
  <Router>
    <main className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={<HomePage />} />
        {projectRegistry.map((p) => (
          <Route
            key={p.id}
            path={p.path}
            element={
              <Suspense fallback={<div className="p-8 text-center">Ładowanie projektu...</div>}>
                <p.component />
              </Suspense>
            }
          />
        ))}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen text-center">
              <div>
                <h1 className="text-4xl font-bold mb-4">404 - Nie znaleziono strony</h1>
                <a href="/" className="text-blue-400 underline">
                  Wróć do strony głównej
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </main>
  </Router>
);

export default App;
