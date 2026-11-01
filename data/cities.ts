import { MOVIES, Movie } from "./movies";
export interface City { id: string; name: string; home: string; theatres: [string, string, number][] } // theatres: [name, area, km]
// `home` = the city's own language. Regional movies of that language show only here; pan-India movies show everywhere.
export const CITIES: City[] = [
  { id: "chennai", name: "Chennai", home: "Tamil", theatres: [["Luxe Cinemas", "Velachery", 2.1], ["SPI Sathyam", "Royapettah", 4.8], ["PVR Grand Galada", "Pallavaram", 6.3], ["AGS Cinemas", "OMR", 7.9], ["Kamala Cinemas", "Vadapalani", 9.4]] },
  { id: "bengaluru", name: "Bengaluru", home: "Kannada", theatres: [["PVR Orion Mall", "Rajajinagar", 2.4], ["INOX Garuda Mall", "MG Road", 4.1], ["Cinepolis Nexus", "Koramangala", 5.6], ["PVR Forum Mall", "Whitefield", 8.7], ["Gopalan Cinemas", "Bannerghatta Rd", 10.2]] },
  { id: "hyderabad", name: "Hyderabad", home: "Telugu", theatres: [["AMB Cinemas", "Gachibowli", 3.0], ["Prasads IMAX", "Necklace Road", 4.4], ["INOX GVK One", "Banjara Hills", 5.2], ["PVR Nexus", "Kukatpally", 8.1], ["Sudarshan 35mm", "RTC X Roads", 9.6]] },
  { id: "kochi", name: "Kochi", home: "Malayalam", theatres: [["PVR Lulu Mall", "Edappally", 3.5], ["Saritha Theatre", "Ernakulam", 4.2], ["Kavitha Theatre", "Ernakulam", 4.6], ["Padma Cinemas", "MG Road", 5.8], ["Cinepolis Centre Square", "Kaloor", 6.9]] },
  { id: "mumbai", name: "Mumbai", home: "Hindi", theatres: [["PVR Icon", "Andheri", 3.2], ["INOX Insignia", "Worli", 5.0], ["Gaiety Galaxy", "Bandra", 6.1], ["Maratha Mandir", "Mumbai Central", 7.4], ["Cinepolis Viviana", "Thane", 12.5]] },
  { id: "delhi", name: "Delhi NCR", home: "Hindi", theatres: [["PVR Select Citywalk", "Saket", 3.8], ["Delite Diamond", "Daryaganj", 5.5], ["INOX Nehru Place", "Nehru Place", 6.2], ["PVR Ambience", "Vasant Kunj", 9.0], ["Wave Cinemas", "Noida", 14.0]] },
  { id: "coimbatore", name: "Coimbatore", home: "Tamil", theatres: [["Brookefields Cinepolis", "Brookefields", 2.8], ["KG Cinemas", "Race Course", 4.0], ["Karpagam Theatre", "Gandhipuram", 5.1], ["Broadway Cinemas", "Town Hall", 6.2], ["PVR Fun Mall", "Peelamedu", 8.4]] },
];
export const cityById = (id: string) => CITIES.find((c) => c.id === id) ?? CITIES[0];
const lead = (m: Movie) => m.lang.split(" · ")[0];
export const inCity = (m: Movie, c: City) => m.pan || lead(m) === c.home;
/** Movies a city shows: all pan-India + the regional movies of its own language; own language first, then by rating. */
export const moviesFor = (c: City): Movie[] =>
  MOVIES.filter((m) => inCity(m, c)).sort((a, b) => (lead(a) === c.home ? 0 : 1) - (lead(b) === c.home ? 0 : 1) || b.rating - a.rating);
const ORDER = ["Tamil", "Telugu", "Kannada", "Malayalam", "Hindi"];
/** language filter pills for a city: home language first, only languages that have a movie here */
export const langsFor = (c: City) => [c.home, ...ORDER.filter((l) => l !== c.home)].filter((l) => moviesFor(c).some((m) => m.lang.includes(l)));
