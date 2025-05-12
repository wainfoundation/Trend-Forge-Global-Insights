import axios from 'axios';

// Define the news item type
export interface NewsItem {
  id: string;
  title: string;
  body: string;
  imageUrl: string;
  url: string;
  source: string;
  publishedOn: string;
  categories: string[];
  author: string;
}

// Define the API response type
interface CryptoNewsResponse {
  success: boolean;
  news: NewsItem[];
  timestamp: string;
}

interface CategoriesResponse {
  success: boolean;
  categories: {
    id: string;
    name: string;
    parentId: string | null;
  }[];
  timestamp: string;
}

// Define the Pi price data interface
export interface PiPriceData {
  price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  last_updated: string;
}

// Base URL for API requests
const API_BASE_URL = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || '';

// Function to fetch latest news
export const fetchLatestNews = async (limit: number = 10, lang: string = 'EN'): Promise<NewsItem[]> => {
  try {
    const response = await axios.get<CryptoNewsResponse>(
      `${API_BASE_URL}/api/crypto-news/latest?limit=${limit}&lang=${lang}`
    );
    
    if (response.data && response.data.success) {
      return response.data.news;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
};

// Function to fetch news by category
export const fetchNewsByCategory = async (
  category: string,
  limit: number = 10,
  lang: string = 'EN'
): Promise<NewsItem[]> => {
  try {
    const response = await axios.get<CryptoNewsResponse>(
      `${API_BASE_URL}/api/crypto-news/category/${category}?limit=${limit}&lang=${lang}`
    );
    
    if (response.data && response.data.success) {
      return response.data.news;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching news for category ${category}:`, error);
    return [];
  }
};

// Function to fetch available categories
export const fetchCategories = async (): Promise<{ id: string; name: string; parentId: string | null }[]> => {
  try {
    const response = await axios.get<CategoriesResponse>(
      `${API_BASE_URL}/api/crypto-news/categories`
    );
    
    if (response.data && response.data.success) {
      return response.data.categories;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Function to search news
export const searchNews = async (
  query: string,
  limit: number = 10,
  lang: string = 'EN'
): Promise<NewsItem[]> => {
  try {
    const response = await axios.get<CryptoNewsResponse>(
      `${API_BASE_URL}/api/crypto-news/search?query=${encodeURIComponent(query)}&limit=${limit}&lang=${lang}`
    );
    
    if (response.data && response.data.success) {
      return response.data.news;
    }
    
    return [];
  } catch (error) {
    console.error(`Error searching news for query ${query}:`, error);
    return [];
  }
};

// Function to fetch Pi Network price data from CoinGecko
export const fetchPiPrice = async (): Promise<PiPriceData> => {
  try {
    // First try to use our backend endpoint if available
    try {
      const response = await axios.get(`${API_BASE_URL}/api/crypto-news/pi-price`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (backendError) {
      console.log('Backend Pi price endpoint not available, falling back to direct API call');
    }
    
    // Fallback to direct CoinGecko API call
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/pi-network?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false'
    );
    
    if (response.data && response.data.market_data) {
      const marketData = response.data.market_data;
      
      return {
        price: marketData.current_price.usd,
        price_change_24h: marketData.price_change_24h,
        price_change_percentage_24h: marketData.price_change_percentage_24h,
        market_cap: marketData.market_cap.usd,
        total_volume: marketData.total_volume.usd,
        last_updated: marketData.last_updated,
      };
    }
    
    throw new Error('Invalid response from CoinGecko API');
  } catch (error) {
    console.error('Error fetching Pi price:', error);
    
    // Return mock data as fallback
    return {
      price: 0.00032156,
      price_change_24h: 0.00000215,
      price_change_percentage_24h: 0.67,
      market_cap: 5234567,
      total_volume: 1234567,
      last_updated: new Date().toISOString(),
    };
  }
};

// Function to fetch mock news data for development
export const fetchMockNews = (limit: number = 10): NewsItem[] => {
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'Bitcoin Surges Past $60,000 as Institutional Adoption Grows',
      body: 'Bitcoin has surpassed the $60,000 mark for the first time in months as institutional investors continue to show interest in the cryptocurrency.',
      imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      url: 'https://example.com/bitcoin-surge',
      source: 'Crypto News',
      publishedOn: new Date().toISOString(),
      categories: ['Bitcoin', 'Markets'],
      author: 'John Doe',
    },
    {
      id: '2',
      title: 'Ethereum 2.0 Upgrade Set to Launch Next Month',
      body: 'The long-awaited Ethereum 2.0 upgrade is scheduled to launch next month, promising improved scalability and reduced energy consumption.',
      imageUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      url: 'https://example.com/ethereum-upgrade',
      source: 'Blockchain Times',
      publishedOn: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      categories: ['Ethereum', 'Technology'],
      author: 'Jane Smith',
    },
    {
      id: '3',
      title: 'Pi Network Announces Major Partnership with Global Payment Provider',
      body: 'Pi Network has announced a strategic partnership with a major global payment provider, potentially accelerating mainstream adoption of the Pi cryptocurrency.',
      imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      url: 'https://example.com/pi-network-partnership',
      source: 'Pi News',
      publishedOn: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      categories: ['Pi Network', 'Partnerships'],
      author: 'Alex Johnson',
    },
    {
      id: '4',
      title: 'Regulatory Clarity Coming for Crypto Industry, Says SEC Commissioner',
      body: 'An SEC Commissioner has indicated that clearer regulations for the cryptocurrency industry are on the horizon, potentially providing much-needed guidance for businesses and investors.',
      imageUrl: 'https://images.unsplash.com/photo-1621504450181-5fdb1eaeb4c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      url: 'https://example.com/crypto-regulations',
      source: 'Regulatory Watch',
      publishedOn: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      categories: ['Regulation', 'Government'],
      author: 'Sarah Williams',
    },
    {
      id: '5',
      title: 'NFT Market Shows Signs of Recovery After Months of Decline',
      body: 'The NFT market is showing signs of recovery after months of declining sales, with several high-profile collections seeing renewed interest and higher floor prices.',
      imageUrl: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      url: 'https://example.com/nft-recovery',
      source: 'NFT Insider',
      publishedOn: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      categories: ['NFTs', 'Markets'],
      author: 'Michael Brown',
    },
  ];
  
  // Generate additional mock news items if needed
  if (limit > mockNews.length) {
    const additionalItems = limit - mockNews.length;
    for (let i = 0; i < additionalItems; i++) {
      const id = (mockNews.length + i + 1).toString();
      mockNews.push({
        id,
        title: `Crypto News Headline ${id}`,
        body: `This is a mock news article ${id} for development purposes. It contains placeholder text to simulate a real news article.`,
        imageUrl: `https://images.unsplash.com/photo-${1620000000 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`,
        url: `https://example.com/article-${id}`,
        source: 'Mock News',
        publishedOn: new Date(Date.now() - (432000000 + i * 86400000)).toISOString(), // 5+ days ago
        categories: ['Cryptocurrency', 'Development'],
        author: 'Mock Author',
      });
    }
  }
  
  return mockNews.slice(0, limit);
};

// Function to fetch mock categories for development
export const fetchMockCategories = (): { id: string; name: string; parentId: string | null }[] => {
  return [
    { id: 'BTC', name: 'Bitcoin', parentId: null },
    { id: 'ETH', name: 'Ethereum', parentId: null },
    { id: 'PI', name: 'Pi Network', parentId: null },
    { id: 'NFT', name: 'NFTs', parentId: null },
    { id: 'DEFI', name: 'DeFi', parentId: null },
    { id: 'REG', name: 'Regulation', parentId: null },
    { id: 'TECH', name: 'Technology', parentId: null },
    { id: 'MARKET', name: 'Markets', parentId: null },
    { id: 'MINING', name: 'Mining', parentId: null },
    { id: 'ADOPTION', name: 'Adoption', parentId: null },
  ];
};
