import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChange, signOut } from '@/utils/firebase';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Define user role type
type UserRole = 'user' | 'journalist' | 'admin';

// Define subscription status type
type SubscriptionStatus = 'active' | 'expired' | 'none';

// Define subscription plan type
type SubscriptionPlan = 'free' | 'basic' | 'premium';

// Define security settings type
interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string | null;
  loginAttempts: number;
  lastLoginAttempt: string | null;
}

// Define watched ad record type
interface WatchedAd {
  articleId: string;
  timestamp: string;
}

// Define auth store state
interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  id: string | null;
  role: UserRole | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndDate: string | null;
  articleReadCount: number;
  watchedAds: WatchedAd[];
  user: {
    id: string;
    username: string;
    role: UserRole;
  } | null;
  token: string | null;
  securitySettings: SecuritySettings | null;
  lastSync: string | null;
  
  // Actions
  setUser: (username: string, id: string, role: UserRole, token?: string) => void;
  clearUser: () => void;
  listenToAuthChanges: () => void;
  incrementArticleCount: () => void;
  resetArticleReadCount: () => void;
  setSubscription: (plan: SubscriptionPlan) => void;
  renewSubscription: (plan: SubscriptionPlan) => void;
  checkSubscriptionExpiration: () => void;
  setToken: (token: string) => void;
  clearToken: () => void;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  syncWithServer: () => Promise<void>;
  hasReachedArticleLimit: () => boolean;
  hasWatchedAdForArticle: (articleId: string) => boolean;
  markAdWatched: (articleId: string) => void;
  isSubscribed: () => boolean;
}

