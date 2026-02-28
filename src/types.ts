export interface Letter {
  id: string;
  letterText: string;
  nickname?: string;
  createdAt: any; // Firestore Timestamp
  status?: "pending" | "approved";
  approvedAt?: any; // Firestore Timestamp
}
