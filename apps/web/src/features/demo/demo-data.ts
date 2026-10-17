// All values are invented. The lease slice reuses this file so the data matches.
export const demoListing = {
  brand: "Nordhaven Rentals",
  tagline: "Demo listings, not real homes",
  title: "Bright 2-room apartment, demo listing",
  address: "Testikatu 1 A 1, 00000 Testila",
  rentalNumber: "DEMO-0001",
  description:
    "A light, quiet two-room home. The living room has large windows facing the courtyard, the kitchen has new appliances, and the building has a shared sauna and bicycle storage. This listing is made up for a demo.",
  keyFacts: [
    { label: "Rent", value: "890 € / month" },
    { label: "Size", value: "42 m²" },
    { label: "Built", value: "1962" },
  ],
  details: [
    { name: "Type", value: "Apartment, 2 rooms and kitchen" },
    { name: "Address", value: "Testikatu 1 A 1, 00000 Testila" },
    { name: "Floor", value: "3 / 5, elevator" },
    { name: "Available from", value: "1 December 2026" },
    { name: "Deposit", value: "1 780 € (two months’ rent)" },
    { name: "Lease", value: "Fixed term, 12 months" },
    { name: "Heating", value: "District heating" },
    { name: "Home insurance required", value: "Yes" },
  ],
  landlord: {
    company: "Nordhaven Rentals Oy (demo)",
    agent: "Aino Testinen",
    phone: "+358 40 000 0000",
    email: "aino.testinen@example.com",
  },
  photos: {
    bedroom: "bed_room_stock_original.jpg",
    kitchen: "kitchen_stock_original.jpg",
  },
} as const;
