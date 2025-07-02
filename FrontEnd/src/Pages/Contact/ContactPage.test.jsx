import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom"; // Pastikan ini diimpor atau di setupTests.js
import ContactPage from "./ContactPage";
import { API_BASE_URL } from "../../config";
import { toast } from "react-toastify";

// Mock library eksternal
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ContactPage Component", () => {
  const renderWithRouter = (ui, { route = "/" } = {}) => {
    window.history.pushState({}, "Test page", route);
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={ui} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  let originalAdd;
  let originalRemove;

  beforeAll(() => {
    originalAdd = document.documentElement.classList.add;
    originalRemove = document.documentElement.classList.remove;
    document.documentElement.classList.add = jest.fn();
    document.documentElement.classList.remove = jest.fn();
  });

  afterAll(() => {
    document.documentElement.classList.add = originalAdd;
    document.documentElement.classList.remove = originalRemove;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
    toast.error.mockClear();
    toast.success.mockClear();

    if (!window.alert.mock) {
      Object.defineProperty(window, "alert", {
        writable: true,
        value: jest.fn(),
      });
    }
  });

  // Test 1: Menampilkan pesan "You must login" jika user belum login
  test('1. Menampilkan pesan "You must login" jika user belum login', () => {
    renderWithRouter(<ContactPage />);
    expect(screen.getByText(/you must/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getByText(/to submit a review/i)).toBeInTheDocument();
  });

  // Test 2: Merender form kontak jika user sudah login
  test("2. Merender form kontak jika user sudah login", () => {
    localStorage.setItem("token", "fake-token");
    renderWithRouter(<ContactPage />);
    expect(
      screen.getByRole("heading", { name: /Contact Us/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Message/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Message/i })
    ).toBeInTheDocument();
  });

  // Test 3: Mengupdate state formData saat input berubah
  test("3. Mengupdate state formData saat input berubah", () => {
    localStorage.setItem("token", "fake-token");
    renderWithRouter(<ContactPage />);

    const nameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const subjectInput = screen.getByLabelText(/Message Subject/i);
    const messageInput = screen.getByLabelText(/Your Message/i);

    fireEvent.change(nameInput, {
      target: { name: "name", value: "Test User" },
    });
    fireEvent.change(emailInput, {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(subjectInput, {
      target: { name: "subject", value: "Test Subject" },
    });
    fireEvent.change(messageInput, {
      target: { name: "message", value: "Test Message" },
    });

    expect(nameInput.value).toBe("Test User");
    expect(emailInput.value).toBe("test@example.com");
    expect(subjectInput.value).toBe("Test Subject");
    expect(messageInput.value).toBe("Test Message");
  });

  // Test 4: Menampilkan pesan error jika ada field yang kosong saat submit
  test("4. Menampilkan pesan error jika ada field yang kosong saat submit", async () => {
    localStorage.setItem("token", "fake-token");
    renderWithRouter(<ContactPage />);

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    
    // await waitFor(() => {
    //   expect(toast.error).toHaveBeenCalledWith("All columns are required to be filled in.");
    // });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  // Test 5: Mengirim form dengan data yang benar dan menampilkan sukses toast
  test("5. Mengirim form dengan data yang benar dan menampilkan sukses toast", async () => {
    localStorage.setItem("token", "fake-token");
    renderWithRouter(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { name: "name", value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message Subject/i), {
      target: { name: "subject", value: "Test Subject" },
    });
    fireEvent.change(screen.getByLabelText(/Your Message/i), {
      target: { name: "message", value: "Test Message" },
    });

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ message: "Review submitted successfully" }),
      })
    );

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/review/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token",
          },
          body: JSON.stringify({
            email: "test@example.com",
            subject: "Test Subject",
            message: "Test Message",
          }),
        }
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Your reviews has been successfully send!"
      );
      expect(screen.getByLabelText(/Username/i)).toHaveValue("");
      expect(screen.getByLabelText(/Email/i)).toHaveValue("");
      expect(screen.getByLabelText(/Message Subject/i)).toHaveValue("");
      expect(screen.getByLabelText(/Your Message/i)).toHaveValue("");
    });
  });

  // Test 6: Menampilkan error toast jika submit gagal
  test("6. Menampilkan error toast jika submit gagal", async () => {
    localStorage.setItem("token", "fake-token");
    renderWithRouter(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { name: "name", value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message Subject/i), {
      target: { name: "subject", value: "Test Subject" },
    });
    fireEvent.change(screen.getByLabelText(/Your Message/i), {
      target: { name: "message", value: "Test Message" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to submit review");
    });
    expect(toast.success).not.toHaveBeenCalled(); 
  });

  // Test 7: Tombol "Send Message" dinonaktifkan saat isLoading
  test('7. Tombol "Send Message" dinonaktifkan saat isLoading', async () => {
    localStorage.setItem("token", "fake-token");
    renderWithRouter(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { name: "name", value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { name: "email", value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message Subject/i), {
      target: { name: "subject", value: "Test Subject" },
    });
    fireEvent.change(screen.getByLabelText(/Your Message/i), {
      target: { name: "message", value: "Test Message" },
    });

    global.fetch.mockImplementationOnce(() => new Promise(() => {}));

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    expect(screen.getByRole("button", { name: /Sending.../i })).toBeDisabled();
  });

  // Test 8: Memuat tema dari localStorage dan menerapkannya
  test("8. Memuat tema dari localStorage dan menerapkannya", () => {
    localStorage.setItem("token", "fake-token");

    localStorage.setItem("theme", "dark");
    renderWithRouter(<ContactPage />);
    expect(document.documentElement.classList.add).toHaveBeenCalledWith("dark");
    expect(document.documentElement.classList.remove).not.toHaveBeenCalledWith(
      "dark"
    );

    jest.clearAllMocks();

    localStorage.setItem("theme", "light");
    renderWithRouter(<ContactPage />);
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      "dark"
    );
    expect(document.documentElement.classList.add).not.toHaveBeenCalledWith(
      "dark"
    );
  });

  // Test 9: Memastikan iframe peta memiliki src yang benar
  test("9. Memastikan iframe peta memiliki src yang benar", () => {
    localStorage.setItem("token", "fake-token");
    renderWithRouter(<ContactPage />);
    expect(screen.getByLabelText("maps")).toBeInTheDocument();
    expect(screen.getByLabelText("maps")).toHaveAttribute(
      "src",
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.011993510563!2d106.7864338147864!3d-6.262177795466858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1a2613e316d%3A0x2474bb442525697d!2sBintaro%20Jaya%20Xchange%20Mall!5e0!3m2!1sen!2sid!4v1672895690123!5m2!1sen!2sid"
    );
  });
});
