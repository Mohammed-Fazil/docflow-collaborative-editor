import { jwtDecode } from "jwt-decode";

/*
  GET CURRENT USER
*/

export const getCurrentUser = () => {

    const token =
        localStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {

        const decoded =
            jwtDecode(token);

        /*
          JWT SUBJECT
        */

        return decoded.sub;

    } catch (error) {

        console.error(
            "Invalid token",
            error
        );

        return null;
    }
};