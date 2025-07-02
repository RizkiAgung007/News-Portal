import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import "@testing-library/jest-dom"; 
import { MemoryRouter, Route, Routes, useParams} from 'react-router-dom';
import CategoryPage from './CategoryPage';
import { API_BASE_URL } from '../../config';
import { NEWS_API_KEY } from '../../api';

jest.mock('../../components/NotFound/NotFound', () => ({
  __esModule: true,
  default: () => <div data-testid="not-found-component">Halaman Tidak Ditemukan</div>,
}));

jest.mock('../../components/Loading/Loading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-component">Memuat Artikel...</div>,
}));

jest.mock('../../api', () => ({
  NEWS_API_KEY: 'mock-news-api-key',
}));

// Data artikel dari DB
const mockDbArticles = [
  {
    id_news: 'db-news-1',
    title: 'Judul Artikel DB 1: AI di Industri',
    description: 'Deskripsi singkat tentang AI di industri dari database.',
    url_photo: '/uploads/ai-image.jpg',
    create_at: '2024-06-20T10:00:00Z', 
    category: 'teknologi',
  },
  {
    id_news: 'db-news-2',
    title: 'Judul Artikel DB 2: Inovasi Energi Terbarukan',
    description: 'Inovasi terbaru dalam bidang energi terbarukan.',
    url_photo: '/uploads/energy-image.jpg',
    create_at: '2024-06-19T12:00:00Z', 
    category: 'teknologi',
  },
];

// Data artikel dari NewsAPI
const mockApiArticles = [
  {
    source: { id: 'wired', name: 'Wired' },
    author: 'John Doe',
    title: 'New Tech Gadget Unveiled: The Future is Here',
    description: 'A revolutionary new gadget hits the market, promising to change daily life.',
    url: 'https://wired.com/gadget', 
    urlToImage: 'https://example.com/gadget.jpg',
    publishedAt: '2024-06-23T15:30:00Z', 
    content: 'Full content of the gadget news. [+1000 chars]',
  },
  {
    source: { id: 'the-verge', name: 'The Verge' },
    author: 'Jane Smith',
    title: 'Breakthrough in Quantum Computing Research',
    description: 'Scientists achieve a significant milestone in quantum computing.',
    url: 'https://theverge.com/quantum', 
    urlToImage: 'https://example.com/quantum.jpg',
    publishedAt: '2024-06-22T11:00:00Z', 
    content: 'Detailed content about quantum computing. [+500 chars]',
  },
];

// Fungsi bantuan untuk mocking fetch API
const mockDbApiSuccess = (articlesData) =>
  jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(articlesData),
    })
  );

const mockNewsApiOrgSuccess = (articlesData) =>
  jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status: 'ok', articles: articlesData }),
    })
  );


