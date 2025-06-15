import '@/app/ui/global.css';
import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
     
        <Script src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css" rel="stylesheet" />
        <Script src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js" strategy="lazyOnload" />
      </body>
    </html>
  );}