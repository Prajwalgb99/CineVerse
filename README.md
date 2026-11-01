# Cineverse (frontend, milestones 1-8)

    npm install
    npm run dev        # http://localhost:3000   (add ?fps to a URL to see an FPS counter)

## Add a movie
Edit `data/movies.ts` (one line per movie). Any number works; card spacing adjusts automatically.

## Poster images
`public/posters/<id>.jpg` (or .webp/.png). Recommended 800x1000. Use .jpg so the movie page backdrop works too.

## Trailers
- YouTube: add `<id>: "VIDEO_ID"` to the `YT` table in `data/movies.ts`.
- Or a local file: `public/trailers/<id>.mp4` (H.264, under ~20 MB).

## Real 3D seat (optional)
Put a single-seat model at `public/models/seat.glb`. If it faces the wrong way set `SEAT_YAW = Math.PI` in `components/Seats.tsx`.
