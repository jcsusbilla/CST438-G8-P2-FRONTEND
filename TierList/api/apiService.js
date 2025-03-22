import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from './apiConfig';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    async (config) => config,
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            await AsyncStorage.removeItem('userEmail');
        }
        return Promise.reject(error);
    }
);

const AuthService = {
    register: async (userData) => {
        try {
            const response = await api.post('/user/register', userData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    login: async (email, password) => {
        try {
            const response = await api.post('/user/login', { email, password });
            if (response.data && response.data.message === "Login successful") {
            
                await AsyncStorage.setItem('userEmail', email);
                
                if (response.data.role) {
                    await AsyncStorage.setItem('userRole', response.data.role);
                }
            }
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    logout: async () => {
        try {
            const response = await api.get('/user/logout');
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.removeItem('userRole');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getUserDetails: async (email) => {
        try {
            const response = await api.get(`/user/details?email=${encodeURIComponent(email)}`);
            if(response.data) {
                await AsyncStorage.setItem('userRole', response.data.role || 'USER');
            }
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getUserId: async (email) => {
        try {
            const response = await api.get(`/user/getUserId?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    googleLogin: async (token) => {
        try {
            const response = await api.post('/user/oauth2/google', { token });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};

const TierListService = {
    getAllTierLists: async () => {
        try {
            const response = await api.get('/tierlists/all');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getTierListById: async (id) => {
        try {
            const response = await api.get(`/tierlists/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    createTierList: async (tierListData) => {
        try {
            const response = await api.post('/tierlists/add', tierListData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    updateTierList: async (id, tierListData) => {
        try {
            const response = await api.put(`/tierlists/update/${id}`, tierListData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    deleteTierList: async (id) => {
        try {
            const response = await api.delete(`/tierlists/delete/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getTierListByTitle: async (title) => {
        try {
            const response = await api.get(`/tierlists/title/${title}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getTierListBySubject: async (subject) => {
        try {
            const response = await api.get(`/tierlists/subject/${subject}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};

const TierRankingService = {
    addRanking: async (rankingData) => {
        try {
            const response = await api.post('/tier-rankings/add', rankingData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getRankingsByTierListId: async (tierListId) => {
        try {
            const response = await api.get(`/tier-rankings/${tierListId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    updateRanking: async (id, rankingData) => {
        try {
            const response = await api.put(`/tier-rankings/update/${id}`, rankingData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    deleteRanking: async (id) => {
        try {
            const response = await api.delete(`/tier-rankings/delete/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};

const UserTierListService = {
    addUserTierList: async (userId, tierId) => {
        try {
            const response = await api.post('/user-tier-lists/add', null, {
                params: { userId, tierId }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getUserTierLists: async (userId) => {
        try {
            const response = await api.get(`/user-tier-lists/user/${userId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getUserTierRankings: async (userId) => {
        try {
            const response = await api.get(`/user-tier-lists/user/${userId}/tier-rankings`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    deleteUserTierList: async (id) => {
        try {
            const response = await api.delete(`/user-tier-lists/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};

const AdminService = {
    getAllUsers: async () => {
        try {
            const response = await api.get('/user/admin/all-users');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/user/admin/create-user', null, {
                params: userData
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/user/admin/delete-user/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    updateUserRole: async (id, newRole) => {
        try {
            const response = await api.patch(`/user/admin/update-role/${id}`, null, {
                params: { newRole }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    disableUser: async (id) => {
        try {
            const response = await api.patch(`/user/admin/disable-user/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};

const handleApiError = (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
        if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
        } else {
            errorMessage = `Server error: ${error.response.status}`;
        }
    } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
    } else {
        errorMessage = error.message;
    }
    
    return new Error(errorMessage);
};

const checkIsAdmin = async () => {
    try {
        const email = await AsyncStorage.getItem('userEmail');
        if (!email) return false;
        
        const userDetails = await AuthService.getUserDetails(email);
        return userDetails && userDetails.role === 'ADMIN';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

export {
    api,
    AuthService,
    TierListService,
    TierRankingService,
    UserTierListService,
    AdminService,
    checkIsAdmin
};
