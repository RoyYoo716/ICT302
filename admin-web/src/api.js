import { supabaseWeb } from './SupabaseWebClient.js';

export async function secureFetch(endpoint, options = {}) {
  const { data: { session } } = await supabaseWeb.auth.getSession();
  const token = session?.access_token;

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...(options.headers || {})
    }
  });

  return response.json();
}
