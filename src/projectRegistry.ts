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
    id: 'gameMapEditor',
    name: 'Game Map Editor',
    path: '/gameMapEditor',
    component: lazy(() => import('./PROJECTS/game_editors/map')),
  },
  {
    id: 'gameScenarioEditor',
    name: 'Game Scenario Editor',
    path: '/gameScenarioEditor',
    component: lazy(() => import('./PROJECTS/game_editors/Scenario')),
  },
  {
    id: 'cambridge',
    name: 'Cambridge',
    path: '/cambridge',
    component: lazy(() => import('./PROJECTS/cambridge/quiz')),
  },
  {
    id: 'musicGenerator',
    name: 'Music Generator',
    path: '/musicGenerator',
    component: lazy(() => import('./PROJECTS/battle_music/generator')),
  },
  {
    id: 'shootDecision',
    name: 'Shoot Decision',
    path: '/shootDecision',
    component: lazy(() => import('./PROJECTS/short_decision/App')),
  },
 
];
