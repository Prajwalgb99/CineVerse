export const metadata = { title: "Cineverse" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#07080c", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
