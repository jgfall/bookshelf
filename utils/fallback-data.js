// Fallback data utilities for when Notion API is unavailable
// This ensures the site never shows a completely broken state

// Generate a placeholder image URL using a free service
export const getPlaceholderImage = (width = 300, height = 450, text = 'Book') => {
  return `https://via.placeholder.com/${width}x${height}/6366f1/ffffff?text=${encodeURIComponent(text)}`;
};

// Sample book data that mimics the expected Notion structure
export const SAMPLE_BOOKS = [
  {
    id: 'sample-book-1',
    name: 'The Pragmatic Programmer',
    author: 'Sample Author',
    status: 'Finished',
    date: '2024-01-15',
    last_updated: '2024-01-15T10:00:00.000Z',
    rating: 5,
    notes: false,
    link: '',
    thumbnail: [{ url: getPlaceholderImage(300, 450, 'Sample+Book+1') }]
  },
  {
    id: 'sample-book-2',
    name: 'Clean Code',
    author: 'Sample Author',
    status: 'Finished',
    date: '2024-01-10',
    last_updated: '2024-01-10T10:00:00.000Z',
    rating: 4,
    notes: false,
    link: '',
    thumbnail: [{ url: getPlaceholderImage(300, 450, 'Sample+Book+2') }]
  },
  {
    id: 'sample-book-3',
    name: 'Design Patterns',
    author: 'Sample Author',
    status: 'Reading',
    date: '2024-01-01',
    last_updated: '2024-01-20T10:00:00.000Z',
    rating: 0,
    notes: false,
    link: '',
    thumbnail: [{ url: getPlaceholderImage(300, 450, 'Sample+Book+3') }]
  }
];

// Configuration error book - shows when Notion is not configured
export const CONFIG_ERROR_BOOK = {
  id: 'config-error',
  name: '⚙️ Configuration Needed',
  author: 'System Message',
  status: 'Finished',
  date: new Date().toISOString(),
  last_updated: new Date().toISOString(),
  rating: 0,
  notes: false,
  link: '',
  thumbnail: [{ url: getPlaceholderImage(300, 450, 'Configure+Notion') }]
};

// Sample bookmarks data
export const SAMPLE_BOOKMARKS = [
  {
    id: 'sample-bookmark-1',
    title: 'Sample Bookmark',
    url: 'https://example.com',
    description: 'This is sample data. Configure your Notion database to see real bookmarks.',
    published: true,
    date: new Date().toISOString()
  }
];

// Safely get book property with fallback
export const safeGetBookProperty = (book, property, fallback = '') => {
  try {
    if (!book || typeof book !== 'object') return fallback;
    return book[property] || fallback;
  } catch (error) {
    console.warn(`Error accessing book property ${property}:`, error.message);
    return fallback;
  }
};

// Validate book data structure
export const isValidBook = (book) => {
  if (!book || typeof book !== 'object') return false;
  
  const requiredFields = ['id', 'name', 'author', 'status'];
  return requiredFields.every((field) => book[field] !== undefined && book[field] !== null);
};

// Filter and validate book array
export const validateBookArray = (books) => {
  if (!Array.isArray(books)) {
    console.warn('⚠️ Expected books array, received:', typeof books);
    return [];
  }
  
  return books.filter((book) => {
    const valid = isValidBook(book);
    if (!valid) {
      console.warn('⚠️ Invalid book data:', book);
    }
    return valid;
  });
};

// Get safe thumbnail URL
export const getSafeThumbnailUrl = (book) => {
  try {
    if (!book) return getPlaceholderImage();
    
    if (book.thumbnail && Array.isArray(book.thumbnail) && book.thumbnail[0]?.url) {
      return book.thumbnail[0].url;
    }
    
    // Generate placeholder with book name
    const bookName = book.name || 'Book';
    return getPlaceholderImage(300, 450, bookName.substring(0, 20));
  } catch (error) {
    console.warn('Error getting thumbnail:', error.message);
    return getPlaceholderImage();
  }
};

// Check if using fallback data
export const isUsingFallbackData = (books) => {
  if (!Array.isArray(books) || books.length === 0) return true;
  
  // Check if all books are sample books
  const sampleIds = SAMPLE_BOOKS.map((b) => b.id);
  return books.every((book) => sampleIds.includes(book.id) || book.id === 'config-error');
};

// Get helpful error message based on data state
export const getDataStateMessage = (books) => {
  if (!books || books.length === 0) {
    return {
      type: 'error',
      title: 'No Data Available',
      message: 'Unable to load books from Notion. Please check your configuration.',
      details: [
        'Verify NOTION_API_KEY is set correctly',
        'Ensure NOTION_BOOKS database ID is valid',
        'Check that your integration has access to the database'
      ]
    };
  }
  
  if (isUsingFallbackData(books)) {
    return {
      type: 'warning',
      title: 'Using Sample Data',
      message: 'Notion database is not configured. Showing sample data.',
      details: [
        'Configure your .env file with valid Notion credentials',
        'Share your Notion databases with the integration',
        'Add books to your Notion database'
      ]
    };
  }
  
  return {
    type: 'success',
    title: 'Data Loaded Successfully',
    message: `Loaded ${books.length} books from Notion.`,
    details: []
  };
};

export default {
  SAMPLE_BOOKS,
  SAMPLE_BOOKMARKS,
  CONFIG_ERROR_BOOK,
  getPlaceholderImage,
  safeGetBookProperty,
  isValidBook,
  validateBookArray,
  getSafeThumbnailUrl,
  isUsingFallbackData,
  getDataStateMessage
};
