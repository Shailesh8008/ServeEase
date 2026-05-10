const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ?? "";

export const apiUrl = (path: string) => `${backendUrl}${path}`;
