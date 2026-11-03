export type Status =
  | "Saved"
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected";

export type Application = {
  id: number;
  company: string;
  role: string;
  location: string;
  dateApplied: string;
  status: Status;
  color?: string;
  initials?: string;
  jobUrl?: string;
  followUpDate?: string;
};


