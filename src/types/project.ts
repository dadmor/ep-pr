// src/types/project.ts
export interface Project {
    name: string;
    path: string;
    description: string;
    category: string;
    component?: React.ComponentType;
  }