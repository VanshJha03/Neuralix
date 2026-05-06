import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'CreatioX | Creating Unique',
  description: 'Premium intelligence platform for strategy and ideation.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='black'/><path d='M30 70 L70 30 M30 30 L70 70' stroke='white' stroke-width='12' stroke-linecap='round'/><path d='M20 50 Q50 20 80 50' fill='none' stroke='white' stroke-width='6' opacity='0.5'/></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-black">{children}</body>
    </html>
  );
}
