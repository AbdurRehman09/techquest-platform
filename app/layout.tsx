import { Providers } from './providers'
import { ConfigProvider } from "antd"
import themeConfig from "./themes/theme.config"
import './themes/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ConfigProvider theme={themeConfig}>
            {children}
          </ConfigProvider>
        </Providers>
      </body>
    </html>
  )
}