// Create secure storage for sensitive data
const createSecureStorage = () => {
  return {
    getItem: async (name: string): Promise<string | null> => {
      if (Platform.OS === 'web') {
        // Use localStorage with encryption for web
        const item = localStorage.getItem(name);
        if (!item) return null;
        
        try {
          // In a real app, you would decrypt the item here
          return item;
        } catch (e) {
          console.error('Failed to decrypt item from storage', e);
          return null;
        }
      } else {
        // Use SecureStore for native platforms
        try {
          return await SecureStore.getItemAsync(name);
        } catch (e) {
          console.error('SecureStore error', e);
          return null;
        }
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      if (Platform.OS === 'web') {
        // Use localStorage with encryption for web
        try {
          // In a real app, you would encrypt the value here
          localStorage.setItem(name, value);
        } catch (e) {
          console.error('Failed to encrypt and store item', e);
        }
      } else {
        // Use SecureStore for native platforms
        try {
          await SecureStore.setItemAsync(name, value);
        } catch (e) {
          console.error('SecureStore error', e);
        }
      }
    },
    removeItem: async (name: string): Promise<void> => {
      if (Platform.OS === 'web') {
        localStorage.removeItem(name);
      } else {
        try {
          await SecureStore.deleteItemAsync(name);
        } catch (e) {
          console.error('SecureStore error', e);
        }
      }
    }
  };
};

// Constants
const FREE_ARTICLE_LIMIT = 5; // Number of free articles per day

// Create auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      username: null,
      id: null,
      role: null,
      subscriptionPlan: 'free',
      subscriptionStatus: 'none',
      subscriptionEndDate: null,
      articleReadCount: 0,
      watchedAds: [],
      user: null,
      token: null,
      securitySettings: null,
      lastSync: null,
      
      // Set user data
      setUser: (username, id, role, token) => {
        set({
          isAuthenticated: true,
          username,
          id,
          role,
          user: { id, username, role },
          token: token || get().token,
          lastSync: new Date().toISOString(),
        });
      },
      
      // Clear user data
      clearUser: () => {
        // Sign out from Firebase
        signOut().catch(error => console.error('Sign out error:', error));
        
        // Clear token from secure storage
        const secureStorage = createSecureStorage();
        secureStorage.removeItem('auth-token').catch(error => console.error('Token removal error:', error));
        
        // Reset state
        set({
          isAuthenticated: false,
          username: null,
          id: null,
          role: null,
          user: null,
          token: null,
          securitySettings: null,
        });
      },
      
      // Listen to auth state changes
      listenToAuthChanges: () => {
        return onAuthStateChange((user) => {
          if (user) {
            // User is signed in
            // For simplicity, we'll determine role based on email
            let role: UserRole = 'user';
            
            if (user.email?.includes('admin')) {
              role = 'admin';
            } else if (user.email?.includes('journalist')) {
              role = 'journalist';
            }
            
            set({
              isAuthenticated: true,
              username: user.email || user.uid,
              id: user.uid,
              role,
              user: {
                id: user.uid,
                username: user.email || user.uid,
                role,
              },
              lastSync: new Date().toISOString(),
            });
            
            // Get user token and store it securely
            user.getIdToken().then(token => {
              get().setToken(token);
            }).catch(error => {
              console.error('Error getting user token:', error);
            });
          } else {
            // User is signed out
            // We don't clear the state here to allow for persistence
            // The clearUser function should be called explicitly to sign out
          }
        });
      },
      
      // Set token
      setToken: (token) => {
        // Store token in secure storage
        const secureStorage = createSecureStorage();
        secureStorage.setItem('auth-token', token).catch(error => {
          console.error('Token storage error:', error);
        });
        
        set({ token });
      },
      
      // Clear token
      clearToken: () => {
        // Remove token from secure storage
        const secureStorage = createSecureStorage();
        secureStorage.removeItem('auth-token').catch(error => {
          console.error('Token removal error:', error);
        });
        
        set({ token: null });
      },
      
      // Increment article read count
      incrementArticleCount: () => {
        set(state => ({
          articleReadCount: state.articleReadCount + 1,
        }));
      },
      
      // Reset article read count
      resetArticleReadCount: () => {
        set({ articleReadCount: 0 });
      },
      
      // Set subscription
      setSubscription: (plan) => {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
        
        set({
          subscriptionPlan: plan,
          subscriptionStatus: plan === 'free' ? 'none' : 'active',
          subscriptionEndDate: plan === 'free' ? null : endDate.toISOString(),
        });
      },
      
      // Renew subscription
      renewSubscription: (plan) => {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
        
        set({
          subscriptionPlan: plan,
          subscriptionStatus: 'active',
          subscriptionEndDate: endDate.toISOString(),
        });
      },
      
      // Check subscription expiration
      checkSubscriptionExpiration: () => {
        const { subscriptionEndDate, subscriptionStatus } = get();
        
        if (subscriptionEndDate && subscriptionStatus === 'active') {
          const endDate = new Date(subscriptionEndDate);
          const now = new Date();
          
          if (endDate < now) {
            set({ subscriptionStatus: 'expired' });
          }
        }
      },
      
      // Update security settings
      updateSecuritySettings: (settings) => {
        set(state => {
          // Create a new security settings object that merges the existing settings with the updates
          const updatedSettings: SecuritySettings = state.securitySettings 
            ? { 
                ...state.securitySettings, 
                ...settings 
              }
            : {
                twoFactorEnabled: settings.twoFactorEnabled ?? false,
                lastPasswordChange: settings.lastPasswordChange ?? null,
                loginAttempts: settings.loginAttempts ?? 0,
                lastLoginAttempt: settings.lastLoginAttempt ?? null
              };
          
          // Return a partial state update with the new security settings
          return { securitySettings: updatedSettings };
        });
      },
      
      // Sync with server
      syncWithServer: async () => {
        try {
          const { token, id } = get();
          
          if (!token || !id) {
            console.log('No token or user ID available for sync');
            return;
          }
          
          // Make API request to sync user data
          const response = await fetch('/api/user/sync', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to sync with server');
          }
          
          const userData = await response.json();
          
          // Update local state with server data
          set({
            subscriptionPlan: userData.subscriptionPlan || get().subscriptionPlan,
            subscriptionStatus: userData.subscriptionStatus || get().subscriptionStatus,
            subscriptionEndDate: userData.subscriptionEndDate || get().subscriptionEndDate,
            role: userData.role || get().role,
            securitySettings: userData.securitySettings || get().securitySettings,
            lastSync: new Date().toISOString(),
          });
          
          console.log('Synced user data with server');
        } catch (error) {
          console.error('Error syncing with server:', error);
        }
      },
      
      // Check if user has reached the article limit
      hasReachedArticleLimit: () => {
        const { articleReadCount, subscriptionPlan } = get();
        
        // Only free users have article limits
        if (subscriptionPlan !== 'free') {
          return false;
        }
        
        return articleReadCount >= FREE_ARTICLE_LIMIT;
      },
      
      // Check if user has watched an ad for a specific article
      hasWatchedAdForArticle: (articleId) => {
        const { watchedAds } = get();
        
        if (!watchedAds || !Array.isArray(watchedAds)) {
          return false;
        }
        
        return watchedAds.some(ad => ad.articleId === articleId);
      },
      
      // Mark an article as having had an ad watched
      markAdWatched: (articleId) => {
        set(state => {
          const watchedAds = state.watchedAds || [];
          
          // Check if this article already has a watched ad
          if (watchedAds.some(ad => ad.articleId === articleId)) {
            return state; // No change needed
          }
          
          // Add the new watched ad
          return {
            watchedAds: [
              ...watchedAds,
              {
                articleId,
                timestamp: new Date().toISOString(),
              }
            ]
          };
        });
      },
      
      // Check if user has an active subscription
      isSubscribed: () => {
        const { subscriptionPlan, subscriptionStatus } = get();
        return (subscriptionPlan === 'basic' || subscriptionPlan === 'premium') && 
               subscriptionStatus === 'active';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        username: state.username,
        id: state.id,
        role: state.role,
        subscriptionPlan: state.subscriptionPlan,
        subscriptionStatus: state.subscriptionStatus,
        subscriptionEndDate: state.subscriptionEndDate,
        articleReadCount: state.articleReadCount,
        watchedAds: state.watchedAds,
        user: state.user,
        lastSync: state.lastSync,
        // Don't persist token or security settings
      }),
    }
  )
);
