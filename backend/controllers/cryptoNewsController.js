const axios = require('axios');
require('dotenv').config();

// API key from environment variables
const API_KEY = process.env.CRYPTOCOMPARE_API_KEY || '';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';

// Get latest crypto news
exports.getLatestNews = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const lang = req.query.lang || 'EN';
    
    const response = await axios.get(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=${lang}&api_key=${API_KEY}&limit=${limit}`
    );
    
    if (response.data && response.data.Data) {
      // Transform the data to a more usable format
      const news = response.data.Data.map(item => ({
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
      
      res.status(200).json({
        success: true,
        news,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error('Invalid response from CryptoCompare API');
    }
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crypto news',
      message: error.message,
    });
  }
};

// Get news by category
exports.getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = req.query.limit || 10;
    const lang = req.query.lang || 'EN';
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category parameter is required',
      });
    }
    
    const response = await axios.get(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=${lang}&api_key=${API_KEY}&categories=${category}&limit=${limit}`
    );
    
    if (response.data && response.data.Data) {
      // Transform the data to a more usable format
      const news = response.data.Data.map(item => ({
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
      
      res.status(200).json({
        success: true,
        category,
        news,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error('Invalid response from CryptoCompare API');
    }
  } catch (error) {
    console.error('Error fetching crypto news by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crypto news by category',
      message: error.message,
    });
  }
};

// Get available categories
exports.getCategories = async (req, res) => {
  try {
    const response = await axios.get(
      `https://min-api.cryptocompare.com/data/news/categories?api_key=${API_KEY}`
    );
    
    if (response.data && response.data.Data) {
      // Transform the data to a more usable format
      const categories = Object.entries(response.data.Data).map(([key, value]) => ({
        id: key,
        name: value.categoryName,
        parentId: value.parentCategory || null,
      }));
      
      res.status(200).json({
        success: true,
        categories,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error('Invalid response from CryptoCompare API');
    }
  } catch (error) {
    console.error('Error fetching crypto categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crypto categories',
      message: error.message,
    });
  }
};

// Search news by term
exports.searchNews = async (req, res) => {
  try {
    const { query } = req.query;
    const limit = req.query.limit || 10;
    const lang = req.query.lang || 'EN';
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }
    
    // CryptoCompare doesn't have a direct search endpoint, so we fetch all news and filter
    const response = await axios.get(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=${lang}&api_key=${API_KEY}&limit=100`
    );
    
    if (response.data && response.data.Data) {
      // Filter news by search term
      const filteredNews = response.data.Data.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.body.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
      
      // Transform the data to a more usable format
      const news = filteredNews.map(item => ({
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
      
      res.status(200).json({
        success: true,
        query,
        news,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error('Invalid response from CryptoCompare API');
    }
  } catch (error) {
    console.error('Error searching crypto news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search crypto news',
      message: error.message,
    });
  }
};

// Get Pi Network price data
exports.getPiPrice = async (req, res) => {
  try {
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
      
      const priceData = {
        price: marketData.current_price.usd,
        price_change_24h: marketData.price_change_24h,
        price_change_percentage_24h: marketData.price_change_percentage_24h,
        market_cap: marketData.market_cap.usd,
        total_volume: marketData.total_volume.usd,
        last_updated: marketData.last_updated,
      };
      
      res.status(200).json({
        success: true,
        data: priceData,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error('Invalid response from CoinGecko API');
    }
  } catch (error) {
    console.error('Error fetching Pi price:', error);
    
    // Return mock data as fallback
    const mockPriceData = {
      price: 0.00032156,
      price_change_24h: 0.00000215,
      price_change_percentage_24h: 0.67,
      market_cap: 5234567,
      total_volume: 1234567,
      last_updated: new Date().toISOString(),
    };
    
    // Still return 200 with mock data to prevent app crashes
    res.status(200).json({
      success: true,
      data: mockPriceData,
      timestamp: new Date().toISOString(),
      isMock: true,
    });
  }
};
