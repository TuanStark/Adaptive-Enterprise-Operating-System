export type Task = {
  id: string;
  title: string;
  status: string;
  type: "BUG" | "STORY" | "TASK";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignee: { name: string; avatar?: string };
  sprint?: string;
  storyPoints?: number;
};
