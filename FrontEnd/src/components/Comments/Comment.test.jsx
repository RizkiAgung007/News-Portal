import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router, Link } from 'react-router-dom'; 
import Comment from './Comment';  
import { API_BASE_URL } from '../../config'; 
import { toast } from 'react-toastify'; 

// Mock toast dari react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    warning: jest.fn(),
    success: jest.fn(),
    error: jest.fn(), 
  },
}));

// Mock komponen Confirm Modal
jest.mock('../../components/Modal/Confirm', () => {
  return ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="confirm-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm} data-testid="confirm-button">{confirmText}</button>
        <button onClick={onClose} data-testid="cancel-button">{cancelText}</button>
      </div>
    );
  };
});


describe('Comment Component', () => {
  const mockArticleUrl = 'http://example.com/berita-hebat';
  const mockUserLoggedIn = {
    token: 'fake-comment-token',
    username: 'testuser',
    role: 'user',
    id_users: 101, 
  };

  // Status awal komentar
  let mockCommentsData = [];

  // Mock global fetch API
  beforeEach(() => {
    jest.clearAllMocks();
    
    
    jest.spyOn(window, 'alert').mockImplementation(jest.fn());

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'token') return mockUserLoggedIn.token;
          if (key === 'username') return mockUserLoggedIn.username;
          if (key === 'role') return mockUserLoggedIn.role;
          if (key === 'id_users') return mockUserLoggedIn.id_users.toString();
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Reset data komentar untuk setiap tes
    mockCommentsData = [
      { id_comment: 1, content: 'Komentar pertama dari pengguna lain.', username: 'otheruser', id_user: 202, create_at: '2023-01-01T10:00:00Z' },
      { id_comment: 2, content: 'Komentar saya sendiri.', username: 'testuser', id_user: mockUserLoggedIn.id_users, create_at: '2023-01-01T11:00:00Z' },
    ];

    global.fetch = jest.fn((url, options) => {
    
      if (url === `${API_BASE_URL}/api/comments?news_url=${encodeURIComponent(mockArticleUrl)}` && (!options || options.method === 'GET')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCommentsData),
        });
      }
    
      if (url === `${API_BASE_URL}/api/comments` && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        const newComment = {
          id_comment: Date.now(), 
          content: body.content,
          username: mockUserLoggedIn.username,
          id_user: mockUserLoggedIn.id_users,
          create_at: new Date().toISOString(),
        };
        mockCommentsData.push(newComment);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(newComment),
        });
      }

      if (url.startsWith(`${API_BASE_URL}/api/comments/`) && options?.method === 'DELETE') {
        const idToDelete = parseInt(url.split('/').pop());
        const initialLength = mockCommentsData.length;
        mockCommentsData = mockCommentsData.filter(comment => comment.id_comment !== idToDelete);
        if (mockCommentsData.length < initialLength) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Comment deleted' }),
          });
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: 'Comment not found or unauthorized' }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch request: ${url}`));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  // Test Case 1: Menampilkan pesan login jika tidak ada token
  test('displays login message if no token is present', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return null;
      return null;
    });

    render(
      <Router>
        <Comment articleUrl={mockArticleUrl} token={null} userData={null} />
      </Router>
    );

    // expect(screen.getByLabelText(/You must login/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();

    expect(screen.queryByPlaceholderText('Write your comments...')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Send Comment/i })).not.toBeInTheDocument();
  });

  // Test Case 2: Merender form komentar dan daftar komentar saat login
  test('renders comment form and existing comments when logged in', async () => {
    render(
      <Router>
        <Comment articleUrl={mockArticleUrl} token={mockUserLoggedIn.token} userData={mockUserLoggedIn} />
      </Router>
    );


    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write your comments...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send Comment' })).toBeInTheDocument();
      
      expect(screen.getByText('Komentar pertama dari pengguna lain.')).toBeInTheDocument();
      expect(screen.getByText('Komentar saya sendiri.')).toBeInTheDocument();


      const myComment = screen.getByText('Komentar saya sendiri.');

      expect(myComment.closest('div')).toContainElement(screen.getByTestId('delete-comment-button')); 
      
      const otherComment = screen.getByText('Komentar pertama dari pengguna lain.');
      expect(screen.getByTestId('delete-comment-button'));
    });


    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/comments?news_url=${encodeURIComponent(mockArticleUrl)}`
    );
  });

  // Test Case 3: Mengirim komentar baru
  test('allows logged in user to post a new comment', async () => {
    render(
      <Router>
        <Comment articleUrl={mockArticleUrl} token={mockUserLoggedIn.token} userData={mockUserLoggedIn} />
      </Router>
    );


    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write your comments...')).toBeInTheDocument();
    });

    const commentInput = screen.getByPlaceholderText('Write your comments...');
    const sendButton = screen.getByRole('button', { name: 'Send Comment' });
    
    const newCommentText = 'Ini komentar baru yang keren!';
    fireEvent.change(commentInput, { target: { value: newCommentText } });
    fireEvent.click(sendButton);


    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/comments`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockUserLoggedIn.token}`,
          },
          body: JSON.stringify({ content: newCommentText, news_url: mockArticleUrl }),
        })
      );

      expect(commentInput).toHaveValue('');

      expect(toast.warning).not.toHaveBeenCalled(); 
    });


    await waitFor(() => {
      expect(screen.getByText(newCommentText)).toBeInTheDocument();

      expect(global.fetch).toHaveBeenCalledTimes(3); 
    });
  });

  // Test Case 4: Menampilkan peringatan jika mencoba mengirim komentar kosong
  test('shows a warning if trying to submit an empty comment', async () => {
    render(
      <Router>
        <Comment articleUrl={mockArticleUrl} token={mockUserLoggedIn.token} userData={mockUserLoggedIn} />
      </Router>
    );

    await waitFor(() => {
        expect(screen.getByPlaceholderText('Write your comments...')).toBeInTheDocument();
    });

    const commentInput = screen.getByPlaceholderText('Write your comments...');
    const sendButton = screen.getByRole('button', { name: 'Send Comment' });

    fireEvent.change(commentInput, { target: { value: '   ' } }); 
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith('Comments cannot be empty');
      expect(global.fetch).not.toHaveBeenCalledWith(
        `${API_BASE_URL}/api/comments`,
        expect.any(Object)
      ); 
    });
  });

  // Test Case 5: Menghapus komentar sendiri
  test('allows logged in user to delete their own comment', async () => {
    render(
      <Router>
        <Comment articleUrl={mockArticleUrl} token={mockUserLoggedIn.token} userData={mockUserLoggedIn} />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Komentar saya sendiri.')).toBeInTheDocument();
      expect(screen.getByTestId('delete-comment-button')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTestId('delete-comment-button');
    fireEvent.click(deleteButton);

    // Memastikan modal konfirmasi muncul
    await waitFor(() => {
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete this comment/i)).toBeInTheDocument();
    });

    const confirmDeleteButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/comments/2`, 
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${mockUserLoggedIn.token}`,
          },
        })
      );

      expect(screen.queryByText('Komentar saya sendiri.')).not.toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith('Comment successfully deleted!');
    });
  });

  // Test Case 6: Membatalkan penghapusan komentar
  test('cancels comment deletion when cancel button is clicked in confirm modal', async () => {
    render(
      <Router>
        <Comment articleUrl={mockArticleUrl} token={mockUserLoggedIn.token} userData={mockUserLoggedIn} />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Komentar saya sendiri.')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTestId('delete-comment-button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    });

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument(); // Modal harus tertutup
    });

    expect(screen.getByText('Komentar saya sendiri.')).toBeInTheDocument(); // Komentar masih ada
    expect(global.fetch).not.toHaveBeenCalledWith(
      `${API_BASE_URL}/api/comments/2`, 
      expect.objectContaining({ method: 'DELETE' })
    ); 
  });

  // Test Case 7: Menangani error saat fetch comments
  test('displays error message if fetching comments fails', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch comments'))); 

    render(
      <Router>
        <Comment articleUrl={mockArticleUrl} token={mockUserLoggedIn.token} userData={mockUserLoggedIn} />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to retrieve comments')).toBeInTheDocument();
    });
    expect(screen.queryByText('Komentar pertama dari pengguna lain.')).not.toBeInTheDocument();
  });

  // Test Case 8: Menangani error saat post comment
  test('displays error message if posting comment fails', async () => {

    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      )
      .mockImplementationOnce((url, options) => { 
        if (url === `${API_BASE_URL}/api/comments` && options?.method === 'POST') {
          return Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'Failed to post' }) });
        }
        return Promise.reject(new Error(`Unhandled fetch: ${url}`));
      });

    render(
      <Router>
        <Comment articleUrl={mockArticleUrl} token={mockUserLoggedIn.token} userData={mockUserLoggedIn} />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write your comments...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Write your comments...'), { target: { value: 'Test gagal kirim' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Comment' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to post')).toBeInTheDocument();
    });
  });

  // Test Case 9: Menangani error saat delete comment
  test('displays error message if deleting comment fails', async () => {

    global.fetch
      .mockImplementationOnce(() => 
        Promise.resolve({ ok: true, json: () => Promise.resolve(mockCommentsData) })
      )
      .mockImplementationOnce((url, options) => {
        if (url.startsWith(`${API_BASE_URL}/api/comments/`) && options?.method === 'DELETE') {
          return Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'Delete failed' }) });
        }
        return Promise.reject(new Error(`Unhandled fetch: ${url}`));
      });

    render(
      <Router>
        <Comment articleUrl={mockArticleUrl} token={mockUserLoggedIn.token} userData={mockUserLoggedIn} />
      </Router>
    );

    await waitFor(() => {

      expect(screen.getByTestId('delete-comment-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-comment-button'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-button'));

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
      expect(toast.success).not.toHaveBeenCalled(); 
      expect(window.alert).toHaveBeenCalledWith('Delete failed'); 
    });

    expect(screen.getByText('Komentar saya sendiri.')).toBeInTheDocument(); 
  });
});