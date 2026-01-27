export type Apartment = {
  id: number;
  catererId: number;
  name: string;
  address: string;
  accessCode: string;
  createdAt: string;
};

export type CustomerApartment = {
  id: number;
  customerId: number;
  apartmentId: number | null; // null for direct add without apartment
  catererId: number;
  addedVia: "code" | "manual";
  createdAt: string;
};
