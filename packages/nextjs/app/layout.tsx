import { Inter, Playfair_Display } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "sonner";
import { DappWrapperWithProviders } from "~~/components/DappWrapperWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/helper/getMetadata";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata = getMetadata({
  title: "AZEND",
  description: "Smart events, Safer check-ins.",
});

const DappWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
     
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#020410] text-white min-h-screen`}>
        <ThemeProvider enableSystem={false} defaultTheme="dark">
          <DappWrapperWithProviders>{children}</DappWrapperWithProviders>
        </ThemeProvider>
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
};

export default DappWrapper;
