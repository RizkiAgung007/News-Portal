import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "./LoginPage";
import { BrowserRouter as Router } from "react-router-dom";
import { toast } from "react-toastify";

// Mock `react-router-dom` useNavigate dan Link
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

// Mock `toast` dari `react-toastify`
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("react-spinners", () => ({
  PropagateLoader: (props) => {
    if (props.loading) {
      return <div data-testid="propagate-loader-mock"></div>;
    }
    return null;
  },
}));

jest.mock("../../components/Loading/Loading", () => {
  return ({ loading }) => {
    if (loading) {
      return <div data-testid="loader-wrapper"></div>;
    }
    return null;
  };
});

global.fetch = jest.fn();

let originalConsoleError;
let originalConsoleWarn;

describe("LoginPage Component", () => {
  beforeAll(() => {
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  // Bersihkan mock setelah semua test di suite ini selesai
  afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  // Bersihkan mock dan localStorage sebelum setiap test
  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn((key) => {
          if (key === "username") return "TestAdmin";
          if (key === "token") return "mock-token";
          if (key === "theme") return "light";
          return null;
        }),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  // Test Case 1: Komponen merender dengan benar
  test("1. Merender elemen-elemen form login dengan benar", () => {
    render(
      <Router>
        <LoginPage />
      </Router>
    );

    // Memastikan elemen-elemen form ada di dokumen
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/cth: username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "LOGIN" })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account yet?/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /sign up/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Exit Login" })
    ).toBeInTheDocument();
  });

  // Test Case 2: Input fields diperbarui dengan nilai yang benar
  test("2. Memungkinkan pengetikan pada field username dan password", () => {
    render(
      <Router>
        <LoginPage />
      </Router>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");
  });

  // Test Case 3: Login berhasil untuk admin
  test("3. Menangani login berhasil dan navigasi ke dashboard admin untuk peran admin", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: "fake-admin-token",
          username: "adminuser",
          role: "admin",
          userId: "admin-id-123",
        }),
    });

    render(
      <Router>
        <LoginPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "adminuser" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "adminpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: "LOGIN" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/login"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "adminuser",
            password: "adminpass",
          }),
        })
      );
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "token",
        "fake-admin-token"
      );
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "username",
        "adminuser"
      );
      expect(window.localStorage.setItem).toHaveBeenCalledWith("role", "admin");
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "id_users",
        "admin-id-123"
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Login successfull! Welcome back."
      );
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  // Test Case 4: Login berhasil untuk non-admin (pengguna biasa)
  test("4. Menangani login berhasil dan navigasi ke halaman utama untuk peran pengguna biasa", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: "fake-user-token",
          username: "normaluser",
          role: "user",
          userId: "user-id-456",
        }),
    });

    render(
      <Router>
        <LoginPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "normaluser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "userpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "LOGIN" }));

    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith("role", "user");
      expect(toast.success).toHaveBeenCalledWith(
        "Login successfull! Welcome back."
      );
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  // Test Case 5: Login gagal (respons server tidak OK)
  test("5. Menangani login gagal dengan pesan error dari server", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Username atau password salah." }),
    });

    render(
      <Router>
        <LoginPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "wronguser" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: "LOGIN" }));

    await waitFor(() => {
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Username atau password salah.");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // Test Case 6: Login gagal (error jaringan/fetch)
  test("6. Menangani login gagal dengan error jaringan", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Koneksi terputus."));

    render(
      <Router>
        <LoginPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "anyuser" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "anypass" },
    });

    fireEvent.click(screen.getByRole("button", { name: "LOGIN" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to connect to server. Please try again later."
      );
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // Test Case 7: Loading state ditampilkan saat login
  test("7. Menunjukkan indikator loading selama proses login", async () => {
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = () =>
        resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
    });

    global.fetch.mockImplementationOnce(() => fetchPromise);

    render(
      <Router>
        <LoginPage />
      </Router>
    );

    const loginButton = screen.getByRole("button", { name: "LOGIN" });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "user" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "pass" },
    });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginButton).toBeDisabled();
      expect(loginButton).toHaveTextContent("PROCES...");
    });

    expect(screen.getByTestId("loader")).toBeInTheDocument();

    resolveFetch();

    await waitFor(() => {
      expect(loginButton).toHaveTextContent("LOGIN");
      expect(loginButton).not.toBeDisabled();
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });
  });

  // Test Case 8: Tombol Keluar (Exit)
  test("8. Tombol keluar menavigasi ke halaman utama", () => {
    render(
      <Router>
        <LoginPage />
      </Router>
    );

    const exitButton = screen.getByRole("button", { name: "Exit Login" });
    fireEvent.click(exitButton);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
