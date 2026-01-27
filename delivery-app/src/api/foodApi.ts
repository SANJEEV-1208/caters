import { API_CONFIG } from "../config/api";

const BASE_URL = API_CONFIG.BASE_URL;

export const getAllFoods = async () => {
  const res = await fetch(`${BASE_URL}/foods`);
  return await res.json();
};

export const searchFood = async (text: string) => {
  const url = `${BASE_URL}/foods?q=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  const data = await res.json();

  return data;
};

export const getVegFood = async () => {
  const res = await fetch(`${BASE_URL}/foods?category=veg`);
  return await res.json();
};

export const getNonVegFood = async () => {
  const res = await fetch(`${BASE_URL}/foods?category=non-veg`);
  return await res.json();
};

export const getTrending = async () => {
  const res = await fetch(`${BASE_URL}/foods?_limit=5`);
  return await res.json();
};

export const getAllCuisines = async () => {
  const res = await fetch(`${BASE_URL}/cuisines`);
  return await res.json();
};

export const getCatererCuisines = async (catererId: number) => {
  const res = await fetch(`${BASE_URL}/cuisines/caterer/${catererId}`);
  if (!res.ok) throw new Error('Failed to fetch caterer cuisines');
  return await res.json();
};

export const createCatererCuisine = async (catererId: number, name: string, image?: string) => {
  const res = await fetch(`${BASE_URL}/cuisines/caterer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ catererId, name, image }),
  });
  if (!res.ok) throw new Error('Failed to create cuisine');
  return await res.json();
};

export const deleteCatererCuisine = async (cuisineId: number) => {
  const res = await fetch(`${BASE_URL}/cuisines/caterer/${cuisineId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete cuisine');
  return await res.json();
};
