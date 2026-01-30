# my personal bookshelf

> A personal bookshelf built with Next.js and Notion as a CMS, featuring comprehensive error handling and fallback mechanisms.

## ✨ Features

- 📚 Display books from Notion database with status tracking
- 🔖 Bookmark management
- 📝 Book reviews and notes
- 🔍 Search and filter functionality
- 🎨 Beautiful UI with Tailwind CSS
- ⚡ Static site generation with Next.js
- 🛡️ **NEW: Robust error handling and validation**
- 🔄 **NEW: Automatic fallback to sample data**
- 📊 **NEW: Detailed logging for debugging**

## 💻 Built with

This source of my personal bookshelf. It's built with following technologies:

- [React](https://reactjs.org/) – My frontend library of choice.
- [Next.js](https://nextjs.org/) – It's static site generation is amazing, especially when hosted on [Vercel](https://vercel.com).
- [react-notion](https://github.com/splitbee/react-notion) & [notion-sdk](https://github.com/makenotion/notion-sdk-js/) – Renders most of the content on the page. Notion as a CMS is super convenient.
- [Tailwind](https://tailwindcss.com/): My favorite way of writting CSS nowadays.

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and Yarn
- A Notion account
- A Notion integration (internal integration)

### 1. Clone and Install

```sh
git clone https://github.com/jgfall/bookshelf.git
cd bookshelf
yarn install
```

### 2. Set Up Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Name it (e.g., "Bookshelf")
4. Copy the **"Internal Integration Token"** (starts with `secret_`)

### 3. Create Notion Databases

You need **three databases**:

#### Books Database
Required properties:
- **name** (Title) - Book name
- **author** (Text) - Author name
- **status** (Select) - Values: "Reading", "Finished"
- **date** (Date) - Completion date
- **rating** (Number) - Book rating (1-5)
- **thumbnail** (Files & Media) - Book cover image
- **notes** (Checkbox) - Has review?
- **link** (URL) - External link (optional)
- **last_updated** (Last edited time) - Auto-generated

#### Bookmarks Database
Required properties:
- **title** (Title) - Bookmark name
- **url** (URL) - Link
- **description** (Text) - Description
- **published** (Checkbox) - Show on site?
- **date** (Date) - Added date

#### Book Suggestions Database
Required properties:
- **title** (Title) - Suggested book name

### 4. Share Databases with Integration

**IMPORTANT:** For each database:
1. Open the database in Notion
2. Click **"Share"** in the top right
3. Select your integration from the dropdown
4. Click **"Invite"**

### 5. Get Database IDs

For each database:
1. Open in Notion
2. Copy the URL: `https://www.notion.so/{workspace}/{database_id}?v={view_id}`
3. Extract the `database_id` (32 characters, may include hyphens)
   - Example: `fb8801ac5b6544759ca3b94d808e788f`

### 6. Configure Environment Variables

```sh
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_BOOKS=your_books_database_id
NOTION_BOOKMARKS=your_bookmarks_database_id
NOTION_BOOK_SUGGESTIONS=your_suggestions_database_id
```

### 7. Run Locally

```sh
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🐛 Troubleshooting "No Books Found" Error

### Symptom 1: "Using sample data" warning

**Cause:** Environment variables not configured correctly

**Solutions:**
1. ✅ Check `.env` file exists and has all variables
2. ✅ Verify `NOTION_API_KEY` starts with `secret_`
3. ✅ Ensure database IDs are 32 characters
4. ✅ Restart dev server after changing `.env`

### Symptom 2: "Database not found" error

**Cause:** Database ID is incorrect or integration lacks access

**Solutions:**
1. ✅ Double-check database ID from Notion URL
2. ✅ Ensure database is **shared** with your integration
3. ✅ Try removing hyphens from database ID (both formats work)
4. ✅ Verify you're using the database ID, not page ID

### Symptom 3: "No books found in database"

**Cause:** Database has no entries with required status

**Solutions:**
1. ✅ Add at least one entry to your Books database
2. ✅ Set `status` property to "Finished" or "Reading"
3. ✅ Ensure all required properties have values
4. ✅ Check property names match exactly (case-sensitive)

### Symptom 4: Books show but images are broken

**Cause:** Thumbnail property not configured

**Solutions:**
1. ✅ Add `thumbnail` property (Files & Media type)
2. ✅ Upload or link book cover images
3. ✅ Fallback placeholders will show automatically

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `object_not_found` | Database ID is wrong | Verify database ID in Notion URL |
| `unauthorized` | API key is invalid | Check `NOTION_API_KEY` value |
| `restricted_resource` | No integration access | Share database with integration |
| `Invalid response` | Database has no data | Add entries to your database |

## 🔍 Debugging Tips

### Check Console Logs

The application now provides detailed logging:

```
✅ Successfully fetched 5 books from Notion
⚠️ No books found in database. Database ID: abc123...
❌ Error fetching books from Notion: object_not_found
💡 Database not found. Check NOTION_BOOKS ID in .env file
```

### Test Notion Connection

Add this to any page's `getStaticProps`:

```javascript
import { checkNotionConnection } from '@/config/notion';

export async function getStaticProps() {
  const status = await checkNotionConnection();
  console.log('Notion connection status:', status);
  // ... rest of code
}
```

### Validate Environment Variables

Run this in your terminal:

```sh
node -e "console.log('API Key:', process.env.NOTION_API_KEY?.substring(0, 10)); console.log('Books DB:', process.env.NOTION_BOOKS)"
```

### Check Build Logs

```sh
yarn build
```

Look for error messages during the build process.

## 📊 Database Schema Validation

Use this checklist for your Books database:

- [ ] Property `name` exists (Title type)
- [ ] Property `author` exists (Text type)
- [ ] Property `status` exists (Select type with "Reading" and "Finished" options)
- [ ] Property `date` exists (Date type)
- [ ] Property `rating` exists (Number type)
- [ ] Property `thumbnail` exists (Files & Media type)
- [ ] Property `notes` exists (Checkbox type)
- [ ] At least one entry has `status` = "Finished"
- [ ] Database is shared with integration

## 🗃️ Resources

Here for the databases template:

- [Books](https://opakholis.notion.site/fb8801ac5b6544759ca3b94d808e788f?v=166c882fcc24456fa06ec797c7fe3ba8)
- [Bookmarks](https://opakholis.notion.site/7938717f61334b6e81a878656837d500?v=1a319c3d7e0d4f259a8fdeb21b781f72)
- [Form Suggestions](https://opakholis.notion.site/eea210597ebb491db75ab994ca16f1fe?v=4111d1857604432994f5eee7ee15fc29)

Please consider to check out the [Notion Docs](https://developers.notion.com/docs) for awesome knowledges.

## 🔄 Recent Improvements

This fork includes comprehensive fixes for the "No books found" error:

1. ✅ **Official Notion API** - Replaced unreliable Splitbee proxy
2. ✅ **Error Handling** - Try-catch blocks with detailed logging
3. ✅ **Data Validation** - Prevents crashes on invalid data
4. ✅ **Fallback Data** - Sample data when Notion unavailable
5. ✅ **Better Messages** - Specific, actionable error messages
6. ✅ **Environment Validation** - Checks for missing variables
7. ✅ **Safe Defaults** - Empty arrays instead of undefined

## 🦄 Assets

- Icons - [Phosphor](https://phosphoricons.com/)
- Nav Logo - [Flaticon](https://www.freepik.com)
- 404 Illustrations - [Story Set](https://storyset.com/web)

## 📝 License

SEE LICENSE IN LICENSE

---

**Fork maintained by:** [jgfall](https://github.com/jgfall)  
**Original by:** [opakholis](https://github.com/opakholis)

For issues or questions, please open an issue on GitHub.
