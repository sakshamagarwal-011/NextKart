import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let subscription;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setShop(null);
        setLoading(false);
      }
    });
    subscription = data?.subscription;

    return () => subscription?.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    if (!supabase) return setLoading(false);
    try {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('id', userId).single();
      if (error && error.code !== 'PGRST116') throw error;
      let profileData = data;

      // If no profile exists (e.g., first-time Google login), create one automatically
      if (!profileData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const newProfile = {
            id: userId,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            role: 'customer',
          };
          const { error: insertError } = await supabase.from('profiles').insert(newProfile);
          if (!insertError) profileData = newProfile;
        }
      }

      setProfile(profileData);

      if (profileData?.role === 'shopkeeper') {
        const { data: shopData } = await supabase
          .from('shops').select('*').eq('owner_id', userId).single();
        setShop(shopData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signUp({ email, password, fullName, phone, area, role }) {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles').insert({ id: data.user.id, full_name: fullName, phone, email, area, role });
        if (profileError) throw profileError;

        if (role === 'shopkeeper') {
          const { error: shopError } = await supabase
            .from('shops').insert({ owner_id: data.user.id, name: `${fullName}'s Shop`, area, phone });
          if (shopError) throw shopError;
        }

        await fetchProfile(data.user.id);
        toast.success('Account created successfully! 🎉');
      }
      return { data, error: null };
    } catch (error) {
      toast.error(error.message);
      return { data: null, error };
    }
  }

  async function signIn({ email, password }) {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back! 👋');
      return { data, error: null };
    } catch (error) {
      toast.error(error.message);
      return { data: null, error };
    }
  }

  async function signInWithGoogle() {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setUser(null); setProfile(null); setShop(null);
    toast.success('Signed out successfully');
  }

  async function updateProfile(updates) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;
      setProfile(prev => ({ ...prev, ...updates }));
      toast.success('Profile updated! ✅');
    } catch (error) { toast.error(error.message); }
  }

  async function updateShop(updates) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('shops').update(updates).eq('owner_id', user.id);
      if (error) throw error;
      setShop(prev => ({ ...prev, ...updates }));
      toast.success('Shop updated! ✅');
    } catch (error) { toast.error(error.message); }
  }

  async function becomeShopkeeper(shopName) {
    if (!supabase) return;
    try {
      await supabase.from('profiles').update({ role: 'shopkeeper' }).eq('id', user.id);
      const { error } = await supabase.from('shops').insert({
        owner_id: user.id, name: shopName, area: profile.area, phone: profile.phone,
      });
      if (error) throw error;
      await fetchProfile(user.id);
      toast.success('You are now a shopkeeper! 🏪');
    } catch (error) { toast.error(error.message); }
  }

  const value = {
    user, profile, shop, loading, signUp, signIn, signInWithGoogle, signOut,
    updateProfile, updateShop, becomeShopkeeper,
    refreshProfile: () => user && fetchProfile(user.id),
    isShopkeeper: profile?.role === 'shopkeeper',
    isCustomer: profile?.role === 'customer',
    isConfigured: isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
