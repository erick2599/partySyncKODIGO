'use client'

import { useState, useTransition } from 'react'
import { signup } from '../actions'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)

    // startTransition maneja el estado de carga de la Server Action
    startTransition(async () => {
      const result = await signup(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-900">Crear cuenta en PartySync</h2>
        
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input
              name="fullName"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Celular (WhatsApp)</label>
            <input
              name="phoneNumber"
              type="tel"
              placeholder="+50370000000"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-indigo-600 p-2.5 font-semibold text-white hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isPending ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  )
}
