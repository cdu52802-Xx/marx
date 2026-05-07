import type { Dataset } from '../types/Node.ts';

export const m1Dataset: Dataset = {
  nodes: [
    {
      id: 'marx',
      type: 'person',
      name_zh: '卡尔·马克思',
      name_orig: 'Karl Marx',
      birth_year: 1818,
      death_year: 1883,
    },
    {
      id: 'engels',
      type: 'person',
      name_zh: '弗里德里希·恩格斯',
      name_orig: 'Friedrich Engels',
      birth_year: 1820,
      death_year: 1895,
    },
  ],
  relations: [
    {
      source: 'marx',
      target: 'engels',
      type: 'friend_collaborator',
    },
  ],
};
