import { Auth } from "./DataContext";

const AUTH_PATH = "https://atiye.space/dashboard/api/auth.php";

export async function api_createSession(name: string): Promise<Auth | null> {
  const apiUrl = AUTH_PATH; // Ensure this URL is correct and points to your PHP script
  const payload = {
    action: "create",
    user_name: name,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData.error}`
      );
    }

    const data = await response.json();
    console.log("User created successfully:", data);

    return data as Auth;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}
export async function api_refreshSession(refreshToken: string): Promise<Auth | null> {
  const apiUrl = AUTH_PATH; // Ensure this URL is correct and points to your PHP script
  const payload = {
    action: "refresh",
    refresh_token: refreshToken,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData.error}`
      );
    }

    const data = await response.json();
    console.log("User refreshed successfully:", data);

    return data as Auth;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}
