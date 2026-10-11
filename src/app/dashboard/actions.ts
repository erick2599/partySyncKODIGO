'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Crea un grupo nuevo con un código de invitación aleatorio de 6 dígitos
 */
export async function createGroup(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('groupName') as string

  if (!name || name.trim() === '') {
    return { error: 'El nombre del grupo es obligatorio.' }
  }

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // Generar un código alfanumérico simple de 6 caracteres
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  // 1. Insertar el grupo con su código único
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert([{ name, created_by: user.id, invite_code: inviteCode }])
    .select()
    .single()

  if (groupError) return { error: groupError.message }

  // 2. Añadir al creador a la tabla de miembros como admin
  const { error: memberError } = await supabase
    .from('group_members')
    .insert([{ group_id: group.id, user_id: user.id, role: 'admin' }])

  if (memberError) return { error: memberError.message }

  revalidatePath('/dashboard')
}

/**
 * Permite a un amigo unirse usando el código del grupo
 */
export async function joinGroup(formData: FormData) {
  const supabase = await createClient()
  const inviteCode = (formData.get('inviteCode') as string)?.trim().toUpperCase()

  if (!inviteCode) {
    return { error: 'Debes ingresar un código válido.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // 1. Buscar el grupo que tenga ese código
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('invite_code', inviteCode)
    .single()

  if (groupError || !group) {
    return { error: 'Código de invitación no encontrado.' }
  }

  // 2. Verificar si el usuario ya es miembro del grupo
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingMember) {
    return { error: 'Ya eres miembro de este grupo.' }
  }

  // 3. Añadir al nuevo miembro
  const { error: joinError } = await supabase
    .from('group_members')
    .insert([{ group_id: group.id, user_id: user.id, role: 'member' }])

  if (joinError) return { error: joinError.message }

  revalidatePath('/dashboard')
}

/**
 * Agenda un cumpleaños dentro de un grupo
 */
export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  
  const groupId = formData.get('groupId') as string
  const birthdayBoyName = formData.get('birthdayBoyName') as string
  const eventDate = formData.get('eventDate') as string
  const location = formData.get('location') as string

  if (!groupId || !birthdayBoyName || !eventDate) {
    return { error: 'Faltan campos obligatorios.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('events')
    .insert([
      {
        group_id: groupId,
        birthday_boy_name: birthdayBoyName,
        event_date: eventDate,
        location,
        created_by: user.id,
      },
    ])

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
}
