export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Member";
  avatarUrl: string;
};
