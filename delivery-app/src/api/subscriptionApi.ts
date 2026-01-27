import { Subscription, User } from "@/src/types/auth";
import { API_CONFIG } from "../config/api";

const BASE_URL = API_CONFIG.BASE_URL;

// Get all subscriptions for a customer
export const getCustomerSubscriptions = async (customerId: number): Promise<Subscription[]> => {
  try {
    const res = await fetch(`${BASE_URL}/subscriptions?customerId=${customerId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch subscriptions");
    }

    return await res.json();
  } catch (error) {
    console.error("Get subscriptions error:", error);
    throw error;
  }
};

// Get caterer details by ID
export const getCatererDetails = async (catererId: number): Promise<User> => {
  try {
    const res = await fetch(`${BASE_URL}/subscriptions/caterers/${catererId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch caterer details");
    }

    return await res.json();
  } catch (error) {
    console.error("Get caterer details error:", error);
    throw error;
  }
};

// Get all caterers that a customer is subscribed to
export const getSubscribedCaterers = async (customerId: number): Promise<User[]> => {
  try {
    // Step 1: Get customer's subscriptions
    const subscriptions = await getCustomerSubscriptions(customerId);

    // Step 2: Fetch details for each caterer
    const catererPromises = subscriptions.map(sub =>
      getCatererDetails(sub.catererId)
    );

    const caterers = await Promise.all(catererPromises);
    return caterers;
  } catch (error) {
    console.error("Get subscribed caterers error:", error);
    throw error;
  }
};

// Create a new subscription (customer subscribes to caterer)
export const createSubscription = async (
  customerId: number,
  catererId: number
): Promise<Subscription> => {
  try {
    const res = await fetch(`${BASE_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId, catererId }),
    });

    if (!res.ok) {
      const error = await res.json();
      if (res.status === 409) {
        // Already exists - fetch existing
        const subscriptions = await getCustomerSubscriptions(customerId);
        const existing = subscriptions.find(s => s.catererId === catererId);
        if (existing) {
          return { ...existing, isExisting: true };
        }
      }
      throw new Error(error.error || "Failed to create subscription");
    }

    const newSub = await res.json();
    return { ...newSub, isExisting: false };
  } catch (error) {
    console.error("Create subscription error:", error);
    throw error;
  }
};

// Remove a subscription
export const removeSubscription = async (subscriptionId: number): Promise<void> => {
  try {
    const res = await fetch(`${BASE_URL}/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to remove subscription");
    }
  } catch (error) {
    console.error("Remove subscription error:", error);
    throw error;
  }
};
