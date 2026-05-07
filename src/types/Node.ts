// M1 最小节点类型 - M4 会扩展为 5 类节点（人/著作/事件/概念/地点）
// 当前仅含 M1 demo 必需字段

export type NodeType = 'person'; // M4 扩展为 'person' | 'work' | 'event' | 'concept' | 'place'

export interface Node {
  id: string;
  type: NodeType;
  name_zh: string;
  name_orig: string;
  birth_year?: number;
  death_year?: number;
}

export type RelationType = 'friend_collaborator'; // M4 扩展为 8 类关系

export interface Relation {
  source: string;
  target: string;
  type: RelationType;
}

export interface Dataset {
  nodes: Node[];
  relations: Relation[];
}
