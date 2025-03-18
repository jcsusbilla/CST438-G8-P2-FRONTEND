import API_BASE_URL from './apiConfig';

// LOGIN API - /user/login (x-www-form-urlencoded)
export const loginUser = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password }).toString(),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json(); // ✅ Parse JSON correctly
};

// REGISTER API - /user/add (x-www-form-urlencoded)
export const registerUser = async (userData: any) => {
    console.log("Sending Registration Request:", userData);

    const response = await fetch(`${API_BASE_URL}/user/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    return await response.json();
};

// GOOGLE LOGIN API - /user/oauth2/google
export const loginWithGoogle = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/user/oauth2/google`, {
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
    const response = await fetch(`${API_BASE_URL}/user/logout`, {
        method: 'GET',
        credentials: 'include',                                                             // session is cleared
    });

    if (!response.ok) {
        throw new Error("Logout failed.");
    }
};

export const fetchUserDetails = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/user/details?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return await response.json();
};

export const fetchTierLists = async () => {
    const response = await fetch(`${API_BASE_URL}/tierlist/all`);
    if (!response.ok) throw new Error("Failed to load tier lists.");
    return await response.json();
};

// export const createTierList = async (newTierList) => {
//     const response = await fetch(`${API_BASE_URL}/tierlist/create`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newTierList),
//     });
//     if (!response.ok) throw new Error("Failed to create tier list.");
//     return await response.json();
// };