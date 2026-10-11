import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 px-4 text-white">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight">
          🎉 PartySync
        </h1>
        <p className="text-lg text-indigo-100">
          La forma más fácil de organizar y agendar los cumpleaños de tu grupo de amigos con invitaciones directas a WhatsApp.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="rounded-xl bg-white px-6 py-3 font-bold text-indigo-600 shadow-lg hover:bg-indigo-50 transition text-center"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-indigo-700 bg-opacity-50 border border-indigo-300 px-6 py-3 font-bold text-white hover:bg-opacity-70 transition text-center"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
