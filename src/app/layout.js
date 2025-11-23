import './globals.css';
import Navbar from '@/components/Navbar';
import AuthProvider from '@/components/AuthProvider'; // Import this

export const metadata = {
  title: 'UniSpace',
  description: 'College Seminar Hall Booking',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider> {/* Wrap everything inside this */}
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}