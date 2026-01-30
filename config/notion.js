import slugify from 'slugify';
const { Client } = require('@notionhq/client');

// Environment variable validation
const validateEnvVars = () => {
  const missing = [];
  
  if (!process.env.NOTION_API_KEY) missing.push('NOTION_API_KEY');
  if (!process.env.NOTION_BOOKS) missing.push('NOTION_BOOKS');
  if (!process.env.NOTION_BOOKMARKS) missing.push('NOTION_BOOKMARKS');
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('💡 Please check your .env file and ensure all variables are set.');
    return false;
  }
  
  return true;
};

// Initialize Notion client
let notion = null;
try {
  if (process.env.NOTION_API_KEY) {
    notion = new Client({ auth: process.env.NOTION_API_KEY });
  }
} catch (error) {
  console.error('❌ Failed to initialize Notion client:', error.message);
}

// Sample fallback data for when Notion is unavailable
const FALLBACK_BOOKS = [
  {
    id: 'sample-1',
    name: 'Sample Book - Configuration Needed',
    author: 'System',
    status: 'Finished',
    date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    rating: 5,
    notes: false,
    link: '',
    thumbnail: [{ url: '/static/images/placeholder-book.jpg' }]
  }
];

// Transform Notion database results to expected format
const transformNotionResults = (results) => {
  if (!Array.isArray(results)) {
    console.warn('⚠️ Expected array but received:', typeof results);
    return [];
  }

  return results.map((page) => {
    try {
      const properties = page.properties || {};
      
      return {
        id: page.id,
        name: properties.name?.title?.[0]?.plain_text || 
              properties.Name?.title?.[0]?.plain_text || 
              'Untitled',
        author: properties.author?.rich_text?.[0]?.plain_text || 
                properties.Author?.rich_text?.[0]?.plain_text || 
                'Unknown',
        status: properties.status?.select?.name || 
                properties.Status?.select?.name || 
                'Unknown',
        date: properties.date?.date?.start || 
              properties.Date?.date?.start || 
              new Date().toISOString(),
        last_updated: properties.last_updated?.last_edited_time || 
                      page.last_edited_time || 
                      new Date().toISOString(),
        rating: properties.rating?.number || 
                properties.Rating?.number || 
                0,
        notes: properties.notes?.checkbox || 
               properties.Notes?.checkbox || 
               false,
        link: properties.link?.url || 
              properties.Link?.url || 
              '',
        thumbnail: properties.thumbnail?.files || 
                   properties.Thumbnail?.files || 
                   [{ url: '/static/images/placeholder-book.jpg' }]
      };
    } catch (error) {
      console.error('❌ Error transforming page:', error.message);
      return null;
    }
  }).filter(Boolean);
};

export const getBooksTable = async () => {
  // Check environment variables
  if (!validateEnvVars()) {
    console.warn('📚 Returning fallback books data due to missing configuration');
    return FALLBACK_BOOKS;
  }

  // Check if Notion client is initialized
  if (!notion) {
    console.error('❌ Notion client not initialized. Check NOTION_API_KEY.');
    return FALLBACK_BOOKS;
  }

  try {
    console.log('📖 Fetching books from Notion database...');
    
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BOOKS,
      page_size: 100
    });

    if (!response || !response.results) {
      console.error('❌ Invalid response from Notion API');
      return FALLBACK_BOOKS;
    }

    const books = transformNotionResults(response.results);
    
    if (books.length === 0) {
      console.warn('⚠️ No books found in database. Database ID:', process.env.NOTION_BOOKS);
      console.warn('💡 Ensure your Notion database has entries with status="Finished" or "Reading"');
      return FALLBACK_BOOKS;
    }

    console.log(`✅ Successfully fetched ${books.length} books from Notion`);
    return books;

  } catch (error) {
    console.error('❌ Error fetching books from Notion:', error.message);
    
    if (error.code === 'object_not_found') {
      console.error('💡 Database not found. Check NOTION_BOOKS ID in .env file');
      console.error('   Current value:', process.env.NOTION_BOOKS);
    } else if (error.code === 'unauthorized') {
      console.error('💡 Authentication failed. Check NOTION_API_KEY in .env file');
    } else if (error.code === 'restricted_resource') {
      console.error('💡 Integration does not have access to this database');
      console.error('   Share the database with your integration in Notion');
    }
    
    return FALLBACK_BOOKS;
  }
};

