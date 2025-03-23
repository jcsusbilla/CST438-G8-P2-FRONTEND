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
export const registerUser = async (userData: RegisterUserData): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/user/add`, {
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
    try {
        console.log("Sending Google token to backend:", token);
        
        // Make the fetch request with the token
        const response = await fetch(`${API_BASE_URL}/user/oauth2/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token })
        });
        
        console.log("Google login response status:", response.status);
        
        // Handle non-OK responses
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response from server:", errorText);
            throw new Error(errorText || "Google login failed");
        }
        
        // Try to parse as JSON, fallback to text
        try {
            return await response.json();
        } catch (e) {
            // If not JSON, return the text as a message property
            const text = await response.text();
            console.log("Response text:", text);
            return { message: text, email: "user@example.com" };
        }
    } catch (error) {
        console.error("loginWithGoogle error:", error);
        throw error;
    }
};

// LOGOUT API - /user/logout (GET)
export const logoutUser = async () => {
    const response = await fetch(`${API_BASE_URL}/user/logout`, {
        method: 'GET',
        credentials: 'include',
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
  
  export async function deleteUser(userId : number) {
    const res = await fetch(`${API_BASE_URL}/user/delete/${userId}`, {
      method: "DELETE",
    });
    return await res.text();
  }

  