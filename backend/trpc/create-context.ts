import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'journalist' | 'public';
}

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  async function getUserFromHeader(): Promise<User | null> {
    // For development, you can return a mock user
    if (process.env.NODE_ENV === 'development') {
      return {
        id: 'mock-user-id',
        name: 'Mock User',
        email: 'mock@example.com',
        role: 'public',
      };
    }
    
    // In production, you would verify the auth token
    // and fetch the user from your database
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return null;
    }
    
    try {
      // This is a placeholder for actual token verification
      // You would use your auth service here (Firebase, Auth0, etc.)
      const token = authHeader.split(' ')[1];
      if (!token) {
        return null;
      }
      
      // Mock user for now - in production, decode the token and fetch user data
      return {
        id: 'user-id-from-token',
        name: 'Authenticated User',
        email: 'user@example.com',
        role: 'public',
      };
    } catch (error) {
      console.error('Error verifying auth token:', error);
      return null;
    }
  }
  
  const user = await getUserFromHeader();
  
  return {
    req,
    resHeaders,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
