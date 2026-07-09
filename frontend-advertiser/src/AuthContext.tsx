import React, { createContext, useContext, useState, useEffect } from 'react';

type Advertiser = {
  id: string;
  email: string;
};

type AuthContextType = {
  token: string | null;
  advertiser: Advertiser | null;
  login: (token: string, advertiser: Advertiser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adv_token'));
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(
    localStorage.getItem('adv_user') ? JSON.parse(localStorage.getItem('adv_user') as string) : null
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem('adv_token', token);
    } else {
      localStorage.removeItem('adv_token');
    }
    if (advertiser) {
      localStorage.setItem('adv_user', JSON.stringify(advertiser));
    } else {
      localStorage.removeItem('adv_user');
    }
  }, [token, advertiser]);

  const login = (newToken: string, newAdvertiser: Advertiser) => {
    setToken(newToken);
    setAdvertiser(newAdvertiser);
  };

  const logout = () => {
    setToken(null);
    setAdvertiser(null);
  };

  return (
    <AuthContext.Provider value={{ token, advertiser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
