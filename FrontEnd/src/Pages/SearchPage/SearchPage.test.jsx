import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import SearchPage from "./SearchPage";
import { API_BASE_URL } from "../../config";

// Mocking useNavigate and useSearchParams from react-router-dom
const mockUseNavigate = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockUseNavigate,
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock komponen NotFound
jest.mock("../../components/NotFound/NotFound", () => {
  return () => <div data-testid="not-found-component">Not Found Component</div>;
});

describe("SearchPage Component", () => {
  // Mock global fetch API
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams({ title: "test" }),
      jest.fn(),
    ]);

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Fungsi helper untuk merender komponen
  const renderComponent = () => {
    return render(
      <Router>
        <SearchPage />
      </Router>
    );
  };

  // Test Case 1: Merender pesan loading pada awalnya
  test("renders loading message initially", () => {
    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByText("Search Result:")).toBeInTheDocument();
  });

  // Test Case 2: Mengambil dan menampilkan hasil pencarian yang berhasil
  test("fetches and displays search results on successful API call", async () => {
    const mockNews = [
      {
        id_news: 1,
        title: "Berita Pertama",
        description: "Deskripsi berita pertama yang menarik.",
        url_photo: "/uploads/photo1.jpg",
        create_at: "2023-01-15T10:00:00Z",
      },
      {
        id_news: 2,
        title: "Berita Kedua",
        description: "Deskripsi berita kedua yang informatif.",
        url_photo: "/uploads/photo2.jpg",
        create_at: "2023-02-20T12:30:00Z",
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNews),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.getByText("Berita Pertama")).toBeInTheDocument();
      expect(screen.getByText("Berita Kedua")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/news/search?title=test`
    );
  });

  // Test Case 3: Menampilkan pesan error jika pengambilan data gagal
  test("displays error message if fetching data fails", async () => {
    const errorMessage = "Failed to retrieve data";
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.queryByText("Berita Pertama")).not.toBeInTheDocument();
  });

  // Test Case 4: Menampilkan komponen NotFound jika tidak ada hasil
  test("displays NotFound component if no results are found", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.getByTestId("not-found-component")).toBeInTheDocument();
    });

    expect(
      screen.queryByText(/Failed to retrieve data/i)
    ).not.toBeInTheDocument();
  });

  // Test Case 5: Tidak melakukan fetch jika judul pencarian kosong
  test("does not fetch if search title is empty", async () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams({ title: "" }),
      jest.fn(),
    ]);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.getByTestId("not-found-component")).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  // Test Case 6: Navigasi ke halaman detail saat item berita diklik
  test("navigates to detail page when a news item is clicked", async () => {
    const mockNews = [
      {
        id_news: 1,
        title: "Berita Clickable",
        description: "Deskripsi berita clickable.",
        url_photo: "/uploads/photo_clickable.jpg",
        create_at: "2023-03-01T08:00:00Z",
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNews),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Berita Clickable")).toBeInTheDocument();
    });

    const newsItem = screen.getByText("Berita Clickable").closest("div");
    fireEvent.click(newsItem);

    expect(mockUseNavigate).toHaveBeenCalledWith("/searchdetail/1", {
      state: { article: mockNews[0] },
    });
  });

  // Test Case 7: Memformat tanggal dengan benar
  test("formats the date correctly", async () => {
    const mockNewsWithDate = [
      {
        id_news: 3,
        title: "Berita Dengan Tanggal",
        description: "Ini berita dengan tanggal yang spesifik.",
        url_photo: "/uploads/photo3.jpg",
        create_at: "2024-06-24T14:30:00Z",
      },
      {
        id_news: 4,
        title: "Berita Tanpa Tanggal",
        description: "Ini berita tanpa tanggal.",
        url_photo: "/uploads/photo4.jpg",
        create_at: null,
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNewsWithDate),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Berita Dengan Tanggal")).toBeInTheDocument();
    });

    const expectedDateString = new Date(
      "2024-06-24T14:30:00Z"
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    expect(screen.getByText(expectedDateString)).toBeInTheDocument();
    expect(screen.getByText("Tanggal tidak tersedia")).toBeInTheDocument();
  });
});
