export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  image?: string; // For backward compatibility
  isPremium: boolean;
  publishedAt?: string;
  publishDate?: string; // For backward compatibility
  date?: string; // For backward compatibility
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    avatar?: string; // For backward compatibility
  };
  readTime: number;
  likes: number;
  comments: number;
  views: number;
  url?: string; // For external articles
  source?: string; // For external articles
  externalLink?: boolean; // Flag for external links
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
}
