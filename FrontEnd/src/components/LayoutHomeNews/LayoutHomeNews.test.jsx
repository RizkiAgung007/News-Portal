import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { NEWS_API_KEY } from "";
import LayoutHomeNews from "./LayoutHomeNews";

jest.mock("../../api", () => ({
  NEWS_API_KEY: "MOCKED_API_KEY_FOR_TESTING", 
}));


const mockNavigate = jest.fn();

// Mock `react-router-dom` (tetap seperti sebelumnya)
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

// Mock komponen Loading dari folder components (tetap seperti sebelumnya)
jest.mock("../../components/Loading/Loading", () => {
  return ({ loading }) => {
    if (loading) {
      return <div data-testid="loader-wrapper">Loading...</div>;
    }
    return null;
  };
});

describe("LayoutHomeNews Component", () => {
  const mockArticle = {
    title: "Judul Berita Utama",
    url: "http://test.com/main-article",
    urlToImage: "http://test.com/main-image.jpg",
    description: "Deskripsi berita utama yang menarik.",
    publishedAt: "2023-10-26T10:00:00Z",
  };

  const mockBreakingArticle = {
    title: "Breaking News Penting",
    url: "http://test.com/breaking-news",
    urlToImage: "http://test.com/breaking-image.jpg",
    description: "Deskripsi singkat breaking news.",
    publishedAt: "2023-10-26T11:00:00Z",
  };

  const mockLatestArticle = {
    title: "Berita Terbaru Hari Ini",
    url: "http://test.com/latest-news",
    urlToImage: "http://test.com/latest-image.jpg",
    description: "Deskripsi singkat berita terbaru.",
    publishedAt: "2023-10-26T12:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url) => {
      // Pastikan mock fetch menggunakan API_KEY yang sama dengan yang di-mock di `src/config/api.js`
      const MOCKED_API_KEY = "MOCKED_API_KEY_FOR_TESTING";

      if (url.includes(`apiKey=${MOCKED_API_KEY}`) && url.includes("q=news")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "ok",
              articles: [
                mockArticle,
                { ...mockArticle, title: "Berita Kecil 1", url: "http://test.com/small1" },
                { ...mockArticle, title: "Berita Kecil 2", url: "http://test.com/small2" },
                { ...mockArticle, title: "Berita Kecil 3", url: "http://test.com/small3" },
                { ...mockArticle, title: "Berita Kecil 4", url: "http://test.com/small4" },
              ],
            }),
        });
      }
      if (url.includes(`apiKey=${MOCKED_API_KEY}`) && url.includes("q=breaking%20news")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "ok",
              articles: [
                mockBreakingArticle,
                { ...mockBreakingArticle, title: "Breaking 2" },
                { ...mockBreakingArticle, title: "Breaking 3" },
                { ...mockBreakingArticle, title: "Breaking 4" },
              ],
            }),
        });
      }
      if (url.includes(`apiKey=${MOCKED_API_KEY}`) && url.includes("q=latest")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "ok",
              articles: [
                mockLatestArticle,
                { ...mockLatestArticle, title: "Latest 2" },
                { ...mockLatestArticle, title: "Latest 3" },
                { ...mockLatestArticle, title: "Latest 4" },
              ],
            }),
        });
      }
      return Promise.reject(new Error(`Unknown fetch URL or API Key mismatch: ${url}`));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test Case 1: Menampilkan loading state saat mengambil data
  test("Menampilkan loading state saat mengambil data", () => {
    render(
      <Router>
        <LayoutHomeNews />
      </Router>
    );
    expect(screen.getByTestId("loader-wrapper")).toBeInTheDocument();
  });

  // Test Case 2: Menampilkan berita utama, berita kecil, breaking news, dan latest news setelah data dimuat
  test("Menampilkan berita utama, berita kecil, breaking news, dan latest news setelah data dimuat", async () => {
    render(
      <Router>
        <LayoutHomeNews />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("loader-wrapper")).not.toBeInTheDocument();
    });

    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    expect(screen.getByText(mockArticle.description)).toBeInTheDocument();
    expect(screen.getAllByText("Read More...")[0]).toBeInTheDocument();

    expect(screen.getByText("Berita Kecil 1")).toBeInTheDocument();
    expect(screen.getByText("Berita Kecil 2")).toBeInTheDocument();
    expect(screen.getByText("Berita Kecil 3")).toBeInTheDocument();
    expect(screen.getByText("Berita Kecil 4")).toBeInTheDocument();

    expect(screen.getByText("Breaking News")).toBeInTheDocument();
    expect(screen.getByText(mockBreakingArticle.title)).toBeInTheDocument();

    expect(screen.getByText("Latest News")).toBeInTheDocument();
    expect(screen.getByText(mockLatestArticle.title)).toBeInTheDocument();
  });

  // Test Case 3: Menampilkan pesan error jika fetching data gagal
  test("Menampilkan pesan error jika fetching data gagal", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );

    render(
      <Router>
        <LayoutHomeNews />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load news.")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("loader-wrapper")).not.toBeInTheDocument();
  });

  // Test Case 4: Memanggil navigate dengan URL yang benar saat artikel utama diklik
  test("Memanggil navigate dengan URL yang benar saat artikel utama diklik", async () => {
    render(
      <Router>
        <LayoutHomeNews />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("loader-wrapper")).not.toBeInTheDocument();
    });

    const mainArticleElement = screen.getByText(mockArticle.title);
    fireEvent.click(mainArticleElement);

    expect(mockNavigate).toHaveBeenCalledWith(
      `/news/${encodeURIComponent(mockArticle.url)}`,
      { state: { article: mockArticle } }
    );
  });

  // Test Case 5: Memanggil navigate dengan URL yang benar saat artikel kecil diklik
  test("Memanggil navigate dengan URL yang benar saat artikel kecil diklik", async () => {
    render(
      <Router>
        <LayoutHomeNews />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("loader-wrapper")).not.toBeInTheDocument();
    });

    const smallArticleElement = screen.getByText("Berita Kecil 1");
    fireEvent.click(smallArticleElement);

    const clickedSmallArticle = {
      ...mockArticle,
      title: "Berita Kecil 1",
      url: "http://test.com/small1",
    };

    expect(mockNavigate).toHaveBeenCalledWith(
      `/news/${encodeURIComponent(clickedSmallArticle.url)}`,
      { state: { article: clickedSmallArticle } }
    );
  });

  // Test Case 6: Memanggil navigate dengan URL yang benar saat breaking news diklik
  test("Memanggil navigate dengan URL yang benar saat breaking news diklik", async () => {
    render(
      <Router>
        <LayoutHomeNews />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("loader-wrapper")).not.toBeInTheDocument();
    });

    const breakingArticleElement = screen.getByText(mockBreakingArticle.title);
    fireEvent.click(breakingArticleElement);

    expect(mockNavigate).toHaveBeenCalledWith(
      `/news/${encodeURIComponent(mockBreakingArticle.url)}`,
      { state: { article: mockBreakingArticle } }
    );
  });

  // Test Case 7: Memanggil navigate dengan URL yang benar saat latest news diklik
  test("Memanggil navigate dengan URL yang benar saat latest news diklik", async () => {
    render(
      <Router>
        <LayoutHomeNews />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("loader-wrapper")).not.toBeInTheDocument();
    });

    const latestArticleElement = screen.getByText(mockLatestArticle.title);
    fireEvent.click(latestArticleElement);

    expect(mockNavigate).toHaveBeenCalledWith(
      `/news/${encodeURIComponent(mockLatestArticle.url)}`,
      { state: { article: mockLatestArticle } }
    );
  });
});