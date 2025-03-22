import API_BASE_URL from './apiConfig';

// LOGIN API - /user/login (x-www-form-urlencoded)
//jc
// type LoginResponse = {
//     message: string;
//     userId: number;
//     email: string;
//     userName: string;
//     firstName?: string;
//     lastName?: string;
// };

export const loginUser = async (email: string, password: string) => {
    console.log("Logging in with:", { email, password }); // ✅ Debugging

    const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    console.log("Server response:", response); // ✅ Debugging

    if (!response.ok) {
        throw new Error("Login failed");
    }

    return await response.json();
};
// up to here

// export const loginUser = async (email: string, password: string): Promise<{ message: string; email: string; userName: string }> => {
//     const response = await fetch(`${API_BASE_URL}/user/login`, {//jc
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ email, password })
//     });

//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//     }

//     return response.json();
// };

interface RegisterUserData {
    user_name: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
}

// REGISTER API - /user/add (x-www-form-urlencoded)
export const registerUser = async (userData: RegisterUserData): Promise<{ message: string }> => {
    const response = await fetch("${API_BASE_URL}/user/add", {//jx
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
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
// export const createTierList = async (newTierList) => {
//     const response = await fetch(`${API_BASE_URL}/tierlist/create`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newTierList),
//     });
//     if (!response.ok) throw new Error("Failed to create tier list.");
//     return await response.json();
// };