// src/projectRegistry.ts
import { lazy } from 'react';

export const projectRegistry = [

  {
    id: 'potop_gra',
    name: 'Potop Gra',
    path: '/potop-gra',
    component: lazy(() => import('./PROJECTS/potop_szwedzki_mapa/PotopSzwedzki')),
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
