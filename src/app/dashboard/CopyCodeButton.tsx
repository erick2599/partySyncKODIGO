'use client'

import { useState } from 'react'

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar: ', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`ml-2 rounded px-2.5 py-1 font-mono text-xs font-bold transition-all active:scale-95 ${
        copied 
          ? 'bg-green-500 text-white animate-pulse' 
          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
      }`}
    >
      {copied ? '¡Copiado! ✓' : code}
    </button>
  )
}