describe('Komponen CategoryPage', () => {
  let originalConsoleError;

  const renderWithRouter = (ui, { route = '/', path = '/category/:categoryName' } = {}) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="/newsdetail/:articleUrl" element={<MockNewsDetailPage />} />
          <Route path="/searchdetail/:newsId" element={<MockSearchDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  // Komponen mock untuk halaman tujuan navigasi
  const MockNewsDetailPage = () => {
    const { articleUrl } = useParams();
    return <div>Detail Artikel API: {articleUrl}</div>;
  };
  const MockSearchDetailPage = () => {
    const { newsId } = useParams();
    return <div>Detail Artikel DB: {newsId}</div>;
  };

  beforeAll(() => {
    jest.useFakeTimers();

    originalConsoleError = console.error;
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.setSystemTime(new Date('2025-06-24T10:00:00Z'));

    jest.spyOn(Date.prototype, 'toLocaleString').mockImplementation(function(locale, options) {
      const date = new Date(this);
      if (locale === 'id-ID') {
          
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const seconds = date.getSeconds();

          const pad = (num) => num < 10 ? '0' + num : num;

          const isoString = date.toISOString();
          if (isoString === '2024-06-20T10:00:00.000Z') return '20/6/2024, 17.00.00';
          if (isoString === '2024-06-19T12:00:00.000Z') return '19/6/2024, 19.00.00';
          if (isoString === '2024-06-23T15:30:00.000Z') return '23/6/2024, 22.30.00';
          if (isoString === '2024-06-22T11:00:00.000Z') return '22/6/2024, 18.00.00';
      }

      return originalDate.prototype.toLocaleString.call(this, locale, options);
    });
  });

  afterAll(() => {

    jest.useRealTimers();
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks(); 
    global.fetch = jest.fn(); 

    if (!window.alert.mock) {
      Object.defineProperty(window, 'alert', {
        writable: true,
        value: jest.fn(),
      });
    }
  });

  // Test 1: Merender komponen Loading saat awal pengambilan data
  test('1. Merender komponen Loading saat awal pengambilan data', () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); 
    renderWithRouter(<CategoryPage />, { route: '/category/teknologi' });
    expect(screen.getByTestId('loading-component')).toBeInTheDocument();
  });

  // Test 2: Menampilkan artikel dari kedua sumber (DB dan API) setelah fetching sukses
  test('2. Menampilkan artikel dari kedua sumber (DB dan API) setelah fetching sukses', async () => {
    global.fetch
      .mockImplementationOnce(mockDbApiSuccess(mockDbArticles)) // DB articles
      .mockImplementationOnce(mockNewsApiOrgSuccess(mockApiArticles)); // NewsAPI articles

    renderWithRouter(<CategoryPage />, { route: '/category/teknologi' });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-component')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /News "teknologi"/i })).toBeInTheDocument();
      expect(screen.getByText('Judul Artikel DB 1: AI di Industri')).toBeInTheDocument();
      expect(screen.getByText(/Deskripsi singkat tentang AI di industri/i)).toBeInTheDocument();
      expect(screen.getByText('New Tech Gadget Unveiled: The Future is Here')).toBeInTheDocument();
      expect(screen.getByText(/A revolutionary new gadget hits the market/i)).toBeInTheDocument();
    }, { timeout: 4000 }); 

    expect(screen.getAllByRole('img').length).toBe(mockDbArticles.length + mockApiArticles.length);
  });

  // Test 3: Menampilkan 'Halaman Tidak Ditemukan' jika tidak ada artikel dari kedua sumber
  test('3. Menampilkan "Halaman Tidak Ditemukan" jika tidak ada artikel dari kedua sumber', async () => {
    global.fetch
      .mockImplementationOnce(mockDbApiSuccess([])) // DB kosong
      .mockImplementationOnce(mockNewsApiOrgSuccess([])); // NewsAPI kosong

    renderWithRouter(<CategoryPage />, { route: '/category/non-existent' });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-component')).not.toBeInTheDocument();
      expect(screen.getByTestId('not-found-component')).toBeInTheDocument();
      expect(screen.getByText('Halaman Tidak Ditemukan')).toBeInTheDocument();
    });
  });

  // Test 4: Mengarahkan ke NewsDetail untuk artikel dari NewsAPI saat diklik
  test('4. Mengarahkan ke NewsDetail untuk artikel dari NewsAPI saat diklik', async () => {
    global.fetch
      .mockImplementationOnce(mockDbApiSuccess([])) // DB kosong
      .mockImplementationOnce(mockNewsApiOrgSuccess(mockApiArticles)); // NewsAPI ada

    renderWithRouter(<CategoryPage />, { route: '/category/teknologi' });

    await waitFor(() => {
      expect(screen.getByText('New Tech Gadget Unveiled: The Future is Here')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Tech Gadget Unveiled: The Future is Here'));

    await waitFor(() => {
      expect(screen.getByText(`Detail Artikel API: ${mockApiArticles[0].url}`)).toBeInTheDocument();
    });
  });

  // Test 5: Mengarahkan ke SearchDetail untuk artikel dari DB saat diklik
  test('5. Mengarahkan ke SearchDetail untuk artikel dari DB saat diklik', async () => {
    global.fetch
      .mockImplementationOnce(mockDbApiSuccess(mockDbArticles)) // DB ada
      .mockImplementationOnce(mockNewsApiOrgSuccess([])); // NewsAPI kosong

    renderWithRouter(<CategoryPage />, { route: '/category/teknologi' });

    await waitFor(() => {
      expect(screen.getByText('Judul Artikel DB 1: AI di Industri')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Judul Artikel DB 1: AI di Industri'));

    await waitFor(() => {
      expect(screen.getByText(`Detail Artikel DB: ${mockDbArticles[0].id_news}`)).toBeInTheDocument();
    });
  });

  // Test 6: Menampilkan "No Description" jika deskripsi tidak ada
  test('6. Menampilkan "No Description" jika deskripsi tidak ada', async () => {
    const articleWithoutDesc = {
      ...mockDbArticles[0],
      description: null, 
    };
    global.fetch
      .mockImplementationOnce(mockDbApiSuccess([articleWithoutDesc]))
      .mockImplementationOnce(mockNewsApiOrgSuccess([]));

    renderWithRouter(<CategoryPage />, { route: '/category/teknologi' });

    await waitFor(() => {
      expect(screen.getByText('No Description')).toBeInTheDocument();
    });
  });

  // Test 7: Menampilkan tanggal dengan format yang benar
  test('7. Menampilkan tanggal dengan format yang benar', async () => {
    global.fetch
      .mockImplementationOnce(mockDbApiSuccess(mockDbArticles))
      .mockImplementationOnce(mockNewsApiOrgSuccess(mockApiArticles));

    renderWithRouter(<CategoryPage />, { route: '/category/teknologi' });

    await waitFor(() => {
      expect(screen.getByText('20/6/2024, 17.00.00')).toBeInTheDocument();
      expect(screen.getByText('23/6/2024, 22.30.00')).toBeInTheDocument();
    });
  });

  // Test 8: Menampilkan placeholder gambar jika url_photo/urlToImage tidak ada
  test('8. Menampilkan placeholder gambar jika url_photo/urlToImage tidak ada', async () => {
    const articleWithoutImageDb = {
      ...mockDbArticles[0],
      url_photo: null,
    };
    const articleWithoutImageApi = {
      ...mockApiArticles[0],
      urlToImage: null,
    };
    global.fetch
      .mockImplementationOnce(mockDbApiSuccess([articleWithoutImageDb]))
      .mockImplementationOnce(mockNewsApiOrgSuccess([articleWithoutImageApi]));

    renderWithRouter(<CategoryPage />, { route: '/category/teknologi' });

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(2);
      expect(images[0]).toHaveAttribute('src', 'https://via.placeholder.com/400x200?text=No+Image');
      expect(images[1]).toHaveAttribute('src', 'https://via.placeholder.com/400x200?text=No+Image');
    });
  });

  // Test 9: console.error dipanggil jika fetching gagal
  test('9. console.error dipanggil jika fetching gagal', async () => {
    global.fetch
      .mockImplementationOnce(() => Promise.reject(new Error('Network Error for DB API')))
      .mockImplementationOnce(() => Promise.reject(new Error('Network Error for NewsAPI')));

    renderWithRouter(<CategoryPage />, { route: '/category/teknologi' });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Failed to retrieve data:', expect.any(Error));
    }, { timeout: 3000 });
  });

  // Test 10: Teks "Read More..." ditampilkan
  test('10. Teks "Read More..." ditampilkan', async () => {
    global.fetch
      .mockImplementationOnce(mockDbApiSuccess(mockDbArticles))
      .mockImplementationOnce(mockNewsApiOrgSuccess(mockApiArticles));

    renderWithRouter(<CategoryPage />, { route: '/category/teknologi' });

    await waitFor(() => {
      const readMoreElements = screen.getAllByText('Read More...');
      expect(readMoreElements.length).toBe(mockDbArticles.length + mockApiArticles.length);
      readMoreElements.forEach(element => {
        expect(element).toBeInTheDocument();
      });
    });
  });
});