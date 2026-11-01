export interface Movie { id: string; title: string; lang: string; genre: string; dur: string; cert: string; rating: number; color: string; status: string; pan: boolean; yt?: string }

const ORDER = ["Tamil", "Telugu", "Hindi", "Kannada", "Malayalam"];
const dub = (lead: string) => [lead, ...ORDER.filter((l) => l !== lead)].join(" · "); // pan-India: released in all 5 languages
const P = true, R = false;
// pan = true  -> shown in EVERY city.   pan = false -> regional: only in the city of its language.
const m = (pan: boolean, id: string, title: string, lang: string, genre: string, dur: string, cert: string, rating: number, color: string, status = "Now showing"): Movie =>
  ({ id, title, lang, genre, dur, cert, rating, color, status, pan });

// Optional YouTube trailer ids, e.g. jailer2: "AbC123xyz_0" (the part after v= in the URL).
// A local file /public/trailers/<id>.mp4 is used when no YouTube id is set.
const YT: Record<string, string> = {
  // Pan-India
  jailer2: "FW_PPcr1sPE",
  coolie: "qeVfT2iLiu0",
  leo: "Po3jStA673E",
  varanasi: "DMD2uthghWE",
  toxic: "sJwaiRN-rvc",
  ramayana: "lNaSdnz2I8g",
  war2: "mjBym9uKth4",
  pushpa2: "1kVK0MZlbI4",
  salaar: "wcpzcXX5jq4",
  kantara: "TMQUFhWm8C0",
  kgf2: "JKa05nyUmuQ",
  rrr: "NgBoMJy386M",
  jawan: "COv52Qyctws",
  animal: "8FkLRUJj-o0",
  dhurandhar: "rZ_e-s6VvR4",
  empuraan: "PGqltBCo6cU",
  lokah: "64XHtNWTB5o",

  // Kannada
  premadooralli: "lWPP1hIJ1_0",
  sufromso: "Fe11GLdTL5k",
  kaatera: "L1KYlnMRtqc",
  sapta: "hcJ1ZHHahMA",

  // Tamil
  maharaja: "Otcr-vRuaQs",
  amaran: "hylIXfZeB4c",
  retro: "yE560j3AK3A",
  vikram: "OKBMCL-frPU",

  // Telugu
  og: "BS5-JM8zqN0",
  lucky: "FonKx5wvuHI",
  hit3: "XhW3i2f54BQ",
  court: "od8pBqEDICo",

  // Malayalam
  manjummel: "id848Ww1YLo",
  premalu: "rR_2ti4l3nM",
  aavesham: "L0yEMl8PXnw",
  aadujeevitham: "qvsiJKdDxPs",

  // Hindi
  stree2: "KVn5gkhkXw8",
  chhaava: "WBPQjTL-NnY",
  saiyaara: "20DfwOHgM3k",
  "12thfail": "KjbtuqENvVE",
};
const RAW: Movie[] = [
  // ---- pan-India ----
  m(P, "jailer2", "Jailer 2", dub("Tamil"), "Action, Thriller", "2h 46m", "UA 16+", 9.1, "#2a7fb8"),
  m(P, "coolie", "Coolie", dub("Tamil"), "Action, Thriller", "2h 50m", "UA", 8.4, "#b8561d"),
  m(P, "leo", "Leo", dub("Tamil"), "Action", "2h 44m", "UA 13+", 8.1, "#1d5a6e"),
  m(P, "varanasi", "Varanasi", dub("Telugu"), "Adventure, Mythology", "3h 05m", "UA", 9.6, "#1d3f9a", "Pre-booking open"),
  m(P, "toxic", "Toxic", dub("Kannada"), "Gangster, Period", "2h 38m", "A", 8.8, "#3a3a3a"),
  m(P, "ramayana", "Ramayana", dub("Hindi"), "Epic, Mythology", "3h 10m", "U", 9.0, "#a8641c", "Pre-booking open"),
  m(P, "war2", "War 2", dub("Hindi"), "Spy, Action", "2h 55m", "UA", 7.2, "#1d6a8a"),
  m(P, "pushpa2", "Pushpa 2", dub("Telugu"), "Action, Drama", "3h 20m", "UA", 8.0, "#8a1d4a"),
  m(P, "salaar", "Salaar", dub("Telugu"), "Action", "2h 55m", "A", 7.8, "#4a1d8a"),
  m(P, "kantara", "Kantara", dub("Kannada"), "Folk, Thriller", "2h 30m", "UA", 8.6, "#1d6a3a"),
  m(P, "kgf2", "KGF Chapter 2", dub("Kannada"), "Action, Period", "2h 48m", "UA", 8.3, "#8a5a1d"),
  m(P, "rrr", "RRR", dub("Telugu"), "Epic, Action", "3h 07m", "UA", 8.8, "#8a2a1d"),
  m(P, "jawan", "Jawan", dub("Hindi"), "Action, Thriller", "2h 49m", "UA", 8.0, "#5a1d1d"),
  m(P, "animal", "Animal", dub("Hindi"), "Crime, Drama", "3h 21m", "A", 7.9, "#8a6a1d"),
  m(P, "dhurandhar", "Dhurandhar", dub("Hindi"), "Spy, Action", "3h 34m", "A", 8.2, "#1d3a4a"),
  m(P, "empuraan", "Empuraan", dub("Malayalam"), "Action, Thriller", "2h 59m", "UA", 8.2, "#6a1d1d"),
  m(P, "lokah", "Lokah", dub("Malayalam"), "Fantasy, Action", "2h 32m", "UA", 8.4, "#1d4a6a"),
  // ---- Kannada (regional) ----
  m(R, "premadooralli", "Premadooralli", "Kannada", "Romance, Drama", "2h 25m", "U", 8.1, "#6a2a4a"),
  m(R, "sufromso", "Su From So", "Kannada", "Comedy, Horror", "2h 17m", "UA", 8.7, "#2a5a3a"),
  m(R, "kaatera", "Kaatera", "Kannada", "Action, Drama", "2h 40m", "UA", 7.9, "#3a6a1d"),
  m(R, "sapta", "Sapta Sagaradaache Ello", "Kannada", "Romance, Drama", "2h 28m", "UA", 8.4, "#1d5a7a"),
  // ---- Tamil (regional) ----
  m(R, "maharaja", "Maharaja", "Tamil", "Thriller", "2h 30m", "UA", 8.5, "#2a2a6a"),
  m(R, "amaran", "Amaran", "Tamil", "Biopic, War", "2h 48m", "UA", 8.3, "#1d4a2a"),
  m(R, "retro", "Retro", "Tamil", "Romance, Action", "2h 28m", "UA", 7.6, "#6a3a1d"),
  m(R, "vikram", "Vikram", "Tamil", "Action, Thriller", "2h 53m", "UA", 8.4, "#7a1d1d"),
  // ---- Telugu (regional) ----
  m(R, "og", "They Call Him OG", "Telugu", "Gangster, Action", "2h 35m", "A", 8.0, "#1d1d5a"),
  m(R, "lucky", "Lucky Baskhar", "Telugu", "Crime, Drama", "2h 28m", "UA", 8.2, "#5a4a1d"),
  m(R, "hit3", "HIT: The Third Case", "Telugu", "Crime, Thriller", "2h 34m", "A", 7.7, "#3a1d4a"),
  m(R, "court", "Court: State vs A Nobody", "Telugu", "Legal Drama", "2h 28m", "UA", 8.1, "#1d3a5a"),
  // ---- Malayalam (regional) ----
  m(R, "manjummel", "Manjummel Boys", "Malayalam", "Survival, Drama", "2h 15m", "UA", 8.7, "#1d6a6a"),
  m(R, "premalu", "Premalu", "Malayalam", "Romance, Comedy", "2h 36m", "U", 8.1, "#6a1d4a"),
  m(R, "aavesham", "Aavesham", "Malayalam", "Action, Comedy", "2h 38m", "UA", 8.2, "#4a2a6a"),
  m(R, "aadujeevitham", "Aadujeevitham", "Malayalam", "Survival, Drama", "2h 52m", "UA", 8.0, "#8a5a2a"),
  // ---- Hindi (regional / Bollywood) ----
  m(R, "stree2", "Stree 2", "Hindi", "Horror, Comedy", "2h 27m", "UA", 7.9, "#4a1d6a"),
  m(R, "chhaava", "Chhaava", "Hindi", "Historical, Action", "2h 41m", "UA", 7.9, "#7a3a1d"),
  m(R, "saiyaara", "Saiyaara", "Hindi", "Romance, Drama", "2h 36m", "UA", 8.0, "#1d3a6a"),
  m(R, "12thfail", "12th Fail", "Hindi", "Biopic, Drama", "2h 27m", "U", 8.9, "#3a5a1d"),
];
export const MOVIES: Movie[] = RAW.map((x) => ({ ...x, yt: YT[x.id] }));
