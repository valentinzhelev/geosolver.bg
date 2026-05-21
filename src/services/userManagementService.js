import API_BASE_URL from '../config/api';
import { getApiLanguageHeaders, getAdminClientFallback } from '../utils/apiLanguage';

class UserManagementService {
  // GET /api/users - List all users (admin only)
  static async getUsers(page = 1, limit = 50, search = '', role = '') {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error(getAdminClientFallback('notSignedIn'));
      }

      let url = `${API_BASE_URL}/users?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (role) url += `&role=${role}`;

      const response = await fetch(url, {
        headers: getApiLanguageHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || getAdminClientFallback('loadUsers'));
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // GET /api/users/:id - User details (admin only)
  static async getUserById(userId) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error(getAdminClientFallback('notSignedIn'));
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: getApiLanguageHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || getAdminClientFallback('loadUser'));
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // PUT /api/users/:id/role - Change role (admin only)
  static async updateUserRole(userId, role) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error(getAdminClientFallback('notSignedIn'));
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: getApiLanguageHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || getAdminClientFallback('changeRole'));
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // DELETE /api/users/:id - Delete user (admin only)
  static async deleteUser(userId) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error(getAdminClientFallback('notSignedIn'));
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getApiLanguageHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || getAdminClientFallback('deleteUser'));
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export default UserManagementService;
