import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

// État UI global (hors auth) : pour l'instant, uniquement l'ouverture du menu
// mobile (Header), fermé automatiquement à chaque changement de page.
export function AppProvider({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const value = {
    menuOpen,
    toggleMenu: () => setMenuOpen((o) => !o),
    closeMenu: () => setMenuOpen(false),
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
