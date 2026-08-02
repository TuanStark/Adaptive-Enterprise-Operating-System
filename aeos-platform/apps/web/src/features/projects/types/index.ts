export type Project = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  status: "Active" | "Archived" | "Draft";
};
