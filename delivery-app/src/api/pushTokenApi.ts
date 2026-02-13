import { API_CONFIG } from "../config/api";
import { authenticatedFetch } from "../utils/apiHelper";

const BASE_URL = API_CONFIG.BASE_URL;

/**
 * Register push token for the authenticated user
 * @param pushToken - Expo push token
 * @param deviceType - Device type (ios/android)
 */
export const registerPushToken = async (
  pushToken: string,
  deviceType?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await authenticatedFetch(`${BASE_URL}/push-tokens/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pushToken, deviceType }),
    });

    if (!res.ok) {
      throw new Error("Failed to register push token");
    }

    return await res.json();
  } catch (error) {
    console.error("Register push token error:", error);
    throw error;
  }
};

/**
 * Unregister push token (call on logout)
 */
export const unregisterPushToken = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const res = await authenticatedFetch(`${BASE_URL}/push-tokens/unregister`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to unregister push token");
    }

    return await res.json();
  } catch (error) {
    console.error("Unregister push token error:", error);
    throw error;
  }
};
