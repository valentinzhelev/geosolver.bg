import API_BASE_URL from '../config/api';

class UserManagementService {
  // GET /api/users - Списък на всички потребители (admin only)
  static async getUsers(page = 1, limit = 50, search = '', role = '') {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Не сте влезли в системата');
      }

      let url = `${API_BASE_URL}/users?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (role) url += `&role=${role}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Грешка при зареждане на потребителите');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // GET /api/users/:id - Детайли за потребител (admin only)
  static async getUserById(userId) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Не сте влезли в системата');
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Грешка при зареждане на потребителя');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // PUT /api/users/:id/role - Промяна на роля (admin only)
  static async updateUserRole(userId, role) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Не сте влезли в системата');
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Грешка при промяна на ролята');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // DELETE /api/users/:id - Изтриване на потребител (admin only)
  static async deleteUser(userId) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Не сте влезли в системата');
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Грешка при изтриване на потребителя');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export default UserManagementService;
