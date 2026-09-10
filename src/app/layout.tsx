import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VocalBee · Mỗi ngày một chút, nhớ lâu hơn",
  description: "Học từ vựng tiếng Anh lớp 6–9, ôn tập thích ứng và khám phá cách học phù hợp với bạn.",
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
