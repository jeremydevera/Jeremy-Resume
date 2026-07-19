export interface ApiError {
  status: number;
  message: string;
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: "same-origin",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (data && typeof data === "object" && data.error) || res.statusText;
    throw { status: res.status, message } as ApiError;
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body === undefined ? undefined : JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: async (file: File, prefix?: string): Promise<{ key: string; url: string }> => {
    const fd = new FormData();
    fd.append("file", file);
    if (prefix) fd.append("prefix", prefix);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      credentials: "same-origin",
    });
    if (!res.ok) throw { status: res.status, message: "Upload failed" } as ApiError;
    return res.json();
  },
};
