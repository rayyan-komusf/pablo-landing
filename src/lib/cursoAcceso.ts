// Sesión de Pablo en usapablo.com para el curso de suscriptores.
//
// El curso ya no se desbloquea con nombre+correo: el visitante inicia sesión
// con su cuenta de la app (Supabase Auth, anon key pública — el mismo patrón
// del registro paso a paso del onboarding) y la edge function `curso-acceso`
// valida que su plan no sea free. Los tokens viven en localStorage de este
// dominio (usapablo.com y usapablo.app no comparten cookies).

const SUPABASE_URL = "https://mezpfnagkubumzbromsh.supabase.co";
// Anon key pública de Supabase (la misma que usa la app en el navegador).
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lenBmbmFna3VidW16YnJvbXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDM3NDMsImV4cCI6MjA3OTAxOTc0M30.HsTSJqkzslq4HWxLlIvuFwudrFzkemHELgsi54vIJDw";

const SESION_KEY = "pablo_curso_sesion";

export interface ProgresoSesion {
  sesion: string;
  segundos_vistos: number;
  completado: boolean;
  completado_at: string | null;
}

export interface CursoAcceso {
  acceso: boolean;
  plan: string | null;
  nombre: string | null;
  progreso: ProgresoSesion[];
  curso_completado: boolean;
}

type Tokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch ms
  email?: string;
};

function leerTokens(): Tokens | null {
  try {
    const t = JSON.parse(localStorage.getItem(SESION_KEY) ?? "null");
    return t?.access_token && t?.refresh_token ? (t as Tokens) : null;
  } catch {
    return null;
  }
}

function guardarTokens(data: any, email?: string) {
  try {
    localStorage.setItem(
      SESION_KEY,
      JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (Number(data.expires_in) || 3600) * 1000,
        email: email ?? data.user?.email,
      }),
    );
  } catch {
    /* modo privado: la sesión durará lo que dure la página */
  }
}

export const haySesionCurso = (): boolean => leerTokens() !== null;

export const emailSesionCurso = (): string | null => leerTokens()?.email ?? null;

export function cerrarSesionCurso() {
  try {
    localStorage.removeItem(SESION_KEY);
  } catch {
    /* nada */
  }
}

async function authFetch(path: string, body: unknown) {
  const res = await fetch(SUPABASE_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(body),
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    /* respuesta sin body */
  }
  return { ok: res.ok, data };
}

export async function loginCurso(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await authFetch("/auth/v1/token?grant_type=password", { email, password });
    if (!r.ok) {
      const msg = r.data?.error_description || r.data?.msg || r.data?.message || "";
      return {
        ok: false,
        error: /invalid|credentials/i.test(msg)
          ? "Correo o contraseña incorrectos. Es la misma cuenta con la que entras a la app de Pablo."
          : msg || "No pudimos iniciar sesión, intenta de nuevo.",
      };
    }
    guardarTokens(r.data, email);
    // Unificar identidad con la app: en PostHog el usuario es su user.id.
    try {
      const uid = r.data.user?.id;
      if (uid) (window as any).posthog?.identify?.(uid, { email });
    } catch {
      /* PostHog puede no estar cargado */
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "No pudimos conectar con el servidor. Revisa tu internet." };
  }
}

/** Access token vigente, refrescándolo si está por vencer. null = sin sesión. */
async function accessToken(): Promise<string | null> {
  const t = leerTokens();
  if (!t) return null;
  if (t.expires_at - 60_000 > Date.now()) return t.access_token;
  const r = await authFetch("/auth/v1/token?grant_type=refresh_token", {
    refresh_token: t.refresh_token,
  });
  if (!r.ok || !r.data?.access_token) {
    cerrarSesionCurso();
    return null;
  }
  guardarTokens(r.data, t.email);
  return r.data.access_token as string;
}

async function llamarCursoAcceso(body: Record<string, unknown>): Promise<any | null> {
  const token = await accessToken();
  if (!token) return null;
  try {
    const res = await fetch(SUPABASE_URL + "/functions/v1/curso-acceso", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
      // keepalive: los reportes de progreso al cerrar la pestaña sí llegan.
      keepalive: true,
    });
    if (res.status === 401) {
      cerrarSesionCurso();
      return null;
    }
    const data = await res.json().catch(() => null);
    return res.ok ? data : null;
  } catch {
    return null;
  }
}

/** null = sin sesión o error de red; con sesión devuelve acceso + progreso. */
export async function verificarAccesoCurso(curso: string): Promise<CursoAcceso | null> {
  const data = await llamarCursoAcceso({ accion: "acceso", curso });
  if (!data?.ok) return null;
  return {
    acceso: Boolean(data.acceso),
    plan: data.plan ?? null,
    nombre: data.nombre ?? null,
    progreso: (data.progreso as ProgresoSesion[]) ?? [],
    curso_completado: Boolean(data.curso_completado),
  };
}

export async function reportarProgresoCurso(
  curso: string,
  sesion: string,
  segundosVistos: number,
  completado: boolean,
): Promise<{ sesion_completada: boolean; curso_completado: boolean } | null> {
  const data = await llamarCursoAcceso({
    accion: "progreso",
    curso,
    sesion,
    segundos_vistos: Math.floor(segundosVistos),
    completado,
  });
  if (!data?.ok) return null;
  return {
    sesion_completada: Boolean(data.sesion_completada),
    curso_completado: Boolean(data.curso_completado),
  };
}
