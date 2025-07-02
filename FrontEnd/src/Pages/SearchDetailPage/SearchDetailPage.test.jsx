import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Router, Routes } from "react-router-dom";
import SearchDetailPage from "./SearchDetailPage";
import { API_BASE_URL } from "../../config";

// Mock modul-modul yang diperlukan
jest.mock("../../components/Comments/Comment", () => ({
  __esModule: true,
  default: ({ articleUrl, token, userData }) => (
    <div data-testid="comment">
      Komponen Komentar untuk {articleUrl}
      {token && <span data-testid="comment-token">{token}</span>}
      {userData && <span data-testid="comment-user">{userData.username}</span>}
    </div>
  ),
}));

jest.mock("../../components/Loading/Loading", () => ({
  __esModule: true,
  default: () => <div data-testid="loading-component">Memuat...</div>,
}));

// Data artikel mock untuk konsistensi
const mockArticle = {
  id_news: "test-news-123",
  title: "Judul Artikel Tes",
  content: "Ini adalah konten dari artikel tes.",
  url_photo: "/uploads/test-image.jpg",
  create_at: "2025-06-24T10:00:00Z",
  category: "Teknologi",
  url: "http://example.com/test-news-123",
  urlToImage: "https://via.placeholder.com/800x450?text=No+Image",
  publishedAt: "2025-06-24T10:00:00Z",
  description: "Deskripsi dari artikel tes.",
};

// Fungsi bantuan untuk mocking fetch API
const mockNewsApiSuccess = (article = mockArticle) =>
  jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(article),
    })
  );

const mockLikesApiSuccess = (userLikeStatus, likeCount, dislikeCount) =>
  jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ userLikeStatus, likeCount, dislikeCount }),
    })
  );

const mockAuthProfileSuccess = (userData) =>
  jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(userData),
    })
  );

