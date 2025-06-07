import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaRegTrashCan } from "react-icons/fa6";
import { API_BASE_URL } from '../../../config';
import { FaSun, FaMoon } from 'react-icons/fa'; // Ditambahkan

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- [DITAMBAHKAN] LOGIKA DARK MODE ---
  const [theme, setTheme] = useState(() => {
    if (localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  // --- END OF LOGIKA DARK MODE ---

  const token = localStorage.getItem('token');

  // Fungsi fetchUsers Anda (tidak diubah)
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/all-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fungsi handleDelete Anda (tidak diubah)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/auth/delete-user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(prevUsers => prevUsers.filter(user => user.id_users !== id));
      alert('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Div pembungkus utama Anda (tidak diubah, hanya ditambahkan kelas dark mode)
    <div className="">
      {/* [DITAMBAHKAN] Wrapper untuk judul dan tombol agar sejajar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Admin User Management</h1>
        <button onClick={toggleTheme} className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
      </div>
      
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Total users: <span className="font-semibold text-green-700 dark:text-green-400">{users.length}</span>
      </p>

      {error && <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>}
      {loading && <p className="mb-6 text-gray-600 dark:text-gray-400">Loading...</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
        <table className="min-w-full text-left table-auto">
          <thead className="bg-green-50 dark:bg-gray-700/50 text-green-800 dark:text-green-300 font-medium">
            <tr>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">No</th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">Username</th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">Created At</th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500 dark:text-gray-400 italic">No users found</td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.id_users}
                  className="odd:bg-white even:bg-green-50 hover:bg-green-100 dark:odd:bg-gray-800 dark:even:bg-gray-800/50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">{index + 1}</td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">{user.username}</td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">{new Date(user.create_at).toLocaleString()}</td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 text-center">
                    <button
                      onClick={() => handleDelete(user.id_users)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition"
                      disabled={loading}
                      title="Delete User"
                      aria-label={`Delete user ${user.username}`}
                    >
                      <FaRegTrashCan className="inline-block text-lg" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;