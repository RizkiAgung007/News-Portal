import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./Navbar"; 

const mockNavigate = jest.fn();
const mockToggleTheme = jest.fn();

// Mock `react-router-dom` useNavigate, Link, NavLink, dan useLocation
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, onClick, ...rest }) => (
    <a
      href={to}
      onClick={(e) => {
        if (onClick) onClick(e);
        mockNavigate(to); 
      }}
      {...rest}
    >
      {children}
    </a>
  ),
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

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockToggleTheme.mockClear();

    // Reset mock useLocation untuk setiap test
    require("react-router-dom").useLocation.mockClear();
    require("react-router-dom").useLocation.mockReturnValue({ pathname: "/" });

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) => {
          if (key === "username") return null;
          if (key === "role") return null;
          if (key === "theme") return "light";
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  // Test Case 1: Komponen merender dengan benar
  test("merender elemen dasar navbar dengan benar", () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    // expect(screen.getByText(/PortalBerita/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search News...")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle menu")).toContainElement(
      screen.getByTestId("open-menu-icon")
    );
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Avatar")).toBeInTheDocument();
  });

  // Test Case 2: Fungsionalitas Pencarian 
  test("melakukan pencarian saat ikon pencarian diklik", () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText("Search News...");
    const searchIcon = screen.getByTestId("cisearch-icon");

    fireEvent.change(searchInput, { target: { value: "teknologi" } });
    fireEvent.click(searchIcon);

    expect(mockNavigate).toHaveBeenCalledWith("/search?title=teknologi");
    expect(searchInput).toHaveValue("");
  });

  test("melakukan pencarian saat tombol Enter ditekan di input pencarian", () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText("Search News...");

    fireEvent.change(searchInput, { target: { value: "ekonomi" } });
    fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith("/search?title=ekonomi");
    expect(searchInput).toHaveValue("");
  });

  test("tidak melakukan pencarian jika input kosong", () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText("Search News...");
    const searchIcon = screen.getByTestId("cisearch-icon");

    fireEvent.change(searchInput, { target: { value: "   " } });
    fireEvent.click(searchIcon);

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(searchInput).toHaveValue("   ");
  });

  // Test Case 3: Tombol Tema 
  test("mengganti tema saat tombol tema diklik (desktop)", () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const themeToggleButton = screen.getByTestId("desktop-toggle-theme-button"); 

    fireEvent.click(themeToggleButton);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  // Test Case 4: Menu Avatar (Desktop) 
  test("menampilkan dan menyembunyikan menu avatar saat ikon diklik (tidak login)", async () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const avatarIcon = screen.getByLabelText("Avatar");

    expect(screen.queryByTestId("desktop-avatar-menu")).not.toBeInTheDocument();

    fireEvent.click(avatarIcon);
    await waitFor(() => {
      expect(screen.getByTestId("desktop-avatar-menu")).toBeInTheDocument();
      expect(screen.getByTestId("desktop-login-button")).toBeInTheDocument();
    });

    fireEvent.click(avatarIcon);
    await waitFor(() => {
      expect(screen.queryByTestId("desktop-avatar-menu")).not.toBeInTheDocument();
    });
  });

  test("menampilkan menu avatar dengan opsi Login jika belum login", async () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const avatarIcon = screen.getByLabelText("Avatar");
    fireEvent.click(avatarIcon);

    await waitFor(() => {
      const loginButton = screen.getByTestId("desktop-login-button");
      expect(loginButton).toBeInTheDocument();
      expect(screen.queryByTestId("desktop-dashboard-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("desktop-profile-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("desktop-logout-button")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("desktop-login-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("menampilkan menu avatar dengan opsi Dashboard, Profile, Logout jika sudah login (admin)", async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "username") return "TestAdmin";
      if (key === "role") return "admin";
      return null;
    });

    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const avatarIcon = screen.getByLabelText("Avatar");
    fireEvent.click(avatarIcon);

    await waitFor(() => {
      expect(screen.getByTestId("desktop-dashboard-button")).toBeInTheDocument();
      expect(screen.getByTestId("desktop-profile-button")).toBeInTheDocument();
      expect(screen.getByTestId("desktop-logout-button")).toBeInTheDocument();
      expect(screen.queryByTestId("desktop-login-button")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("desktop-dashboard-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
  });

  test("melakukan logout saat tombol logout diklik di menu avatar", async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "username") return "TestUser";
      if (key === "role") return "user";
      return null;
    });

    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const avatarIcon = screen.getByLabelText("Avatar");
    fireEvent.click(avatarIcon);

    await waitFor(() => {
      expect(screen.getByTestId("desktop-logout-button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("desktop-logout-button"));

    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("username");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("role");
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("menutup menu avatar saat mengklik di luar", async () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const avatarIcon = screen.getByLabelText("Avatar");
    fireEvent.click(avatarIcon);

    await waitFor(() => {
      expect(screen.getByTestId("desktop-avatar-menu")).toBeInTheDocument();
    });

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByTestId("desktop-avatar-menu")).not.toBeInTheDocument();
    });
  });

  // Test Case 5: Menu Mobile (Hamburger) 
  test("menampilkan dan menyembunyikan menu mobile saat ikon hamburger diklik", async () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const hamburgerButton = screen.getByLabelText("Toggle menu");

    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    expect(screen.getByTestId("open-menu-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("close-menu-icon")).not.toBeInTheDocument();

    fireEvent.click(hamburgerButton);

    await waitFor(() => {
      expect(screen.getByTestId("mobile-menu")).toBeInTheDocument(); 
      expect(screen.getByTestId("mobile-about-us-link")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-contact-link")).toBeInTheDocument();
      expect(screen.queryByTestId("open-menu-icon")).not.toBeInTheDocument();
      expect(screen.getByTestId("close-menu-icon")).toBeInTheDocument();
    });

    fireEvent.click(hamburgerButton);

    await waitFor(() => {
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument(); 
      expect(screen.queryByTestId("mobile-about-us-link")).not.toBeInTheDocument();
      expect(screen.queryByTestId("mobile-contact-link")).not.toBeInTheDocument();
      expect(screen.getByTestId("open-menu-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("close-menu-icon")).not.toBeInTheDocument();
    });
  });

  test("menu mobile: opsi Login jika belum login", async () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    fireEvent.click(screen.getByLabelText("Toggle menu"));

    await waitFor(() => {
      const loginLink = screen.getByTestId("mobile-login-link");
      expect(loginLink).toBeInTheDocument();
      expect(screen.queryByTestId("mobile-dashboard-link")).not.toBeInTheDocument();
      expect(screen.queryByTestId("mobile-profile-link")).not.toBeInTheDocument();
      expect(screen.queryByTestId("mobile-logout-button")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mobile-login-link"));
    expect(mockNavigate).toHaveBeenCalledWith("/login");

    await waitFor(() => {
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });
  });

  test("menu mobile: opsi Dashboard, Profile, Ganti Tema, Logout jika sudah login (user biasa)", async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "username") return "TestUser";
      if (key === "role") return "user";
      return null;
    });

    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    fireEvent.click(screen.getByLabelText("Toggle menu"));

    await waitFor(() => {
      expect(screen.queryByTestId("mobile-dashboard-link")).not.toBeInTheDocument();
      expect(screen.getByTestId("mobile-profile-link")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-change-theme-button")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-logout-button")).toBeInTheDocument();
      expect(screen.queryByTestId("mobile-login-link")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mobile-profile-link"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile");

    await waitFor(() => {
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });
  });

  test("menu mobile: opsi Dashboard (admin), Profile, Ganti Tema, Logout jika sudah login (admin)", async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "username") return "TestAdmin";
      if (key === "role") return "admin";
      return null;
    });

    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    fireEvent.click(screen.getByLabelText("Toggle menu"));

    await waitFor(() => {
      expect(screen.getByTestId("mobile-dashboard-link")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-profile-link")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-change-theme-button")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-logout-button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mobile-dashboard-link"));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");

    await waitFor(() => {
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });
  });

  test("melakukan logout saat tombol logout diklik di menu mobile", async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "username") return "TestUser";
      if (key === "role") return "user";
      return null;
    });

    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    fireEvent.click(screen.getByLabelText("Toggle menu"));

    await waitFor(() => {
      expect(screen.getByTestId("mobile-logout-button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mobile-logout-button"));

    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("username");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("role");
    expect(mockNavigate).toHaveBeenCalledWith("/login");

    await waitFor(() => {
      expect(screen.queryByTestId("mobile-menu")).toBeInTheDocument();
    });
  });

  test("mengganti tema saat tombol Ganti Tema diklik (mobile)", async () => {
    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    fireEvent.click(screen.getByLabelText("Toggle menu"));

    await waitFor(() => {
      expect(screen.getByTestId("mobile-change-theme-button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mobile-change-theme-button"));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });
  });

  // Test Case 6: Username Awal dan Tema dari localStorage 
  test("memuat username dari localStorage saat inisialisasi", () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "username") return "ExistingUser";
      return null;
    });

    render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const avatarIcon = screen.getByLabelText("Avatar");
    fireEvent.click(avatarIcon);

    expect(screen.getByTestId("desktop-profile-button")).toBeInTheDocument();
    expect(screen.getByTestId("desktop-logout-button")).toBeInTheDocument();
  });

  test("mengatur tema awal berdasarkan localStorage", () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "theme") return "dark";
      return null;
    });

    const { rerender } = render(
      <Router>
        <Navbar theme="dark" toggleTheme={mockToggleTheme} />
      </Router>
    );

    expect(window.document.documentElement).toHaveClass("dark");

    rerender(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );
    expect(window.document.documentElement).not.toHaveClass("dark");
  });

  test("NavLink menerapkan gaya aktif dengan benar", async () => {
    require("react-router-dom").useLocation.mockReturnValue({ pathname: "/about-us" });

    const { rerender } = render(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const desktopAboutUsLink = screen.getByTestId("desktop-about-us-link");
    const desktopContactLink = screen.getByTestId("desktop-contact-link");

    expect(desktopAboutUsLink).toHaveClass("aktif"); 
    expect(desktopContactLink).not.toHaveClass("font-bold");

    fireEvent.click(screen.getByLabelText("Toggle menu"));
    await waitFor(() => {
      expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
    });

    const mobileAboutUsLink = screen.getByTestId("mobile-about-us-link");
    const mobileContactLink = screen.getByTestId("mobile-contact-link");

    expect(mobileAboutUsLink).toBeInTheDocument();
    expect(mobileContactLink).toBeInTheDocument();

    expect(mobileAboutUsLink).toHaveClass("aktif");
    expect(mobileContactLink).not.toHaveClass("font-bold");

    fireEvent.click(screen.getByLabelText("Toggle menu"));
    await waitFor(() => {
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });

    require("react-router-dom").useLocation.mockReturnValue({ pathname: "/contact" });
    rerender(
      <Router>
        <Navbar theme="light" toggleTheme={mockToggleTheme} />
      </Router>
    );

    const updatedDesktopAboutUsLink = screen.getByTestId("desktop-about-us-link");
    const updatedDesktopContactLink = screen.getByTestId("desktop-contact-link");
    expect(updatedDesktopAboutUsLink).not.toHaveClass("font-bold");
    expect(updatedDesktopContactLink).toHaveClass("aktif");

    fireEvent.click(screen.getByLabelText("Toggle menu")); 
    await waitFor(() => {
      expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
    });

    const updatedMobileAboutUsLink = screen.getByTestId("mobile-about-us-link");
    const updatedMobileContactLink = screen.getByTestId("mobile-contact-link");

    expect(updatedMobileContactLink).toBeInTheDocument();
    expect(updatedMobileAboutUsLink).toBeInTheDocument();

    expect(updatedMobileContactLink).toHaveClass("aktif");
    expect(updatedMobileAboutUsLink).not.toHaveClass("font-bold");
  });
});