export const getBookmarksTable = async () => {
  // Check environment variables
  if (!validateEnvVars()) {
    console.warn('🔖 Returning empty bookmarks due to missing configuration');
    return [];
  }

  // Check if Notion client is initialized
  if (!notion) {
    console.error('❌ Notion client not initialized for bookmarks');
    return [];
  }

  try {
    console.log('🔖 Fetching bookmarks from Notion database...');
    
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BOOKMARKS,
      page_size: 100
    });

    if (!response || !response.results) {
      console.error('❌ Invalid bookmarks response from Notion API');
      return [];
    }

    const bookmarks = response.results.map((page) => {
      const properties = page.properties || {};
      
      return {
        id: page.id,
        title: properties.title?.title?.[0]?.plain_text || 
               properties.Title?.title?.[0]?.plain_text || 
               'Untitled',
        url: properties.url?.url || 
             properties.URL?.url || 
             '',
        description: properties.description?.rich_text?.[0]?.plain_text || 
                     properties.Description?.rich_text?.[0]?.plain_text || 
                     '',
        published: properties.published?.checkbox || 
                   properties.Published?.checkbox || 
                   false,
        date: properties.date?.date?.start || 
              properties.Date?.date?.start || 
              new Date().toISOString()
      };
    });

    console.log(`✅ Successfully fetched ${bookmarks.length} bookmarks from Notion`);
    return bookmarks;

  } catch (error) {
    console.error('❌ Error fetching bookmarks from Notion:', error.message);
    
    if (error.code === 'object_not_found') {
      console.error('💡 Bookmarks database not found. Check NOTION_BOOKMARKS ID');
    }
    
    return [];
  }
};

export const getPageBlocks = async (pageId) => {
  if (!notion) {
    console.error('❌ Notion client not initialized for page blocks');
    return null;
  }

  if (!pageId) {
    console.error('❌ No page ID provided to getPageBlocks');
    return null;
  }

  try {
    console.log('📄 Fetching page blocks for:', pageId);
    
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100
    });

    if (!response || !response.results) {
      console.error('❌ Invalid page blocks response');
      return null;
    }

    // Transform to react-notion format
    const blockMap = {};
    response.results.forEach((block) => {
      blockMap[block.id] = {
        value: block
      };
    });

    console.log(`✅ Successfully fetched ${response.results.length} blocks`);
    return blockMap;

  } catch (error) {
    console.error('❌ Error fetching page blocks:', error.message);
    
    if (error.code === 'object_not_found') {
      console.error('💡 Page not found:', pageId);
    }
    
    return null;
  }
};

export const slugByName = (bookName) => {
  if (!bookName || typeof bookName !== 'string') {
    console.warn('⚠️ Invalid book name for slug generation:', bookName);
    return 'untitled';
  }
  
  return slugify(bookName, { lower: true, strict: true });
};

// Export validation function for use in pages
export const checkNotionConnection = async () => {
  if (!validateEnvVars()) {
    return {
      success: false,
      message: 'Missing required environment variables'
    };
  }

  if (!notion) {
    return {
      success: false,
      message: 'Notion client not initialized'
    };
  }

  try {
    // Try to fetch a small amount of data to test connection
    await notion.databases.query({
      database_id: process.env.NOTION_BOOKS,
      page_size: 1
    });

    return {
      success: true,
      message: 'Notion connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      code: error.code
    };
  }
};
