'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Server Action para el Registro de Usuarios (Sign Up)
 */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  // 1. Extracción y validación básica de datos en el servidor
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phoneNumber = formData.get('phoneNumber') as string

  if (!email || !password || !fullName || !phoneNumber) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  // 2. Registro en Supabase pasando los datos adicionales a las cookies/metadata
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
      },
    },
  })

  // 3. Manejo seguro de errores
  if (error) {
    return { error: error.message }
  }

  // Redirección exitosa (Si tienes la verificación de email activada, irá a una página informativa)
  redirect('/dashboard')
}

/**
 * Server Action para el Inicio de Sesión (Sign In)
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'El correo y la contraseña son obligatorios.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Credenciales incorrectas o error de autenticación.' }
  }

  redirect('/dashboard')
}

/**
 * Server Action para el Cierre de Sesión (Sign Out)
 */
export async function signout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: 'No se pudo cerrar la sesión correctamente.' }
  }

  redirect('/login')
}
