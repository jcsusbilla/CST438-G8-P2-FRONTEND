import API_URL from './apiConfig';

// LOGIN API - /user/login (x-www-form-urlencoded)
export const loginUser = async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append("email", email);
    params.append("password", password);

    const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        credentials: 'include'                                                                  // session-based authentication
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Login failed.");
    }

    return await response.text();                                                               // backend returns plain text, not JSON
};

// REGISTER API - /user/add (x-www-form-urlencoded)
export const registerUser = async (user: { username: string, email: string, password: string, firstName?: string, lastName?: string }) => {
    const params = new URLSearchParams();
    params.append("user_name", user.username);
    params.append("email", user.email);
    params.append("password", user.password);
    if (user.firstName) params.append("first_name", user.firstName);
    if (user.lastName) params.append("last_name", user.lastName);

    const response = await fetch(`${API_URL}/user/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Registration failed.");
    }
};

// GOOGLE LOGIN API - /user/oauth2/google
export const loginWithGoogle = async (token: string) => {
    const response = await fetch(`${API_URL}/user/oauth2/google`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Google login failed.");
    }

    return await response.text();
};

// LOGOUT API - /user/logout (GET)
export const logoutUser = async () => {
    const response = await fetch(`${API_URL}/user/logout`, {
        method: 'GET',
        credentials: 'include',                                                             // session is cleared
    });

    if (!response.ok) {
        throw new Error("Logout failed.");
    }
};

export const fetchUserDetails = async (email: string) => {
    const response = await fetch(`${API_URL}/user/email/${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'                                                              // session authentication
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user details.");
    }

    return await response.json();
};