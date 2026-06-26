import { useState } from "react";
import authClient from "../../../shared/api/authClient";
import { useAuthStore } from "../../../shared/store/authStore";

function mapUserForStore(userDetails = {}) {
    const name = [userDetails.name, userDetails.surname]
        .filter(Boolean)
        .join(" ");
    return {
        id: userDetails.id || userDetails._id || null,
        name: name || userDetails.nombre || userDetails.username || "",
        username: userDetails.username || "",
        email: userDetails.email || "",
        phone:
            userDetails.phone ||
            userDetails.telefono ||
            userDetails.contact_phone_number ||
            "",
        role: userDetails.role || userDetails.rol || "USER_ROLE",
    };
}

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    const handleLogin = async (data) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authClient.post("/login", data);
            const { accessToken, refreshToken, userDetails, token, user } =
                response.data;

            const mappedAccessToken = accessToken || token;
            const mappedUser = mapUserForStore(userDetails || user);

            await login(mappedAccessToken, mappedUser, refreshToken);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Error al iniciar sesión");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const payload = {
                name: data.name,
                surname: data.surname,
                username: data.username,
                email: data.email,
                password: data.password,
                phone: data.phone,
            };

            const response = await authClient.post("/register", payload);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Error al registrarse");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { handleLogin, handleRegister, loading, error, logout };
};
