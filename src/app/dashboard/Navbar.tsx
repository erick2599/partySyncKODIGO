'use client'

import { signout } from '../(auth)/actions'
import Link from 'next/link'

interface NavbarProps {
  displayName: string
  activeTab: string
}

export default function Navbar({ displayName, activeTab }: NavbarProps) {
  // Estilo adaptado para las pestañas (idéntico al estilo limpio de tu panel)
  const tabStyle = (tabName: string) => 
    `relative px-4 py-2 text-xs sm:text-sm font-bold tracking-wide rounded-xl transition-all duration-200 ${
      activeTab === tabName 
        ? 'bg-purple-100 text-purple-700 shadow-sm' 
        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
    }`

  return (
    <nav className="w-full bg-white border border-gray-100/80 rounded-2xl p-4 shadow-sm mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      
      {/* Izquierda: Logotipo */}
      <div className="flex items-center gap-2 justify-center sm:justify-start">
        <span className="text-xl">🎉</span>
        <span className="font-extrabold text-lg text-gray-900 tracking-tight">
          PartySync
        </span>
      </div>

      {/* Centro: Pestañas con estilo claro */}
      <div className="flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-100 rounded-2xl p-1 max-w-fit mx-auto sm:mx-0">
        <Link href="/dashboard" className={tabStyle('todos')}>
          Todos
        </Link>
        <Link href="/dashboard?tab=grupos" className={tabStyle('grupos')}>
          Grupos
        </Link>
        <Link href="/dashboard?tab=cumpleanos" className={tabStyle('cumpleanos')}>
          Eventos
        </Link>
      </div>

      {/* Derecha: Info de Usuario y Botón de Salida */}
      <div className="flex items-center justify-center sm:justify-end gap-4">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-[10px] text-purple-600 font-extrabold uppercase tracking-wider">Crew Member</span>
          <span className="text-xs font-bold text-gray-800">{displayName}</span>
        </div>
        
        <div className="w-[1px] h-6 bg-gray-200 hidden md:block"></div>

        <form action={signout}>
          <button 
            type="submit" 
            className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-red-100 hover:bg-red-600 transition-all duration-200 active:scale-95"
          >
            Cerrar Sesión 🚪
          </button>
        </form>
      </div>

    </nav>
  )
}
