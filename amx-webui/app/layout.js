import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AMX System Management",
  description: "Developed by: rvsubagan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="cupcake">
      <body className={inter.className}>
        <div>
          <Toaster />
        </div>
        {children}
        </body>
    </html>
  );
}
