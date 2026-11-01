export const metadata = { title: "Cineverse" };
export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#07080c", color: "#fff", fontFamily: "system-ui, sans-serif", overscrollBehavior: "none" }}>
        {children}
      </body>
    </html>
  );
}
