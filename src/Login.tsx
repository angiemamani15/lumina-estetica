
import { useState } from "react";
import type { FormEvent } from "react";

type LoginProps = {
  onLogin: () => void;
};

function Login({ onLogin }: LoginProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function ingresar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Acceso de demostración para el proyecto académico
    if (usuario === "admin" && password === "Lumina2026") {
      setError("");
      onLogin();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EDE4D8] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#E8D9CA] bg-[#FAF7F2] px-6 py-9 shadow-xl sm:px-10">

        {/* LOGO PERSONALIZADO */}
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src="/log.jpg"
            alt="Logo de Lúmina Estética"
            className="mb-5 h-36 w-36 rounded-2xl border border-[#E8D9CA] bg-white object-contain p-2 shadow-sm sm:h-40 sm:w-40"
          />

          <h1 className="font-serif text-3xl font-semibold text-[#594638]">
            Lúmina
          </h1>

          <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-[#8A7465]">
            Estética
          </p>

          <div className="my-5 h-px w-20 bg-[#D3BDA5]" />

          <h2 className="text-lg font-semibold text-[#594638]">
            Bienvenida
          </h2>

          <p className="mt-2 text-sm text-[#8A7465]">
            Ingresá tus credenciales para acceder
            al sistema de gestión.
          </p>
        </div>

        {/* FORMULARIO DE INICIO DE SESIÓN */}
        <form onSubmit={ingresar} className="space-y-5">
          <div>
            <label
              htmlFor="usuario"
              className="mb-2 block text-sm font-semibold text-[#594638]"
            >
              Usuario
            </label>

            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-xl border border-[#D3BDA5] bg-white px-4 py-3 text-[#594638] outline-none transition focus:border-[#8A7465] focus:ring-2 focus:ring-[#D8B89C]/50"
              placeholder="Ingresá tu usuario"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#594638]"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#D3BDA5] bg-white px-4 py-3 text-[#594638] outline-none transition focus:border-[#8A7465] focus:ring-2 focus:ring-[#D8B89C]/50"
              placeholder="Ingresá tu contraseña"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[#594638] py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#795548]"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#A98B76]">
          © 2026 Lúmina Estética · Sistema de Gestión
        </p>
      </div>
    </div>
  );
}

export default Login;
