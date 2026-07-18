import './globals.css';

export const metadata = {
  title: 'Fantasy Fools Draft Headquarters',
  description: '2026 Fantasy Fools draft availability survey'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
