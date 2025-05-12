import { z } from 'zod';
import { publicProcedure } from '../../../trpc';
import axios from 'axios';

// Define the schema for the input
const inputSchema = z.object({
  limit: z.number().optional().default(10),
  category: z.string().optional(),
  lang: z.string().optional().default('EN'),
});

// Define the news item type
interface NewsItem {
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

// Export the procedure
export const getNewsProcedure = publicProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    try {
      const { limit, category, lang } = input;
      
      // API key from environment variables
      const API_KEY = process.env.CRYPTOCOMPARE_API_KEY || '';
      
      // Build the URL based on whether a category is provided
      let url = `https://min-api.cryptocompare.com/data/v2/news/?lang=${lang}&api_key=${API_KEY}&limit=${limit}`;
      
      if (category) {
        url += `&categories=${category}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data && response.data.Data) {
        // Transform the data to a more usable format
        const news: NewsItem[] = response.data.Data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          body: item.body,
          imageUrl: item.imageurl,
          url: item.url,
          source: item.source_info?.name || item.source,
          publishedOn: new Date(item.published_on * 1000).toISOString(),
          categories: item.categories ? item.categories.split('|') : [],
          author: item.author || 'Unknown',
        }));
        
        return {
          success: true,
          news,
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error('Invalid response from CryptoCompare API');
      }
    } catch (error) {
      console.error('Error fetching crypto news:', error);
      
      // Return mock data as fallback
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
      ];
      
      return {
        success: true,
        news: mockNews.slice(0, input.limit),
        timestamp: new Date().toISOString(),
        isMock: true,
      };
    }
  });
