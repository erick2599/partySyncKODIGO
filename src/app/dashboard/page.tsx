

import { createClient } from '@/utils/supabase/server'
import { createGroup, createEvent, joinGroup } from './actions'
import { signout } from '../(auth)/actions'
import { Suspense } from 'react'
import CopyCodeButton from './CopyCodeButton'
import Navbar from './Navbar'

//export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const activeTab = resolvedParams.tab || 'todos'

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 text-gray-900">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500">Cargando PartySync... 🎈</p>
        </div>
      </div>
    }>
      <DashboardContent activeTab={activeTab} />
    </Suspense>
  )
}

async function DashboardContent({ activeTab }: { activeTab: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 text-gray-900">
        <p className="text-sm font-semibold text-gray-500">No autorizado. Por favor inicia sesión.</p>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const displayName = profile?.full_name || user.user_metadata?.full_name || 'Invitado'

  const { data: userGroups } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, invite_code, group_members(profiles(full_name))))')
    .eq('user_id', user.id)

  const groups = userGroups?.map((g: any) => g.groups).filter(Boolean) || []
  const groupIds = groups.map((g: any) => g.id)
  let events: any[] = []
  
  if (groupIds.length > 0) {
    const { data: eventsData } = await supabase
      .from('events')
      .select('*, groups(name)')
      .in('group_id', groupIds)
      .order('event_date', { ascending: true })
    events = eventsData || []
  }

  const avatarColors = [
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700'
  ]

  const showGroups = activeTab === 'todos' || activeTab === 'grupos'
  const showEvents = activeTab === 'todos' || activeTab === 'cumpleanos'

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <Navbar displayName={displayName} activeTab={activeTab} />
        
        <header className="mb-8 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900">¡Hola, {displayName}! 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Tu central de organización y alegría para cumpleaños grupales.</p>
        </header>

        <div className={`grid gap-6 items-start ${activeTab === 'todos' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {showGroups && (
            <div className="space-y-6">
              <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">✨ Crear nuevo Grupo</h2>
                <form action={createGroup} className="flex gap-2">
                  <input name="groupName" type="text" placeholder="Ej. Amigos de la U" required className="w-full rounded-xl border border-gray-200 p-3 text-sm bg-gray-50/50" />
                  <button type="submit" className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-purple-700">Crear</button>
                </form>
              </section>

              <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-1">🔑 Unirte con un Código</h2>
                <p className="text-xs text-gray-400 mb-4">Ingresa el código de 6 caracteres que te compartieron.</p>
                <form action={joinGroup} className="flex gap-2">
                  <input name="inviteCode" type="text" placeholder="Ej. HQJBQ5" required maxLength={6} className="w-full rounded-xl border border-gray-200 p-3 uppercase font-mono tracking-widest bg-gray-50/50" />
                  <button type="submit" className="rounded-xl bg-gray-900 px-5 py-3 font-bold text-white shadow-sm hover:bg-gray-800">Unirme</button>
                </form>
              </section>

              <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">👥 Tus Grupos y Miembros</h2>
                {groups.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Aún no formas parte de ningún círculo.</p>
                ) : (
                  <div className="space-y-4">
                    {groups.map((g: any) => (
                      <div key={g.id} className="rounded-xl bg-gray-50/50 border border-gray-100 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800"># {g.name}</span>
                          <CopyCodeButton code={g.invite_code} />
                        </div>
                        <div className="pt-2 border-t border-gray-200/60">
                          <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Miembros:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {g.group_members?.map((m: any, idx: number) => (
                              <span key={idx} className={`inline-block text-xs font-bold px-3 py-1 rounded-full border border-gray-200/40 shadow-sm ${avatarColors[idx % avatarColors.length]}`}>
                                👤 {m.profiles?.full_name || 'Anónimo'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Agendar Cumpleaños</h2>
                <form action={createEvent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Seleccionar Grupo</label>
                    <select name="groupId" className="mt-1 w-full rounded-xl border border-gray-200 p-3 bg-white text-sm">
                      {groups.map((g: any) => (<option key={g.id} value={g.id}>{g.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Nombre del cumpleañero/a</label>
                    <input name="birthdayBoyName" type="text" placeholder="Ej. Erick Gaitan" required className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Fecha del Evento</label>
                      <input name="eventDate" type="date" required className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-700 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Lugar</label>
                      <input name="location" type="text" placeholder="Ej. La esquina" className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" />
                    </div>
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-emerald-600 p-3.5 font-bold text-white shadow-md hover:bg-emerald-700">💾 Guardar en la Agenda</button>
                </form>
              </section>
            </div>
          )}

          {showEvents && (
            <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-6">🎂 Próximas Celebraciones</h2>
              {events.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <span className="text-3xl block mb-2 animate-bounce">🎁</span>
                  <p className="text-xs text-gray-400 font-bold uppercase">No hay fiestas registradas aún.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => {
                    const whatsappText = encodeURIComponent(`🎉 ¡Invitación de Fiesta! 🎉\n\nVamos a celebrar el cumpleaños de *${event.birthday_boy_name}* del grupo *${event.groups.name}*.\n📅 Fecha: ${event.event_date}\n📍 Lugar: ${event.location || 'Por confirmar'}\n\n¡No falten! 🥳`)
                    return (
                      <div key={event.id} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/30 p-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center hover:shadow-sm">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                        <div className="space-y-1">
                          <h3 className="font-extrabold text-lg text-gray-900">🎈 {event.birthday_boy_name}</h3>
                          <p className="text-xs font-bold text-purple-600 bg-purple-50 inline-block px-2 py-0.5 rounded-md">Grupo: {event.groups.name}</p>
                          <div className="text-xs text-gray-500 space-y-0.5 pt-1">
                            <p>📅 Fecha: <span className="font-semibold text-gray-700">{event.event_date}</span></p>
                            <p>📍 Lugar: <span className="font-semibold text-gray-700">{event.location || 'Por definir'}</span></p>
                          </div>
                        </div>
                        <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:from-green-600 hover:to-emerald-700">💬 Compartir Invitación</a>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
