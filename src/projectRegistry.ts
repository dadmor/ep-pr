// src/projectRegistry.ts
import { lazy } from 'react';

export const projectRegistry = [

  {
    id: 'the_swedish_deluge',
    name: 'The Swedish Deluge',
    path: '/the-swedish-deluge',
    component: lazy(() => import('./PROJECTS/the_swedish_deluge/TheSwedishDeluge')),
  },
  {
    id: 'cambridge',
    name: 'Cambridge',
    path: '/cambridge',
    component: lazy(() => import('./PROJECTS/cambridge/quiz')),
  },
  {
    id: 'gameHex',
    name: 'gameHex',
    path: '/game',
    component: lazy(() => import('./PROJECTS/game/map')),
  }
];
