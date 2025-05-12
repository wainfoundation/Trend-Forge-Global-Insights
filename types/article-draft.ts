export type ArticleStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface ArticleDraft {
  id?: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  isPremium: boolean;
  status: ArticleStatus;
  authorId: string;
  authorName: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface ArticleWithStats extends ArticleDraft {
  views: number;
  likes: number;
  comments: number;
  readTime: number;
  author?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}
