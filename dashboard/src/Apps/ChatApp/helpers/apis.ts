import { Auth, SMS } from "./DataContext";

const AUTH_PATH = "https://atiye.space/dashboard/api/auth.php";
const SMS_PATH = "https://atiye.space/dashboard/api/sms.php";

export async function api_createSession(name: string): Promise<Auth | null> {
  const apiUrl = AUTH_PATH;
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

    return data as Auth;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}
export async function api_refreshSession(
  refreshToken: string
): Promise<Auth | null> {
  const apiUrl = AUTH_PATH;
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

    return data as Auth;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function api_sendSMS(
  to_user: string,
  content: string,
  token: string
): Promise<string | null> {
  const apiUrl = SMS_PATH;
  const payload = {
    to_user,
    content,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

    return data;
  } catch (error) {
    console.error("Error sending sms:", error);
    return null;
  }
}

export async function api_getSMS(
  last_sms: number = 0,
  token: string
): Promise<SMS[] | null> {
  const apiUrl = `${SMS_PATH}?last_id=${last_sms}`; // Include the last_id parameter in the URL

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData.error}`
      );
    }

    const data = await response.json();

    return data as SMS[];
  } catch (error) {
    console.error("Error fetching SMS:", error);
    return null;
  }
}
