import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Pulled from app.json -> expo.extra (set your real values there,
// or better: use a .env + expo-constants / EAS secrets in production).
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

if (!supabaseUrl || supabaseUrl.includes('PUT_YOUR')) {
  console.warn(
    '[supabase] Missing supabaseUrl/supabaseAnonKey — set them in app.json > expo.extra before running.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function logSupabaseError(error: unknown, context: string) {
  console.error(`Supabase Error [${context}]:`, error);
}

/**
 * Uploads a picked image (uri) to the private 'kyc-documents' bucket and
 * returns its Storage PATH (not a public URL — used with the
 * request_kyc_verification RPC, same as the web app).
 */
export async function uploadKycImageAsync(
  uri: string,
  userId: string,
  side: 'front' | 'back'
): Promise<string | null> {
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    const path = `${userId}/${Date.now()}-${side}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage.from('kyc-documents').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) throw error;
    return path;
  } catch (err) {
    logSupabaseError(err, `storage:upload:kyc-documents:${side}`);
    return null;
  }
}

/** Uploads a picked image (uri) to a public bucket and returns its public URL. */
export async function uploadImageAsync(
  bucket: 'task-images' | 'proof-images' | 'request-images',
  uri: string,
  userId: string
): Promise<string | null> {
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage.from(bucket).upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    logSupabaseError(err, `storage:upload:${bucket}`);
    return null;
  }
}
