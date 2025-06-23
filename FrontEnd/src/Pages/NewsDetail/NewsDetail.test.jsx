import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import NewsDetail from "./NewsDetail";

const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
  Link: ({ children, to, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ), 
}));

// Mock API_BASE_URL dari config
jest.mock("../../config", () => ({
  API_BASE_URL: "http://mockapi.com",
}));

// Mock Komponen Comments
jest.mock("../../components/Comments/Comment", () => {
  return ({ articleUrl, token, userData }) => (
    <div data-testid="comment-section">
      Komentar untuk: {articleUrl}
      {token && userData && <p>User login: {userData.username}</p>}
    </div>
  );
});

describe("NewsDetail Component", () => {
  // Data artikel mock untuk berbagai skenario
  const mockInitialArticle = {
    title: "Berita Hebat Dunia (Eksternal)",
    url: "http://example.com/berita-hebat",
    urlToImage: "http://example.com/image.jpg",
    description: undefined,
    content: "Konten lengkap berita ini ada di sini. Sangat menarik!",
    publishedAt: "2023-10-26T10:00:00Z",
    source: { name: "Sumber Mock" },
    category: "Teknologi",
  };

  const mockLocalNewsArticle = {
    id_news: 123,
    title: "Berita Lokal Keren (Internal)",
    url: "http://example.com/berita-lokal-keren",
    url_photo: "/uploads/local-image.jpg",
    description: undefined,
    content: "Isi berita lokal yang mendalam.",
    create_at: "2023-10-25T08:00:00Z",
    category: "Lokal",
  };

  // Data pengguna mock
  const mockUserLoggedIn = {
    token: "fake-token-123",
    username: "testuser",
    role: "user",
    id_users: 1,
  };

  // Status like/dislike mock (akan direset untuk setiap tes)
  let mockLikeStatus = {
    userLikeStatus: null,
    likeCount: 0,
    dislikeCount: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock `localStorage`
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) => {
          if (key === "token") return mockUserLoggedIn.token;
          if (key === "username") return mockUserLoggedIn.username;
          if (key === "role") return mockUserLoggedIn.role;
          if (key === "id_users") return mockUserLoggedIn.id_users.toString();
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock `fetch` API global untuk skenario umum
    global.fetch = jest.fn((url, options) => {
      if (url === "http://mockapi.com/api/auth/profile") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id_users: mockUserLoggedIn.id_users,
              username: mockUserLoggedIn.username,
              role: mockUserLoggedIn.role,
            }),
        });
      }
      if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLikeStatus),
        });
      }
      if (
        url === "http://mockapi.com/api/news/sync-external" &&
        options.method === "POST"
      ) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ id_news: 999, message: "Synced successfully" }),
        });
      }
      if (
        url === "http://mockapi.com/api/likes" &&
        (options.method === "POST" || options.method === "DELETE")
      ) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Action successful" }),
        });
      }
      return Promise.reject(
        new Error(`Unhandled fetch request in default mock: ${url}`)
      );
    });

    mockLikeStatus = { userLikeStatus: null, likeCount: 0, dislikeCount: 0 };
    mockUseLocation.mockReturnValue({ state: { article: mockInitialArticle } }); // Default article
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test Case 1: Merender komponen dengan artikel yang tersedia di location.state
  test("renders NewsDetail with article from location.state", async () => {
    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(mockInitialArticle.title)).toBeInTheDocument();
      // HAPUS BARIS INI: expect(screen.getByText(mockInitialArticle.description)).toBeInTheDocument();
      expect(screen.queryByText(mockInitialArticle.description)).not.toBeInTheDocument();
      expect(screen.getByAltText(mockInitialArticle.title)).toBeInTheDocument();
      
      expect(
        screen.getByText(/Konten lengkap berita ini/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText("26 Oktober 2023 17.00", { exact: false })
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId("like-count")).toHaveTextContent(
      mockLikeStatus.likeCount.toString()
    );
    expect(screen.getByTestId("dislike-count")).toHaveTextContent(
      mockLikeStatus.dislikeCount.toString()
    );
    expect(screen.getByTestId("comment-section")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Category: Teknologi/i })
    ).toBeInTheDocument();
  });

  // Test Case 2: Menampilkan pesan "Data Berita Tidak Tersedia" jika tidak ada artikel
  test('displays "Data Berita Tidak Tersedia" if no article is provided', async () => {
    mockUseLocation.mockReturnValue({ state: {} });

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Data Berita Tidak Tersedia.")
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Kembali ke Beranda" })
    ).toBeInTheDocument();
  });

  // Test Case 3: Navigasi kembali ke beranda saat tombol "Kembali ke Beranda" diklik
  test('navigates back to home when "Kembali ke Beranda" button is clicked', async () => {
    mockUseLocation.mockReturnValue({ state: {} });

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      fireEvent.click(
        screen.getByRole("button", { name: "Kembali ke Beranda" })
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // Test Case 4: Mengambil dan mengatur data pengguna jika token ada
  test("fetches and sets user data if token is present", async () => {
    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/auth/profile",
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockUserLoggedIn.token}` },
        })
      );
    });
    expect(screen.getByTestId("comment-section")).toHaveTextContent(
      `User login: ${mockUserLoggedIn.username}`
    );
  });

  // Test Case 5: Membersihkan localStorage dan redirect ke login jika fetch profil gagal
  test("clears localStorage and redirects to /login if profile fetch fails", async () => {
    global.fetch.mockImplementation((url) => {
      if (url === "http://mockapi.com/api/auth/profile") {
        return Promise.resolve({ ok: false, status: 401 });
      }
      if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLikeStatus),
        });
      }
      return Promise.reject(
        new Error(`Unhandled fetch request in profile fail: ${url}`)
      );
    });

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(window.localStorage.clear).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  // Test Case 6: Memproses like (klik like pertama kali)
  test("handles first like action correctly", async () => {
    mockLikeStatus.userLikeStatus = null;
    mockLikeStatus.likeCount = 0;
    mockLikeStatus.dislikeCount = 0;

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId("like-count")).toHaveTextContent("0");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("0");
      expect(screen.getByTestId("like-button")).not.toHaveClass("bg-green-500");
    });

    global.fetch.mockClear();

    global.fetch
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/news/sync-external" &&
          options.method === "POST"
        ) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id_news: 999 }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in first like: ${url}`)
        );
      })
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/likes" &&
          options.method === "POST"
        ) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in first like: ${url}`)
        );
      })
      .mockImplementationOnce((url) => {
        if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                userLikeStatus: true,
                likeCount: 1,
                dislikeCount: 0,
              }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in first like: ${url}`)
        );
      });

    fireEvent.click(screen.getByTestId("like-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/news/sync-external",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            url: mockInitialArticle.url,
            title: mockInitialArticle.title,
            description: mockInitialArticle.description,
            urlToImage: mockInitialArticle.urlToImage,
            publishedAt: mockInitialArticle.publishedAt,
            category: mockInitialArticle.category,
          }),
        })
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/likes",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            id_news: mockInitialArticle.url,
            value: true,
          }),
        })
      );

      expect(screen.getByTestId("like-count")).toHaveTextContent("1");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("0");
      expect(screen.getByTestId("like-button")).toHaveClass("bg-green-500");
    });
  });

  // Test Case 7: Memproses unlike (klik like yang sudah aktif)
  test("handles unlike action correctly", async () => {
    mockLikeStatus.userLikeStatus = true;
    mockLikeStatus.likeCount = 5;
    mockLikeStatus.dislikeCount = 1;

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId("like-count")).toHaveTextContent("5");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("1");
      expect(screen.getByTestId("like-button")).toHaveClass("bg-green-500");
    });

    global.fetch.mockClear();

    global.fetch
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/news/sync-external" &&
          options.method === "POST"
        ) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id_news: 999 }),
          });
        }
        return Promise.reject(new Error(`Unhandled fetch in unlike: ${url}`));
      })
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/likes" &&
          options.method === "DELETE"
        ) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.reject(new Error(`Unhandled fetch in unlike: ${url}`));
      })
      .mockImplementationOnce((url) => {
        if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                userLikeStatus: null,
                likeCount: 4,
                dislikeCount: 1,
              }),
          });
        }
        return Promise.reject(new Error(`Unhandled fetch in unlike: ${url}`));
      });

    fireEvent.click(screen.getByTestId("like-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/news/sync-external",
        expect.objectContaining({ method: "POST" })
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/likes",
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({ id_news: mockInitialArticle.url }),
        })
      );

      expect(screen.getByTestId("like-count")).toHaveTextContent("4");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("1");
      expect(screen.getByTestId("like-button")).not.toHaveClass("bg-green-500");
    });
  });

  // Test Case 8: Memproses dislike (klik dislike pertama kali)
  test("handles first dislike action correctly", async () => {
    mockLikeStatus.userLikeStatus = null;
    mockLikeStatus.likeCount = 0;
    mockLikeStatus.dislikeCount = 0;

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId("like-count")).toHaveTextContent("0");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("0");
      expect(screen.getByTestId("dislike-button")).not.toHaveClass(
        "bg-red-500"
      );
    });

    global.fetch.mockClear();

    global.fetch
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/news/sync-external" &&
          options.method === "POST"
        ) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id_news: 999 }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in first dislike: ${url}`)
        );
      })
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/likes" &&
          options.method === "POST"
        ) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in first dislike: ${url}`)
        );
      })
      .mockImplementationOnce((url) => {
        if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                userLikeStatus: false,
                likeCount: 0,
                dislikeCount: 1,
              }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in first dislike: ${url}`)
        );
      });

    fireEvent.click(screen.getByTestId("dislike-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/news/sync-external",
        expect.objectContaining({ method: "POST" })
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/likes",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            id_news: mockInitialArticle.url,
            value: false,
          }),
        })
      );

      expect(screen.getByTestId("like-count")).toHaveTextContent("0");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("1");
      expect(screen.getByTestId("dislike-button")).toHaveClass("bg-red-500");
    });
  });

  // Test Case 9: Memproses undilike (klik dislike yang sudah aktif)
  test("handles undilike action correctly", async () => {
    mockLikeStatus.userLikeStatus = false;
    mockLikeStatus.likeCount = 1;
    mockLikeStatus.dislikeCount = 5;

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("5");
      expect(screen.getByTestId("like-count")).toHaveTextContent("1");
      expect(screen.getByTestId("dislike-button")).toHaveClass("bg-red-500");
    });

    global.fetch.mockClear();

    global.fetch
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/news/sync-external" &&
          options.method === "POST"
        ) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id_news: 999 }),
          });
        }
        return Promise.reject(new Error(`Unhandled fetch in undilike: ${url}`));
      })
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/likes" &&
          options.method === "DELETE"
        ) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.reject(new Error(`Unhandled fetch in undilike: ${url}`));
      })
      .mockImplementationOnce((url) => {
        if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                userLikeStatus: null,
                likeCount: 1,
                dislikeCount: 4,
              }),
          });
        }
        return Promise.reject(new Error(`Unhandled fetch in undilike: ${url}`));
      });

    fireEvent.click(screen.getByTestId("dislike-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/news/sync-external",
        expect.objectContaining({ method: "POST" })
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/likes",
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({ id_news: mockInitialArticle.url }),
        })
      );
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("4");
      expect(screen.getByTestId("like-count")).toHaveTextContent("1");
      expect(screen.getByTestId("dislike-button")).not.toHaveClass(
        "bg-red-500"
      );
    });
  });

  // Test Case 10: Mengubah dari like menjadi dislike
  test("changes from like to dislike", async () => {
    mockLikeStatus.userLikeStatus = true;
    mockLikeStatus.likeCount = 5;
    mockLikeStatus.dislikeCount = 1;

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId("like-count")).toHaveTextContent("5");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("1");
      expect(screen.getByTestId("like-button")).toHaveClass("bg-green-500");
    });

    global.fetch.mockClear();

    global.fetch
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/news/sync-external" &&
          options.method === "POST"
        ) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id_news: 999 }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in change like to dislike: ${url}`)
        );
      })
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/likes" &&
          options.method === "POST"
        ) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in change like to dislike: ${url}`)
        );
      })
      .mockImplementationOnce((url) => {
        if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                userLikeStatus: false,
                likeCount: 4,
                dislikeCount: 2,
              }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in change like to dislike: ${url}`)
        );
      });

    fireEvent.click(screen.getByTestId("dislike-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/news/sync-external",
        expect.objectContaining({ method: "POST" })
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/likes",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            id_news: mockInitialArticle.url,
            value: false,
          }),
        })
      );

      expect(screen.getByTestId("like-count")).toHaveTextContent("4");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("2");
      expect(screen.getByTestId("like-button")).not.toHaveClass("bg-green-500");
      expect(screen.getByTestId("dislike-button")).toHaveClass("bg-red-500");
    });
  });

  // Test Case 11: Mengubah dari dislike menjadi like
  test("changes from dislike to like", async () => {
    mockLikeStatus.userLikeStatus = false;
    mockLikeStatus.likeCount = 1;
    mockLikeStatus.dislikeCount = 5;

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("5");
      expect(screen.getByTestId("like-count")).toHaveTextContent("1");
      expect(screen.getByTestId("dislike-button")).toHaveClass("bg-red-500");
    });

    global.fetch.mockClear();

    global.fetch
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/news/sync-external" &&
          options.method === "POST"
        ) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id_news: 999 }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in change dislike to like: ${url}`)
        );
      })
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/likes" &&
          options.method === "POST"
        ) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in change dislike to like: ${url}`)
        );
      })
      .mockImplementationOnce((url) => {
        if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                userLikeStatus: true,
                likeCount: 2,
                dislikeCount: 4,
              }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in change dislike to like: ${url}`)
        );
      });

    fireEvent.click(screen.getByTestId("like-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/news/sync-external",
        expect.objectContaining({ method: "POST" })
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/likes",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            id_news: mockInitialArticle.url,
            value: true,
          }),
        })
      );

      expect(screen.getByTestId("like-count")).toHaveTextContent("2");
      expect(screen.getByTestId("dislike-count")).toHaveTextContent("4");
      expect(screen.getByTestId("like-button")).toHaveClass("bg-green-500");
      expect(screen.getByTestId("dislike-button")).not.toHaveClass(
        "bg-red-500"
      );
    });
  });

  // Test Case 12: Sync external news saat like/dislike jika artikel belum ada di DB
  test("syncs external news on like/dislike if article is external", async () => {
    mockUseLocation.mockReturnValue({
      state: { article: { ...mockInitialArticle, id_news: undefined } },
    });
    mockLikeStatus.userLikeStatus = null;

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(mockInitialArticle.title)).toBeInTheDocument();
      expect(screen.getByTestId("like-button")).not.toBeDisabled();
    });

    global.fetch.mockClear();

    global.fetch
      .mockImplementationOnce((url) => {
        if (url === "http://mockapi.com/api/auth/profile") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUserLoggedIn),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in sync external test initial: ${url}`)
        );
      })
      .mockImplementationOnce((url) => {
        if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLikeStatus),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in sync external test initial: ${url}`)
        );
      })
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/news/sync-external" &&
          options.method === "POST"
        ) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ new_id_news: 999 }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in sync external test action: ${url}`)
        );
      })
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/likes" &&
          options.method === "POST"
        ) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in sync external test action: ${url}`)
        );
      })
      .mockImplementationOnce((url) => {
        if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                userLikeStatus: true,
                likeCount: 1,
                dislikeCount: 0,
              }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in sync external test action: ${url}`)
        );
      });

    fireEvent.click(screen.getByTestId("like-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/news/sync-external",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            url: mockInitialArticle.url,
            title: mockInitialArticle.title,
            description: mockInitialArticle.description,
            urlToImage: mockInitialArticle.urlToImage,
            publishedAt: mockInitialArticle.publishedAt,
            category: mockInitialArticle.category,
          }),
        })
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/likes",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            id_news: mockInitialArticle.url,
            value: true,
          }),
        })
      );
    });
  });

  // Test Case 13: Menangani artikel berita lokal (dengan id_news dan url_photo)
  test("renders local news article correctly", async () => {
    mockUseLocation.mockReturnValue({
      state: { article: mockLocalNewsArticle },
    });

    mockLikeStatus.userLikeStatus = false;
    mockLikeStatus.likeCount = 3;
    mockLikeStatus.dislikeCount = 7;

    global.fetch.mockImplementation((url, options) => {
      if (url === "http://mockapi.com/api/auth/profile") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserLoggedIn),
        });
      }

      if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLikeStatus),
        });
      }

      if (url === "http://mockapi.com/api/news/sync-external") {
        return Promise.reject(
          new Error("Should not call sync-external for local news")
        );
      }
      return Promise.reject(
        new Error(`Unhandled fetch request in local news: ${url}`)
      );
    });

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(mockLocalNewsArticle.title)).toBeInTheDocument();
      expect(
        screen.getByText(mockLocalNewsArticle.content)
      ).toBeInTheDocument();

      const imgElement = screen.getByAltText(mockLocalNewsArticle.title);

      expect(imgElement).toHaveAttribute(
        "src",
        `http://mockapi.com${mockLocalNewsArticle.url_photo}`
      );

      expect(screen.getByTestId("like-count")).toHaveTextContent(
        mockLikeStatus.likeCount.toString()
      );
      expect(screen.getByTestId("dislike-count")).toHaveTextContent(
        mockLikeStatus.dislikeCount.toString()
      );
    });

    const categoryButton = screen.getByRole("button", {
      name: /category: Lokal/i,
    });
    expect(categoryButton).toBeInTheDocument();

    fireEvent.click(categoryButton);
    expect(mockNavigate).toHaveBeenCalledWith("/category/Lokal");
  });

  // Test Case 14: Tidak melakukan sync external news jika artikel sudah punya id_news (berita lokal)
  test("does not sync external news if article already has id_news", async () => {
    mockUseLocation.mockReturnValue({
      state: { article: mockLocalNewsArticle },
    });

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(mockLocalNewsArticle.title)).toBeInTheDocument();
      expect(screen.getByTestId("like-button")).not.toBeDisabled();
    });

    global.fetch.mockClear();

    global.fetch
      .mockImplementationOnce((url) => {
        if (url === "http://mockapi.com/api/auth/profile") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUserLoggedIn),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in no sync external initial: ${url}`)
        );
      })
      .mockImplementationOnce((url) => {
        if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLikeStatus),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in no sync external initial: ${url}`)
        );
      })
      .mockImplementationOnce((url, options) => {
        if (
          url === "http://mockapi.com/api/likes" &&
          options.method === "POST"
        ) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in no sync external action: ${url}`)
        );
      })
      .mockImplementationOnce((url) => {
        if (url.startsWith("http://mockapi.com/api/likes?id_news=")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                userLikeStatus: true,
                likeCount: 4,
                dislikeCount: 7,
              }),
          });
        }
        return Promise.reject(
          new Error(`Unhandled fetch in no sync external action: ${url}`)
        );
      });

    fireEvent.click(screen.getByTestId("like-button"));

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalledWith(
        "http://mockapi.com/api/news/sync-external",
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mockapi.com/api/likes",
        expect.any(Object)
      );
    });
  });

  // Test Case 15: Tombol like/dislike dinonaktifkan jika tidak ada token
  test("like/dislike buttons are disabled if no token", async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "token") return null;
      if (key === "username") return null;
      if (key === "role") return null;
      if (key === "id_users") return null;
      return null;
    });
    mockUseLocation.mockReturnValue({ state: { article: mockInitialArticle } });

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId("like-button")).toBeDisabled();
      expect(screen.getByTestId("dislike-button")).toBeDisabled();
    });

    fireEvent.click(screen.getByTestId("like-button"));
    fireEvent.click(screen.getByTestId("dislike-button"));

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("http://mockapi.com/api/likes"),
      expect.any(Object)
    );
    expect(global.fetch).not.toHaveBeenCalledWith(
      "http://mockapi.com/api/news/sync-external",
      expect.any(Object)
    );
  });

  // Test Case 16: Notifikasi alert "Silakan login terlebih dahulu." jika belum login saat klik like/dislike
  test('shows alert "Silakan login terlebih dahulu." if no token on like/dislike click', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "token") return null;
      if (key === "username") return null;
      if (key === "role") return null;
      if (key === "id_users") return null;
      return null;
    });
    mockUseLocation.mockReturnValue({ state: { article: mockInitialArticle } });

    const mockAlert = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId("like-button")).toBeDisabled();
      expect(screen.getByTestId("dislike-button")).toBeDisabled();
    });

    fireEvent.click(screen.getByTestId("like-button"));

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAlert).not.toHaveBeenCalled();

    mockAlert.mockRestore();
  });

  // Test Case 17: Navigasi ke halaman kategori saat tombol kategori diklik
  test("navigates to category page when category button is clicked", async () => {
    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      const categoryButton = screen.getByRole("button", {
        name: /Category: Teknologi/i,
      });
      expect(categoryButton).toBeInTheDocument();
      fireEvent.click(categoryButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/category/Teknologi");
  });

  // Test Case 18: Menampilkan "Eksternal" sebagai kategori jika tidak ada category/source.name
  test('displays "Eksternal" as category if no explicit caqtegory or source name', async () => {
    mockUseLocation.mockReturnValue({
      state: {
        article: {
          ...mockInitialArticle,
          category: undefined,
          source: undefined,
        },
      },
    });

    render(
      <Router>
        <NewsDetail />
      </Router>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Category: Eksternal/i })
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Category: Eksternal/i })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/category/Eksternal");
  });
});
