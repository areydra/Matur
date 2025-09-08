import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigationStore } from '../../src/store/navigationStore';
import { useUserStore } from '../../src/store/userStore';

export const useProfile = () => {
  const { userProfile, user, clearUser } = useUserStore();
  const { resetToOnboarding } = useNavigationStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      clearUser();
      resetToOnboarding();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `Last seen ${diffInHours}h ago`;
    if (diffInHours < 48) return 'Last seen yesterday';
    return `Last seen ${Math.floor(diffInHours / 24)}d ago`;
  };

  return {
    userProfile,
    user,
    isLoading,
    handleLogout,
    formatLastSeen,
  };
};