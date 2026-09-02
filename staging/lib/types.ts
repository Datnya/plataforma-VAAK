export type Profile = {
  id: string;
  display_name: string;
  locale: "es" | "en";
};

export type Membership = {
  company_id: string;
  role: "admin" | "worker" | "client";
  companies: { name: string } | null;
};

export type Project = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  legal_name: string | null;
  installation_date: string | null;
  opening_date: string | null;
  cover_path: string | null;
};

export type Objective = {
  id: string;
  project_id: string | null;
  title: string;
  status: "pending" | "in_progress" | "completed";
  due_date: string | null;
};
