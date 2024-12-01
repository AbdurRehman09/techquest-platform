import { Providers } from './providers/providers'
import { ConfigProvider } from "antd"
import themeConfig from "./themes/theme.config"
import './themes/globals.css'
import Navbar from './Components/common/Navbar'

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
            <Navbar />
            {children}
          </ConfigProvider>
        </Providers>
      </body>
    </html>
  )
}
