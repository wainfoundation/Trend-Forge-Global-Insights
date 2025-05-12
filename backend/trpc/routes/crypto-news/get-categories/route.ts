import { publicProcedure } from '../../../trpc';
import { z } from 'zod';
import axios from 'axios';

// Mock categories for fallback
const mockCategories = [
  { id: 'bitcoin', name: 'Bitcoin' },
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'defi', name: 'DeFi' },
  { id: 'nft', name: 'NFTs' },
  { id: 'regulation', name: 'Regulation' },
  { id: 'technology', name: 'Technology' },
  { id: 'markets', name: 'Markets' },
  { id: 'altcoins', name: 'Altcoins' },
  { id: 'mining', name: 'Mining' },
  { id: 'exchanges', name: 'Exchanges' }
];

export const getCategoriesRoute = publicProcedure
  .input(
    z.object({
      lang: z.string().default('en'),
    }).optional()
  )
  .query(async ({ input }) => {
    try {
      // Prepare API request parameters
      const params = {
        lang: input?.lang || 'en',
      };
      
      // Make API request to get categories
      // Replace with your actual API endpoint and key
      const response = await axios.get('https://api.example.com/crypto-categories', {
        params,
        headers: {
          'X-API-KEY': process.env.CRYPTO_NEWS_API_KEY || 'demo-api-key'
        }
      });
      
      // Process and return the data
      return {
        categories: response.data.categories || mockCategories,
      };
    } catch (error) {
      console.error('Error fetching crypto categories:', error);
      
      // Return mock data as fallback
      return {
        categories: mockCategories,
      };
    }
  });
