import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error(
    'Falta NEXT_PUBLIC_SUPABASE_URL'
  )
}

if (!supabaseSecretKey) {
  throw new Error(
    'Falta SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY'
  )
}

/*
  Diagnóstico seguro y temporal.

  No muestra la clave completa.
  Solo indica:
  - qué variable fue encontrada;
  - qué clase de prefijo tiene;
  - cuántos caracteres contiene.
*/

const keySource =
  process.env.SUPABASE_SECRET_KEY
    ? 'SUPABASE_SECRET_KEY'
    : 'SUPABASE_SERVICE_ROLE_KEY'

const keyType =
  supabaseSecretKey.startsWith('sb_secret_')
    ? 'sb_secret'
    : supabaseSecretKey.startsWith('eyJ')
      ? 'legacy_service_role_o_anon'
      : supabaseSecretKey.startsWith('sk_live_')
        ? 'sk_live'
        : 'desconocido'

console.log('Configuración de Supabase Admin:', {
  keySource,
  keyType,
  keyLength: supabaseSecretKey.length,
  urlProjectRef:
    supabaseUrl.match(
      /^https:\/\/([^.]+)\.supabase\.co/
    )?.[1] ?? 'no_identificado',
})

export const supabaseAdmin =
  createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )