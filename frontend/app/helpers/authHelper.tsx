export async function authFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    url,
    {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    localStorage.removeItem("token");

    window.location.href = "/auth";

    throw new Error("UNAUTHORIZED");
  }

  return response;
}