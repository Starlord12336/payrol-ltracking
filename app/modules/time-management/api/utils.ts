export const mapId = <T extends { _id?: string }>(obj: T): T & { id: string } => {
  return {
    ...obj,
    id: obj._id ?? (obj as any).id, // keep existing id if present
  };
};

export const mapIds = <T extends { _id?: string }>(arr: T[]): (T & { id: string })[] => {
  return arr.map(mapId);
};
