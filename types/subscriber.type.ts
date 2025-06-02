export interface ISubscriber extends Document {
  email: string;
  selectedCategories?: string[];
  // source: string;
  consentGivenAt: Date;
  created_at: Date;
  updated_at: Date;
}
