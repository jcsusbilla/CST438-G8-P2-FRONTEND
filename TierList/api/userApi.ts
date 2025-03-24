import API_BASE_URL from './apiConfig';

// LOGIN API - /user/login (x-www-form-urlencoded)
export const loginUser = async (email: string, password: string) => {
    console.log("Logging in with:", { email, password });

    const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    console.log("Server response:", response);

    if (!response.ok) {
        throw new Error("Login failed");
    }

    return await response.json();
};

interface RegisterUserData {
    user_name: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
}

// REGISTER API - /user/add (x-www-form-urlencoded)
export const registerUser = async (
    user_name: string,
    email: string,
    password: string,
    first_name?: string,
    last_name?: string
): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", // Java expects this for @RequestParam
        },
        body: new URLSearchParams({
            user_name,
            email,
            password,
            first_name: first_name || "",
            last_name: last_name || "",
        }).toString(),
    });
  
    const data = await response.json();
    return {
        status: response.status,
        ...data,
    };
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
    if (!email || email.trim() === "") {
        throw new Error("Invalid email provided");
    }

    console.log("Fetching user details for:", email);

    const response = await fetch(`${API_BASE_URL}/user/details?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    return await response.json();
};

export const fetchTierLists = async () => {
    const response = await fetch(`${API_BASE_URL}/tierlist/all`);
    if (!response.ok) throw new Error("Failed to load tier lists.");
    return await response.json();
};

export async function getTierListsWithRankings(userId: number) {
    try {
        const response = await fetch(`${API_BASE_URL}/tierlists/user/${userId}/with-rankings`);
        const result = await response.json();
        return result.tierLists || [];
    } catch (error) {
        console.error("Failed to fetch tier lists with rankings:", error);
        return [];
    }
}

export async function getUserById(userId : number) {
    const res = await fetch(`${API_BASE_URL}/user/${userId}`);
    return await res.json();
}
  
export async function updateUsername(userId : number, newUsername : string) {
const res = await fetch(`${API_BASE_URL}/user/updateUsername`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, newUsername }),
});
return await res.json();
}

export async function updatePassword(userId : number, newPassword : string) {
    const res = await fetch(`${API_BASE_URL}/user/updatePassword`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
    });
    return await res.json();
}

export async function deleteUser(id: number) {
    try {
        console.log(`🛠 Sending DELETE request to /user/delete/${id}`);
        const res = await fetch(`${API_BASE_URL}/user/delete/${id}`, {
            method: "DELETE",
        });
    
        const text = await res.text();
        console.log("📩 Response from delete:", text);
        return text;
    } catch (error) {
        console.error("❌ Error deleting user:", error);
        return null;
    }
}
  