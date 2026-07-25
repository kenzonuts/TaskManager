import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface FocusModeContextType {
  focusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (value: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export const FocusModeProvider = ({ children }: { children: ReactNode }) => {
  const [focusMode, setFocusMode] = useState(() => {
    return localStorage.getItem('tm-focus-mode') === '1';
  });

  useEffect(() => {
    localStorage.setItem('tm-focus-mode', focusMode ? '1' : '0');
  }, [focusMode]);

  return (
    <FocusModeContext.Provider
      value={{
        focusMode,
        setFocusMode,
        toggleFocusMode: () => setFocusMode((v) => !v),
      }}
    >
      {children}
    </FocusModeContext.Provider>
  );
};

export const useFocusMode = () => {
  const ctx = useContext(FocusModeContext);
  if (!ctx) throw new Error('useFocusMode must be used within FocusModeProvider');
  return ctx;
};
