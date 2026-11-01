export interface Movie { id: string; title: string; lang: string; genre: string; dur: string; cert: string; rating: number; color: string; status: string }
const m = (id: string, title: string, lang: string, genre: string, dur: string, cert: string, rating: number, color: string, status = "Now showing"): Movie =>
  ({ id, title, lang, genre, dur, cert, rating, color, status });
// Dummy data. Put real posters at /public/posters/<id>.jpg (2:3) and they replace the generated ones.
export const MOVIES: Movie[] = [
  m("vikram", "Vikram", "Tamil", "Action, Thriller", "2h 53m", "UA", 8.4, "#7a1d1d"),
  m("leo", "Leo", "Tamil · Hindi", "Action", "2h 44m", "UA 13+", 8.1, "#1d5a6e"),
  m("coolie", "Coolie", "Tamil · Telugu", "Action, Thriller", "2h 50m", "UA", 8.4, "#b8561d"),
  m("varanasi", "Varanasi", "Telugu", "Adventure, Mythology", "3h 05m", "UA", 9.6, "#1d3f9a", "Pre-booking open"),
  m("toxic", "Toxic", "Kannada · Hindi", "Gangster, Period", "2h 38m", "A", 8.8, "#3a3a3a"),
  m("jailer2", "Jailer 2", "Tamil · Telugu", "Action, Thriller", "2h 46m", "UA 16+", 9.1, "#2a7fb8"),
  m("ramayana", "Ramayana", "Hindi · Telugu", "Epic, Mythology", "3h 10m", "U", 9.0, "#a8641c", "Pre-booking open"),
  m("war2", "War 2", "Hindi · Tamil", "Spy, Action", "2h 55m", "UA", 7.2, "#1d6a8a"),
  m("animal", "Animal", "Hindi · Telugu", "Crime, Drama", "3h 21m", "A", 7.9, "#8a6a1d"),
  m("kantara", "Kantara", "Kannada", "Folk, Thriller", "2h 30m", "UA", 8.6, "#1d6a3a"),
  m("pushpa2", "Pushpa 2", "Telugu · Hindi", "Action, Drama", "3h 20m", "UA", 8.0, "#8a1d4a"),
  m("salaar", "Salaar", "Telugu · Kannada", "Action", "2h 55m", "A", 7.8, "#4a1d8a"),
];
