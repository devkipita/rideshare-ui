// Curated city-scoped pickup/drop-off suggestions for Kenya routes.
// Keep route fields as towns, and use this list only for precise meeting places.
export const KENYAN_PLACES_BY_CITY: Record<string, string[]> = {
  Nairobi: [
    "Jomo Kenyatta International Airport (JKIA)",
    "Wilson Airport",
    "Nairobi SGR Terminus",
    "CBD - Kencom",
    "CBD - Archives",
    "Westlands",
    "Sarit Centre",
    "Two Rivers Mall",
    "Village Market",
    "Yaya Centre",
    "Kilimani",
    "Kileleshwa",
    "Lavington",
    "Upper Hill",
    "Ngong Road",
    "Karen",
    "Langata",
    "South B",
    "South C",
    "Donholm",
    "Embakasi",
    "TRM Mall",
    "Kasarani",
    "Roysambu",
    "Gikambura",
    "Githurai 45",
  ],
  Mombasa: [
    "Moi International Airport",
    "Mombasa SGR Terminus",
    "Mombasa CBD",
    "Nyali Centre",
    "City Mall Nyali",
    "Bamburi",
    "Shanzu",
    "Likoni Ferry",
    "Kongowea Market",
    "Tudor",
    "Mtwapa",
    "Changamwe",
    "Buxton",
    "Digo Road",
  ],
  Kisumu: [
    "Kisumu International Airport",
    "Kisumu CBD",
    "United Mall",
    "Mega Plaza",
    "Kibuye Market",
    "Milimani",
    "Mamboleo",
    "Kondele",
    "Dunga Beach",
    "Otonglo",
    "Kisumu Bus Park",
  ],
  Nakuru: [
    "Nakuru CBD",
    "Westside Mall",
    "Nakuru Railway Station",
    "Nakuru Bus Park",
    "Kiamunyi",
    "Milimani",
    "Section 58",
    "London Estate",
    "Pipeline Nakuru",
    "Njoro Junction",
    "Naivasha Road",
  ],
  Eldoret: [
    "Eldoret International Airport",
    "Eldoret CBD",
    "Zion Mall",
    "Rupa Mall",
    "Eldoret Main Stage",
    "Langas",
    "Kapseret",
    "Annex",
    "Pioneer",
    "Elgon View",
  ],
  Nanyuki: [
    "Nanyuki Town",
    "Cedar Mall",
    "Nanyuki Airstrip",
    "Nanyuki Bus Park",
    "Kiganjo Road",
    "Mt Kenya Safari Club Junction",
    "Likii",
    "Nturukuma",
  ],
  Thika: [
    "Thika CBD",
    "Ananas Mall",
    "Thika Road Mall (TRM)",
    "Blue Post",
    "Makongeni",
    "Landless",
    "Section 9",
    "Thika Main Stage",
  ],
  Nyeri: [
    "Nyeri CBD",
    "Nyeri Bus Park",
    "Karatina Road Junction",
    "King'ong'o",
    "Asian Quarter",
    "Outspan",
    "Dedan Kimathi University",
  ],
  Machakos: [
    "Machakos CBD",
    "Machakos Bus Park",
    "Machakos Junction",
    "People's Park",
    "Mlolongo",
    "Syokimau SGR",
    "Athi River",
  ],
  Meru: [
    "Meru CBD",
    "Meru Bus Park",
    "Makutano",
    "Nkubu",
    "Kinoru Stadium",
    "Greenwood Mall",
    "KEMU",
  ],
  Kisii: [
    "Kisii CBD",
    "Kisii Bus Park",
    "Capital Roundabout",
    "Daraja Mbili",
    "Nyanchwa",
    "Kisii University",
  ],
  Kakamega: [
    "Kakamega CBD",
    "Kakamega Bus Park",
    "Muliro Gardens",
    "Kakamega Airstrip",
    "Lurambi",
    "Kefinco",
  ],
  Kericho: [
    "Kericho CBD",
    "Kericho Bus Park",
    "Green Square Mall",
    "Tea Hotel",
    "Kapkugerwet",
    "Brooke",
  ],
  Kitale: [
    "Kitale CBD",
    "Kitale Bus Park",
    "Kitale Museum",
    "Khetia's Supermarket",
    "Milimani Kitale",
    "Kipsongo",
  ],
  Malindi: [
    "Malindi Airport",
    "Malindi Town",
    "Malindi Bus Park",
    "Vasco da Gama Pillar",
    "Buntwani",
    "Casuarina",
  ],
  Kilifi: [
    "Kilifi Town",
    "Kilifi Bridge",
    "Kilifi Bus Park",
    "Mnarani",
    "Pwani University",
    "Bofa Beach",
  ],
  Diani: [
    "Ukunda Airstrip",
    "Diani Shopping Centre",
    "Diani Beach Road",
    "Ukunda Town",
    "Leisure Lodge",
    "Kombani",
  ],
  Voi: [
    "Voi CBD",
    "Voi SGR Station",
    "Voi Bus Park",
    "Caltex Voi",
    "Maungu",
    "Taita Taveta University",
  ],
  Narok: [
    "Narok Town",
    "Narok Bus Park",
    "Total Narok",
    "Maasai Mara University",
    "Majengo Narok",
    "Bomet Road Junction",
  ],
  Naivasha: [
    "Naivasha Town",
    "Naivasha Bus Park",
    "Buffalo Mall",
    "Karagita",
    "Moi South Lake Road",
    "Kenyatta Avenue Naivasha",
  ],
  Embu: [
    "Embu Town",
    "Embu Bus Park",
    "Kangaru",
    "Blue Valley",
    "Embu University",
    "Dallas Embu",
  ],
  Bungoma: [
    "Bungoma Town",
    "Bungoma Bus Park",
    "Kanduyi",
    "Moi Avenue Bungoma",
    "Bungoma Railway Station",
  ],
  "Uasin Gishu": ["Eldoret CBD", "Rupa Mall", "Zion Mall", "Langas", "Kapseret"],
  Laikipia: ["Nanyuki Town", "Cedar Mall", "Nyahururu Town", "Rumuruti", "Wiyumiririe"],
};

const NORMALIZED_CITY_ALIASES: Record<string, string> = {
  jkia: "Nairobi",
  "jomo kenyatta": "Nairobi",
  wilson: "Nairobi",
  cbd: "Nairobi",
  "kisumu county": "Kisumu",
  "uasin gishu": "Uasin Gishu",
  laikipia: "Laikipia",
  diani: "Diani",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getPlacesForCity(city: string): string[] {
  const cleanCity = city.trim();
  if (!cleanCity) return [];

  const directKey = Object.keys(KENYAN_PLACES_BY_CITY).find(
    (key) => normalize(key) === normalize(cleanCity),
  );
  if (directKey) return KENYAN_PLACES_BY_CITY[directKey] ?? [];

  const alias = NORMALIZED_CITY_ALIASES[normalize(cleanCity)];
  return alias ? KENYAN_PLACES_BY_CITY[alias] ?? [] : [];
}

export function filterPlaces(city: string, input: string, limit = 8): string[] {
  const places = getPlacesForCity(city);
  if (!places.length) return [];

  const q = normalize(input);
  if (!q) return places.slice(0, limit);

  const matches = places.filter((place) => normalize(place).includes(q));
  return (matches.length ? matches : places).slice(0, limit);
}
