import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import CategoriesBar from "./CategoriesBar";
import { API_BASE_URL } from "../../config";
import { toast } from "react-toastify";

// Mocking toast dari react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mocking useNavigate dan NavLink dari react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  NavLink: ({ children, to, className, onClick, ...rest }) => {
    const actualReactRouterDom = jest.requireActual("react-router-dom");
    const { pathname } = actualReactRouterDom.useLocation();
    const isActive = pathname === to;

    return (
      <a
        href={to}
        onClick={(e) => {
          if (onClick) onClick(e);
          mockNavigate(to);
        }}
        className={
          typeof className === "function" ? className({ isActive }) : className
        }
        {...rest}
      >
        {children}
      </a>
    );
  },
  useLocation: jest.fn(() => ({ pathname: "/" })), 
}));

describe("CategoriesBar Component", () => {
  // Mock global fetch API
  beforeEach(() => {
    jest.clearAllMocks(); 
    global.fetch = jest.fn(); 
    toast.error.mockClear(); 
    mockNavigate.mockClear(); 
    jest.spyOn(require("react-router-dom"), "useLocation").mockReturnValue({ pathname: "/" }); // Reset useLocation mock
  });

  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  // Test Case 1: Merender pesan loading pada awalnya
  test("renders loading message initially", () => {
    render(
      <Router>
        <CategoriesBar />
      </Router>
    );
    expect(screen.getByText("Loading categories. . .")).toBeInTheDocument();
  });

  // Test Case 2: Mengambil dan menampilkan kategori pada panggilan API yang berhasil
  test("fetches and displays categories on successful API call", async () => {
    const mockCategories = ["Fiction", "Science", "History"];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    });

    render(
      <Router>
        <CategoriesBar />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading categories. . .")).not.toBeInTheDocument();
    });

    for (const category of mockCategories) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }

    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/category/public/all`);
  });

  // Test Case 3: Menampilkan toast error pada panggilan API yang gagal
  test("displays error toast on failed API call", async () => {
    const errorMessage = "Failed to fetch category list";
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    render(
      <Router>
        <CategoriesBar />
      </Router>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    expect(screen.queryByText("Loading categories. . .")).not.toBeInTheDocument();
    expect(screen.queryByText("Fiction")).not.toBeInTheDocument();
  });

  // Test Case 4: Menangani navigasi ke halaman kategori saat tautan kategori diklik
  test("handles navigation to category page when a category link is clicked", async () => {
    const mockCategories = ["Fiction", "Science"];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    });

    render(
      <Router>
        <CategoriesBar />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText("Fiction")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Fiction"));
    expect(mockNavigate).toHaveBeenCalledWith("/category/fiction");
  });

  // Test Case 5: Menerapkan kelas aktif ke tautan kategori saat ini
  test("applies active class to the current category link", async () => {
    const mockCategories = ["Fiction", "Science"];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    });

    jest.spyOn(require("react-router-dom"), "useLocation").mockReturnValue({ pathname: "/category/science" });

    render(
      <Router>
        <CategoriesBar />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText("Science")).toBeInTheDocument();
    });

    expect(screen.getByText("Science")).toHaveClass("aktif");
    expect(screen.getByText("Fiction")).not.toHaveClass("bg-green-600");
  });

  // Test Case 6: Mengkapitalisasi huruf pertama setiap kategori
  test("capitalizes the first letter of each category", async () => {
    const mockCategories = ["fiction", "science", "history"];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    });

    render(
      <Router>
        <CategoriesBar />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText("Fiction")).toBeInTheDocument();
      expect(screen.getByText("Science")).toBeInTheDocument();
      expect(screen.getByText("History")).toBeInTheDocument();
    });
  });
});
