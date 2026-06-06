import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  /*
    AUTH STATE
  */

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /*
    CURRENT USER
  */

  const [user, setUser] = useState(null);

  /*
    INITIAL LOAD
  */

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const storedUser = localStorage.getItem("user");

    setIsAuthenticated(!!token);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /*
    LOGIN
  */

  const login = (accessToken, refreshToken, userData) => {
    localStorage.setItem("accessToken", accessToken);

    localStorage.setItem("refreshToken", refreshToken);

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

    setIsAuthenticated(true);
  };

  /*
    LOGOUT
  */

  const logout = () => {
    localStorage.removeItem("accessToken");

    localStorage.removeItem("refreshToken");

    localStorage.removeItem("user");

    setUser(null);

    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
