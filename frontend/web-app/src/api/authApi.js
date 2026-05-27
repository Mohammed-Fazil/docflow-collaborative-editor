import api from "./axios";

export const login = async (data) => {

    const response = await api.post(
        "/api/auth/login",
        data
    );

    return response.data;
};

export const register = async (data) => {

    const response = await api.post(
        "/api/auth/register",
        data
    );

    return response.data;
};

export const refreshToken = async (
    refreshToken
) => {

    const response = await api.post(
        "/api/auth/refresh",
        {
            refreshToken
        }
    );

    return response.data;
};

export const logout = async (
    refreshToken
) => {

    const response = await api.post(
        "/api/auth/logout",
        {
            refreshToken
        }
    );

    return response.data;
};
