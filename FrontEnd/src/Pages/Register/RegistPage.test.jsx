import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import RegistPage from "./RegistPage";
import { BrowserRouter as Router } from "react-router-dom";
import { toast } from "react-toastify";

let mockNavigate;

// Mock `react-router-dom` useNavigate dan Link
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

// Mock `react-spinners`
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

describe("RegistPage Component", () => {
  beforeAll(() => {
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn((key) => {
          if (key === "username") return "TestUser";
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
  test("merender elemen-elemen form register dengan benar", () => {
    render(
      <Router>
        <RegistPage />
      </Router>
    );

    // Memastikan elemen-elemen form ada di dokumen
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/cth: username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Confirm your password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "REGISTER" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Exit" })).toBeInTheDocument();
  });

  // Test Case 2: Input fields diperbarui dengan nilai yang benar
  test("memungkinkan pengetikan pada field username, password dan confirm password", () => {
    render(
      <Router>
        <RegistPage />
      </Router>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");
    expect(confirmPasswordInput).toHaveValue("password123");
  });

  // Test Case 3: Register berhasil untuk user
  test("menangani registrasi berhasil dan navigasi ke halaman login", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          username: "normaluser",
          role: "user",
          userId: "user-id-456",
        }),
    });

    render(
      <Router>
        <RegistPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "normaluser" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "userpass" },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "userpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "REGISTER" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Registration successful! Please login."
      );
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  // Test Case 4: Registrasi gagal (password tidak cocok)
  test("menangani registrasi gagal jika password dan konfirmasi tidak cocok", async () => {
    render(
      <Router>
        <RegistPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "passwordSalah" },
    });

    fireEvent.click(screen.getByRole("button", { name: "REGISTER" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Password and confirmation do not match!"
      );
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  // Test Case 5: Registrasi gagal (respons server tidak OK)
  test("menangani registrasi gagal dengan pesan error dari server", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Username sudah ada." }),
    });

    render(
      <Router>
        <RegistPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "existinguser" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "REGISTER" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Username sudah ada.");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // Test Case 6: Registrasi gagal (error jaringan/fetch)
  test("menangani registrasi gagal dengan error jaringan", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Koneksi terputus."));

    render(
      <Router>
        <RegistPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "anyuser" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "anypass" },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "anypass" },
    });

    fireEvent.click(screen.getByRole("button", { name: "REGISTER" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "An error occurred during registration"
      );
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // Test Case 7: Loading state ditampilkan saat registrasi
  test("menunjukkan indikator loading selama proses registrasi", async () => {
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
        <RegistPage />
      </Router>
    );

    const registerButton = screen.getByRole("button", { name: "REGISTER" });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "user" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "pass" },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "pass" },
    });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(registerButton).toBeDisabled();
      expect(registerButton).toHaveTextContent("PROCES...");
    });

    expect(screen.getByTestId("loader")).toBeInTheDocument();

    resolveFetch();

    await waitFor(() => {
      expect(registerButton).toHaveTextContent("REGISTER");
      expect(registerButton).not.toBeDisabled();
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });
  });

  // Test Case 8: Tombol Keluar (Exit)
  test("tombol keluar menavigasi ke halaman utama", () => {
    render(
      <Router>
        <RegistPage />
      </Router>
    );

    const exitButton = screen.getByRole("button", { name: "Exit" });
    fireEvent.click(exitButton);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});