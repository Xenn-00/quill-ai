"use client"
import { createContext, PropsWithChildren, useState } from "react"

interface NavigationContextType {
  isMobileNavOpen: boolean
  setIsMobileNavOpen: (open: boolean) => void
  closeMobileNav: () => void
}

export const NavigationContext = createContext<NavigationContextType>({
  isMobileNavOpen: false,
  setIsMobileNavOpen: () => {},
  closeMobileNav: () => {},
})

const NavigationProvider = ({ children }: PropsWithChildren) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const closeMobileNav = () => setIsMobileNavOpen(false)
  return (
    <NavigationContext
      value={{
        isMobileNavOpen,
        setIsMobileNavOpen,
        closeMobileNav,
      }}
    >
      {children}
    </NavigationContext>
  )
}

export default NavigationProvider
