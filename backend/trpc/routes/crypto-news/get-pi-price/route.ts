import { publicProcedure } from '../../../trpc';
import axios from 'axios';

// Define the Pi price data interface
interface PiPriceData {
  price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  last_updated: string;
}

// Export the procedure
export const getPiPriceProcedure = publicProcedure
  .query(async () => {
    try {
      // API key from environment variables
      const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
      
      // Use CoinGecko API to fetch Pi Network price data
      const apiUrl = 'https://api.coingecko.com/api/v3/coins/pi-network';
      const headers = COINGECKO_API_KEY ? { 'x-cg-pro-api-key': COINGECKO_API_KEY } : {};
      
      const response = await axios.get(apiUrl, {
        headers,
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
        }
      });
      
      if (response.data && response.data.market_data) {
        const marketData = response.data.market_data;
        
        const priceData: PiPriceData = {
          price: marketData.current_price.usd,
          price_change_24h: marketData.price_change_24h,
          price_change_percentage_24h: marketData.price_change_percentage_24h,
          market_cap: marketData.market_cap.usd,
          total_volume: marketData.total_volume.usd,
          last_updated: marketData.last_updated,
        };
        
        return {
          success: true,
          data: priceData,
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error('Invalid response from CoinGecko API');
      }
    } catch (error) {
      console.error('Error fetching Pi price:', error);
      
      // Return mock data as fallback
      const mockPriceData: PiPriceData = {
        price: 0.00032156,
        price_change_24h: 0.00000215,
        price_change_percentage_24h: 0.67,
        market_cap: 5234567,
        total_volume: 1234567,
        last_updated: new Date().toISOString(),
      };
      
      return {
        success: true,
        data: mockPriceData,
        timestamp: new Date().toISOString(),
        isMock: true,
      };
    }
  });
