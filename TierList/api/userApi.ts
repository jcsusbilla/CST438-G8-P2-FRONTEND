import API_URL from './apiConfig';

// Register user -> POST /user/add
export async function registerUser(user: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}) {
    const formData = new URLSearchParams();
    formData.append('user_name', user.username);
    formData.append('email', user.email);
    formData.append('password', user.password);
    formData.append('first_name', user.firstName);
    formData.append('last_name', user.lastName);

    const response = await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        credentials: 'include'  // important for session handling (login later)
    });

    const result = await response.text();  // Backend returns plain text
    if (!response.ok || result.startsWith('Error')) {
        throw new Error(result);
    }
    return result;  // Success message from backend
}

// Login user -> POST /user/login
export async function loginUser(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        credentials: 'include'  // important to maintain session
    });

    const result = await response.text();  // Backend returns plain text
    if (!response.ok || result.startsWith('Error')) {
        throw new Error(result);
    }
    return result;  // Success message from backend
}

// Fetch user profile by ID -> GET /user/{id}
export async function fetchUserById(userId: number) {
    const response = await fetch(`${API_URL}/${userId}`, {
        method: 'GET',
        credentials: 'include'  // important to pass session cookie
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user profile');
    }
    return await response.json();  // User object
}