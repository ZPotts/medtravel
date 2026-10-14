import type { Clinic } from "./clinic";

/** A made-up clinic used only to check that the Clinic type works. Not real data. */
export const sampleClinic: Clinic = {
  id: "sample-001",
  localName: "Clínica Dental Ejemplo",
  nameEnglish: "Example Dental Clinic",
  country: "MX",
  city: "Tijuana",
  address: "Av. Revolución 123, Zona Centro",
  website: "https://example.com",
  status: "candidate",
};