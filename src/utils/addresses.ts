export interface Address {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  default?: boolean;
}

// Address mapping by country code-province code
export const ADDRESS_MAPPING: Record<string, Address[]> = {
  "IN-MH": [
    {
      address1: "Amanora Gateway Towers, Hadapsar",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411028",
    },
    {
      address1: "Trump Towers, Kalyani Nagar",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411006",
    },
    {
      address1: "Blue Ridge Township, Hinjawadi Phase 1",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411057",
    },
    {
      address1: "Magarpatta Cybercity, Magarpatta",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411028",
    },
    {
      address1: "EON Free Zone, Kharadi",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411014",
    },
    {
      address1: "Panchshil Tech Park, Yerwada",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411006",
    },
    {
      address1: "Kumar Pacific Mall, Swargate",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411042",
    },
    {
      address1: "Seasons Mall, Magarpatta",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411028",
    },
    {
      address1: "Phoenix Marketcity, Viman Nagar",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411014",
    },
    {
      address1: "Nyati Elysia, Kharadi",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411014",
    },
    {
      address1: "Kunal Icon, Pimple Saudagar",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411027",
    },
    {
      address1: "Godrej Infinity, Keshav Nagar",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411036",
    },
    {
      address1: "Kolte Patil 24K Espada, Baner",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411045",
    },
    {
      address1: "Nanded City, Sinhagad Road",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411041",
    },
    {
      address1: "Rohan Mithila, Viman Nagar",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411014",
    },
    {
      address1: "Marvel Zephyr, Kharadi",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411014",
    },
    {
      address1: "Gera Imperium Alpha, Kharadi",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411014",
    },
    {
      address1: "Pride World City, Charholi Budruk",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "412105",
    },
    {
      address1: "The Address, Baner-Pashan Link Road",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411021",
    },
    {
      address1: "Mont Vert Tropez, Wakad",
      city: "Pune",
      province: "Maharashtra",
      country: "India",
      zip: "411057",
    },
  ],
  "US-CA": [
    {
      address1: "1 Infinite Loop",
      city: "Cupertino",
      province: "California",
      country: "USA",
      zip: "95014",
    },
    {
      address1: "1600 Amphitheatre Parkway",
      city: "Mountain View",
      province: "California",
      country: "USA",
      zip: "94043",
    },
    {
      address1: "1 Hacker Way",
      city: "Menlo Park",
      province: "California",
      country: "USA",
      zip: "94025",
    },
    {
      address1: "345 Spear Street",
      city: "San Francisco",
      province: "California",
      country: "USA",
      zip: "94105",
    },
    {
      address1: "405 Howard Street",
      city: "San Francisco",
      province: "California",
      country: "USA",
      zip: "94105",
    },
    {
      address1: "1355 Market Street",
      city: "San Francisco",
      province: "California",
      country: "USA",
      zip: "94103",
    },
    {
      address1: "500 Terry A Francois Blvd",
      city: "San Francisco",
      province: "California",
      country: "USA",
      zip: "94158",
    },
    {
      address1: "800 W California Ave",
      city: "Sunnyvale",
      province: "California",
      country: "USA",
      zip: "94086",
    },
    {
      address1: "7000 Marina Blvd",
      city: "Brisbane",
      province: "California",
      country: "USA",
      zip: "94005",
    },
    {
      address1: "1200 Getty Center Dr",
      city: "Los Angeles",
      province: "California",
      country: "USA",
      zip: "90049",
    },
    {
      address1: "111 S Grand Ave",
      city: "Los Angeles",
      province: "California",
      country: "USA",
      zip: "90012",
    },
    {
      address1: "2211 North First Street",
      city: "San Jose",
      province: "California",
      country: "USA",
      zip: "95131",
    },
    {
      address1: "3333 Coyote Hill Rd",
      city: "Palo Alto",
      province: "California",
      country: "USA",
      zip: "94304",
    },
    {
      address1: "100 Winchester Circle",
      city: "Los Gatos",
      province: "California",
      country: "USA",
      zip: "95032",
    },
    {
      address1: "275 Shoreline Dr",
      city: "Redwood City",
      province: "California",
      country: "USA",
      zip: "94065",
    },
    {
      address1: "950 Elm Ave",
      city: "San Bruno",
      province: "California",
      country: "USA",
      zip: "94066",
    },
    {
      address1: "3450 Hillview Ave",
      city: "Palo Alto",
      province: "California",
      country: "USA",
      zip: "94304",
    },
    {
      address1: "500 Oracle Parkway",
      city: "Redwood Shores",
      province: "California",
      country: "USA",
      zip: "94065",
    },
    {
      address1: "600 Montgomery Street",
      city: "San Francisco",
      province: "California",
      country: "USA",
      zip: "94111",
    },
    {
      address1: "160 Spear Street",
      city: "San Francisco",
      province: "California",
      country: "USA",
      zip: "94105",
    },
  ],
};

export function getAddressesForLocation(
  countryCode: string,
  provinceCode?: string
): Address[] {
  const key = provinceCode ? `${countryCode}-${provinceCode}` : countryCode;
  return ADDRESS_MAPPING[key] || [];
}

export function getRandomAddresses(
  count: number,
  countryCode: string,
  provinceCode?: string
): Address[] {
  const addresses = getAddressesForLocation(countryCode, provinceCode);

  if (addresses.length === 0) {
    return [];
  }

  if (count > addresses.length) {
    count = addresses.length;
  }

  if (count > 20) {
    count = 20;
  }

  // Shuffle the addresses and take the first 'count' items
  const shuffled = [...addresses].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
