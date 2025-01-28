import { ReactNode } from "react"
import { ThemeProvider } from "./theme-provider"

interface ClientThemeProviderProps {
  children: ReactNode
}

const ClientThemeProvider = ({ children }: ClientThemeProviderProps) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}

export default ClientThemeProvider