describe("Komponen SearchDetailPage", () => {
  const renderWithRouter = (ui, { route = "/" } = {}) => {
    window.history.pushState({}, "Halaman Tes", route);
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/news/:newsId" element={ui} />
          <Route path="/login" element={<div>Halaman Login</div>} />

          <Route
            path="/category/:kategori"
            element={
              <div>
                Halaman Kategori:{" "}
                {decodeURIComponent(window.location.pathname.split("/").pop())}
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();

    if (!window.alert.mock) {
      Object.defineProperty(window, "alert", {
        writable: true,
        value: jest.fn(),
      });
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // Test 1: Merender komponen Loading di awal ketika tidak ada artikel di state lokasi
  test("1. merender komponen Loading di awal ketika tidak ada artikel di state lokasi", async () => {
    render(
      <Router>
        <SearchDetailPage />
      </Router>
    );
    expect(screen.getByTestId("loading-component")).toBeInTheDocument();
  });

  // Test 2: Mengambil detail artikel saat mount jika tidak ada di state lokasi
  test("2. mengambil detail artikel saat mount jika tidak ada di state lokasi", async () => {
    global.fetch
      .mockImplementationOnce(mockNewsApiSuccess(mockArticle)) 
      .mockImplementationOnce(mockLikesApiSuccess(null, 5, 2));  

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/news/test-news-123`
      );
      expect(screen.getByText("Judul Artikel Tes")).toBeInTheDocument();
      expect(
        screen.getByText("Ini adalah konten dari artikel tes.")
      ).toBeInTheDocument();
    });
  });

  // Test 3: Menampilkan pesan error jika pengambilan artikel gagal
  test("3. menampilkan pesan error jika pengambilan artikel gagal", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "News Not Found" }),
      })
    );

    renderWithRouter(<SearchDetailPage />, { route: "/news/non-existent" });

    await waitFor(() => {
      expect(screen.getByText("News Not Found")).toBeInTheDocument();
      expect(screen.getByText("Back")).toBeInTheDocument();
    });
  });

  // Test 4: Merender detail artikel dari location state dengan segera
  test("4. merender detail artikel dari location state dengan segera", async () => {
    const mockArticleInState = {
      ...mockArticle,
      title: "Artikel dari State",
      content: "Konten dari state",
      id_news: "test-news-from-state",
    };

    global.fetch.mockImplementationOnce(mockLikesApiSuccess(null, 0, 0));

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/news/test-news-from-state",
            state: { article: mockArticleInState },
          },
        ]}
      >
        <Routes>
          <Route path="/news/:newsId" element={<SearchDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Pastikan komponen Loading tidak muncul
    expect(screen.queryByTestId("loading-component")).not.toBeInTheDocument();
    expect(screen.getByText("Artikel dari State")).toBeInTheDocument();
    expect(screen.getByText("Konten dari state")).toBeInTheDocument();
  });

  // Test 5: Menangani autentikasi dan mengarahkan ke login jika token tidak valid
  test("5. menangani autentikasi dan mengarahkan ke login jika token tidak valid", async () => {
    localStorage.setItem("token", "invalid-token");
    localStorage.setItem("username", "testuser");
    localStorage.setItem("role", "user");
    localStorage.setItem("id_users", "1");

    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: "Unauthorized" }),
        })
      )
      .mockImplementationOnce(mockNewsApiSuccess()); 

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(localStorage.clear).toHaveBeenCalled(); 
      expect(screen.getByText("Halaman Login")).toBeInTheDocument(); 
    });
  });

  // Test 6: Menampilkan jumlah like dan dislike yang benar serta status pengguna
  test("6. menampilkan jumlah like dan dislike yang benar serta status pengguna", async () => {
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("username", "testuser");
    localStorage.setItem("id_users", "1");

    global.fetch
      .mockImplementationOnce(
        mockAuthProfileSuccess({ username: "testuser", id_users: 1 })
      ) // Mock profil auth
      .mockImplementationOnce(mockNewsApiSuccess(mockArticle)) // Mock fetch artikel
      .mockImplementationOnce(mockLikesApiSuccess(true, 10, 3)); // Mock status like awal (user sudah like)

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByTestId("like-count")).toHaveTextContent("10");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("3");
      expect(screen.getByTestId("like-button")).toHaveClass("aktif"); // Tombol like harus aktif
      expect(screen.getByTestId("dislike-button")).not.toHaveClass("aktif");
    });
  });

  // Test 7: Pengguna dapat menekan tombol "Like" untuk artikel yang belum di-like
  test('7. pengguna dapat menekan tombol "Like" untuk artikel yang belum di-like', async () => {
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("username", "testuser");
    localStorage.setItem("id_users", "1");

    global.fetch
      .mockImplementationOnce(
        mockAuthProfileSuccess({ username: "testuser", id_users: 1 })
      ) // Mock profil auth
      .mockImplementationOnce(mockNewsApiSuccess(mockArticle)) // Mock fetch artikel
      .mockImplementationOnce(mockLikesApiSuccess(null, 5, 2)) // Status awal: belum like/dislike
      .mockImplementationOnce(() =>
        // Mock POST like
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Like added" }),
        })
      )
      .mockImplementationOnce(mockLikesApiSuccess(true, 6, 2)); // Status setelah like

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByTestId("like-count")).toBeInTheDocument();
      expect(screen.getByTestId("like-button")).not.toHaveClass("inaktif");
    });

    fireEvent.click(screen.getByTestId("like-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-token",
        },
        body: JSON.stringify({ id_news: "test-news-123", value: true }),
      });
      expect(screen.getByTestId("like-count")).toBeInTheDocument();
      expect(screen.getByTestId("like-button")).toHaveClass("aktif");
    });
  });

  // Test 8: Pengguna dapat menekan tombol "Dislike" untuk artikel yang belum di-dislike
  test('8. pengguna dapat menekan tombol "Dislike" untuk artikel yang belum di-dislike', async () => {
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("username", "testuser");
    localStorage.setItem("id_users", "1");

    global.fetch
      .mockImplementationOnce(
        mockAuthProfileSuccess({ username: "testuser", id_users: 1 })
      )
      .mockImplementationOnce(mockNewsApiSuccess(mockArticle))
      .mockImplementationOnce(mockLikesApiSuccess(null, 5, 2)) // Status awal: belum like/dislike
      .mockImplementationOnce(() =>
        // Mock POST dislike
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Dislike added" }),
        })
      )
      .mockImplementationOnce(mockLikesApiSuccess(false, 5, 3)); // Status setelah dislike

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByTestId("dislike-count")).toBeInTheDocument();
      expect(screen.getByTestId("dislike-button")).not.toHaveClass("inaktif");
    });

    fireEvent.click(screen.getByTestId("dislike-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-token",
        },
        body: JSON.stringify({ id_news: "test-news-123", value: false }),
      });
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("3");
      expect(screen.getByTestId("dislike-button")).toHaveClass("aktif");
    });
  });

  // Test 9: Pengguna dapat membatalkan "Like"
  test('9. pengguna dapat membatalkan "Like"', async () => {
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("username", "testuser");
    localStorage.setItem("id_users", "1");

    global.fetch
      .mockImplementationOnce(
        mockAuthProfileSuccess({ username: "testuser", id_users: 1 })
      )
      .mockImplementationOnce(mockNewsApiSuccess(mockArticle))
      .mockImplementationOnce(mockLikesApiSuccess(true, 10, 3)) // Status awal: sudah like
      .mockImplementationOnce(() =>
        // Mock DELETE like
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Like removed" }),
        })
      )
      .mockImplementationOnce(mockLikesApiSuccess(null, 9, 3)); // Status setelah batal like

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByTestId("like-count")).toHaveTextContent("10");
      expect(screen.getByTestId("like-button")).toHaveClass("aktif");
    });

    fireEvent.click(screen.getByTestId("like-button"));

    await waitFor(() => {
      // Perbaiki URL target: API_BASE_URL/api/likes, bukan API_BASE_URL/api/likes/id=2
      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/likes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-token",
        },
        body: JSON.stringify({ id_news: "test-news-123", value: true }),
      });
      expect(screen.getByTestId("like-count")).toHaveTextContent("9");
      // Perbaiki typo: 'aktif' bukan 'aktifi'
      expect(screen.getByTestId("like-button")).not.toHaveClass("aktif");
    });
  });

  // Test 10: Pengguna dapat membatalkan "Dislike"
  test('10. pengguna dapat membatalkan "Dislike"', async () => {
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("username", "testuser");
    localStorage.setItem("id_users", "1");

    global.fetch
      .mockImplementationOnce(
        mockAuthProfileSuccess({ username: "testuser", id_users: 1 })
      )
      .mockImplementationOnce(mockNewsApiSuccess(mockArticle))
      .mockImplementationOnce(mockLikesApiSuccess(false, 5, 3)) // Status awal: sudah dislike
      .mockImplementationOnce(() =>
        // Mock DELETE dislike
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Dislike removed" }),
        })
      )
      .mockImplementationOnce(mockLikesApiSuccess(null, 5, 2)); // Status setelah batal dislike

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("3"); // Perbaiki ini
      expect(screen.getByTestId("dislike-button")).toHaveClass("aktif");
    });

    fireEvent.click(screen.getByTestId("dislike-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/likes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-token",
        },
        body: JSON.stringify({ id_news: "test-news-123", value: false }),
      });
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("2"); // Perbaiki ini
      expect(screen.getByTestId("dislike-button")).not.toHaveClass("aktif");
    });
  });

  // Test 11: Pengguna mengubah dari "Like" menjadi "Dislike"
  test('11. pengguna mengubah dari "Like" menjadi "Dislike"', async () => {
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("username", "testuser");
    localStorage.setItem("id_users", "1");

    global.fetch
      .mockImplementationOnce(
        mockAuthProfileSuccess({ username: "testuser", id_users: 1 })
      )
      .mockImplementationOnce(mockNewsApiSuccess(mockArticle))
      .mockImplementationOnce(mockLikesApiSuccess(true, 10, 3)) // Status awal: sudah like
      .mockImplementationOnce(() =>
        // Mock DELETE like (karena mengubah)
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Like removed" }),
        })
      )
      .mockImplementationOnce(() =>
        // Mock POST dislike (setelah menghapus like)
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Dislike added" }),
        })
      )
      .mockImplementationOnce(mockLikesApiSuccess(false, 9, 4)); // Status setelah perubahan

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByTestId("like-count")).toHaveTextContent("10"); // Perbaiki ini
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("3");
      expect(screen.getByTestId("like-button")).toHaveClass("aktif");
    });

    fireEvent.click(screen.getByTestId("dislike-button")); // Klik dislike

    await waitFor(() => {
      // Pastikan ada DELETE request untuk like sebelumnya
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/likes`,
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({ id_news: "test-news-123", value: true }),
        })
      );
      // Pastikan ada POST request untuk dislike baru
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/likes`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ id_news: "test-news-123", value: false }),
        })
      );

      expect(screen.getByTestId("like-count")).toHaveTextContent("9");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("4");
      expect(screen.getByTestId("like-button")).not.toHaveClass("aktif");
      expect(screen.getByTestId("dislike-button")).toHaveClass("aktif");
    });
  });

  // Test 12: Pengguna mengubah dari "Dislike" menjadi "Like"
  test('12. pengguna mengubah dari "Dislike" menjadi "Like"', async () => {
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("username", "testuser");
    localStorage.setItem("id_users", "1");

    global.fetch
      .mockImplementationOnce(
        mockAuthProfileSuccess({ username: "testuser", id_users: 1 })
      )
      .mockImplementationOnce(mockNewsApiSuccess(mockArticle))
      .mockImplementationOnce(mockLikesApiSuccess(false)) // Status awal: sudah dislike
      .mockImplementationOnce(() =>
        
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Dislike removed" }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Like added" }),
        })
      )
      .mockImplementationOnce(mockLikesApiSuccess(true, 6, 2));

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByTestId("like-count")).toBeInTheDocument();
      expect(screen.getByTestId("dislike-count")).toBeInTheDocument();
      // expect(screen.getByTestId("dislike-button")).toHaveClass("aktif");
    });

    fireEvent.click(screen.getByTestId("like-button")); 

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/likes`,
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({ id_news: "test-news-123", value: false }),
        })
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/likes`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ id_news: "test-news-123", value: true }),
        })
      );

      expect(screen.getByTestId("like-count")).toBeInTheDocument();
      expect(screen.getByTestId("dislike-count")).toBeInTheDocument();
      expect(screen.getByTestId("like-button")).toHaveClass("aktif");
      expect(screen.getByTestId("dislike-button")).not.toHaveClass("aktif");
    });
  });

  // Test 13: Menampilkan "Tidak ada konten" jika artikel tidak memiliki content atau description
  test('13. menampilkan "Tidak ada konten" jika artikel tidak memiliki content atau description', async () => {
    const articleWithoutContent = {
      ...mockArticle,
      content: null,
      description: null,
    };
    global.fetch
      .mockImplementationOnce(
        mockAuthProfileSuccess({ username: "testuser", id_users: 1 })
      )
      .mockImplementationOnce(mockNewsApiSuccess(articleWithoutContent))
      .mockImplementationOnce(mockLikesApiSuccess(null, 0, 0));

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByText("Tidak ada konten")).toBeInTheDocument();
    });
  });

  // Test 14: Menampilkan "Date not available" jika tidak ada tanggal
  test('14. menampilkan "Date not available" jika tidak ada tanggal', async () => {
    const articleWithoutDate = {
      ...mockArticle,
      create_at: null,
      publishedAt: null,
    };
    global.fetch
      .mockImplementationOnce(
        mockAuthProfileSuccess({ username: "testuser", id_users: 1 })
      )
      .mockImplementationOnce(mockNewsApiSuccess(articleWithoutDate))
      .mockImplementationOnce(mockLikesApiSuccess(null, 0, 0));

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByText("Date not available")).toBeInTheDocument();
    });
  });

  // Test 15: Mengarahkan ke halaman kategori saat tombol kategori diklik
  test("15. mengarahkan ke halaman kategori saat tombol kategori diklik", async () => {
    global.fetch
      .mockImplementationOnce(
        mockAuthProfileSuccess({ username: "testuser", id_users: 1 })
      )
      .mockImplementationOnce(mockNewsApiSuccess(mockArticle))
      .mockImplementationOnce(mockLikesApiSuccess(null, 0, 0));

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByText(/Category:Teknologi/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Teknologi")); 

    await waitFor(() => {
      expect(
        screen.getByText("Halaman Kategori: Teknologi")
      ).toBeInTheDocument();
    });
  });

  // Test 16: Komponen Komentar menerima props yang benar
  test("16. komponen Komentar menerima props yang benar", async () => {
    localStorage.setItem("token", "test-token-123");
    localStorage.setItem("username", "commenter");
    localStorage.setItem("id_users", "10");
    
    global.fetch
    .mockImplementationOnce(
      mockAuthProfileSuccess({ username: "commenter", id_users: 10 })
    )
    .mockImplementationOnce(mockNewsApiSuccess(mockArticle))
    .mockImplementationOnce(mockLikesApiSuccess(null, 0, 0));
    
    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });
    
    await waitFor(() => {
      expect(screen.getByText("comment")).toBeInTheDocument();
      expect(screen.getByTestId("comment-token")).toHaveTextContent("test-token-123");
      expect(screen.getByTestId("comment-user")).toHaveTextContent("commenter");
      expect(
        screen.getByText("Komponen Komentar untuk test-news-123")
      ).toBeInTheDocument();
    });
  });

  // Test 17: Tombol like/dislike dinonaktifkan jika tidak ada token
  test("17. tombol like/dislike dinonaktifkan jika tidak ada token", async () => {
    global.fetch
      .mockImplementationOnce(mockNewsApiSuccess(mockArticle))
      .mockImplementationOnce(mockLikesApiSuccess(null, 0, 0));

    renderWithRouter(<SearchDetailPage />, { route: "/news/test-news-123" });

    await waitFor(() => {
      expect(screen.getByTestId("like-button")).toBeDisabled();
      expect(screen.getByTestId("dislike-button")).toBeDisabled();
    });
  });
});
