# 🔧 Troubleshooting Guide

This guide helps you resolve the **"No books found"** error and other common issues with the bookshelf application.

## 📋 Quick Diagnostic Checklist

Run through this checklist first:

- [ ] ✅ `.env` file exists in project root
- [ ] ✅ `NOTION_API_KEY` is set and starts with `secret_`
- [ ] ✅ `NOTION_BOOKS` database ID is 32 characters
- [ ] ✅ `NOTION_BOOKMARKS` database ID is 32 characters  
- [ ] ✅ `NOTION_BOOK_SUGGESTIONS` database ID is 32 characters
- [ ] ✅ All three databases are **shared** with your integration
- [ ] ✅ Books database has at least one entry
- [ ] ✅ At least one book has `status` = "Finished" or "Reading"
- [ ] ✅ Dev server restarted after changing `.env`

---

## 🚨 Common Errors and Solutions

### Error 1: "Using sample data" or "Configuration Needed"

**What it means:** Your environment variables are missing or incorrect.

**Console shows:**
```
❌ Missing required environment variables: NOTION_API_KEY, NOTION_BOOKS
💡 Please check your .env file and ensure all variables are set.
```

**Solution:**

1. Check if `.env` file exists:
   ```sh
   ls -la .env
   ```

2. If missing, create it:
   ```sh
   cp .env.example .env
   ```

3. Add your credentials:
   ```env
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_BOOKS=your-database-id-here
   NOTION_BOOKMARKS=your-bookmarks-id-here
   NOTION_BOOK_SUGGESTIONS=your-suggestions-id-here
   ```

4. Restart the dev server:
   ```sh
   # Press Ctrl+C to stop
   yarn dev
   ```

---

### Error 2: "object_not_found" or "Database not found"

**What it means:** The database ID is incorrect or doesn't exist.

**Console shows:**
```
❌ Error fetching books from Notion: object_not_found
💡 Database not found. Check NOTION_BOOKS ID in .env file
   Current value: abc123xyz...
```

**Solution:**

1. **Find the correct database ID:**
   - Open your Books database in Notion
   - Look at the URL: `https://www.notion.so/workspace/DATABASE_ID?v=VIEW_ID`
   - Copy the `DATABASE_ID` part (32 characters)
   - Example: `fb8801ac5b6544759ca3b94d808e788f`

2. **Remove hyphens (if present):**
   - Notion accepts IDs with or without hyphens
   - If you have: `fb8801ac-5b65-4475-9ca3-b94d808e788f`
   - Use: `fb8801ac5b6544759ca3b94d808e788f`

3. **Update `.env` file:**
   ```env
   NOTION_BOOKS=fb8801ac5b6544759ca3b94d808e788f
   ```

4. **Verify by testing:**
   ```javascript
   // Add to pages/index.js temporarily
   console.log('Database ID:', process.env.NOTION_BOOKS);
   ```

---

### Error 3: "unauthorized" or "Authentication failed"

**What it means:** Your API key is invalid or expired.

**Console shows:**
```
❌ Error fetching books from Notion: unauthorized
💡 Authentication failed. Check NOTION_API_KEY in .env file
```

**Solution:**

1. **Get a new API key:**
   - Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Select your integration (or create a new one)
   - Click "Show" next to "Internal Integration Token"
   - Copy the token (starts with `secret_`)

2. **Update `.env`:**
   ```env
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Verify format:**
   - Should be ~50 characters
   - Must start with `secret_`
   - No spaces or quotes

---

### Error 4: "restricted_resource" or "Integration does not have access"

**What it means:** The database is not shared with your integration.

**Console shows:**
```
❌ Error fetching books from Notion: restricted_resource
💡 Integration does not have access to this database
   Share the database with your integration in Notion
```

**Solution:**

1. **Open the Books database in Notion**

2. **Click "Share" button (top right)**

3. **Add your integration:**
   - Click the dropdown
   - Find your integration name (e.g., "Bookshelf")
   - Click to add it
   - Click "Invite"

4. **Verify access:**
   - Integration should appear in the "Shared with" list
   - Ensure it has "Can edit" permissions

5. **Repeat for all three databases:**
   - Books database
   - Bookmarks database
   - Book Suggestions database

---

### Error 5: "No books found in database"

**What it means:** Database exists but has no entries or no books with status="Finished".

**Console shows:**
```
⚠️ No books found in database. Database ID: abc123...
💡 Ensure your Notion database has entries with status="Finished" or "Reading"
```

**Solution:**

1. **Add a book to your database:**
   - Open the Books database in Notion
   - Click "New" to add an entry

2. **Fill in required properties:**
   - **name**: Any book title (e.g., "The Pragmatic Programmer")
   - **author**: Author name (e.g., "Andrew Hunt")
   - **status**: Select "Finished" or "Reading"
   - **date**: Pick any date
   - **rating**: Enter a number (1-5)
   - **thumbnail**: Upload or link a book cover image

3. **Verify property names (case-sensitive):**
   - Use lowercase: `name`, `author`, `status`, `date`, `rating`
   - NOT: `Name`, `Author`, `Status`, etc.

4. **Check property types:**
   | Property | Type | Example |
   |----------|------|---------|
   | name | Title | "Clean Code" |
   | author | Text | "Robert Martin" |
   | status | Select | "Finished" |
   | date | Date | Jan 15, 2024 |
   | rating | Number | 5 |
   | thumbnail | Files & Media | [image] |

---

## 🔍 Advanced Debugging

### Test Notion Connection

Create a test file `test-notion.js`:

```javascript
require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function testConnection() {
  try {
    console.log('Testing Notion connection...');
    console.log('API Key:', process.env.NOTION_API_KEY?.substring(0, 15) + '...');
    console.log('Database ID:', process.env.NOTION_BOOKS);
    
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BOOKS,
      page_size: 1
    });
    
    console.log('✅ Connection successful!');
    console.log('Results:', response.results.length);
    
    if (response.results.length > 0) {
      const page = response.results[0];
      console.log('First book:', page.properties.name?.title?.[0]?.plain_text);
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.code, error.message);
  }
}

testConnection();
```

Run it:
```sh
node test-notion.js
```

### Check Build Process

```sh
yarn build
```

Look for errors in the output. Common issues:
- Missing environment variables
- Invalid database IDs
- Network connectivity problems

### Enable Verbose Logging

The application now includes detailed console logs. Check your terminal for:

- ✅ Success messages (green checkmarks)
- ⚠️ Warning messages (yellow warning signs)
- ❌ Error messages (red X marks)
- 💡 Helpful hints (lightbulb)

---

## 📊 Validate Your Database Schema

### Books Database Must Have:

```
Properties (case-sensitive):
├── name (Title type) ✅
├── author (Text type) ✅
├── status (Select type) ✅
│   ├── Option: "Reading"
│   └── Option: "Finished"
├── date (Date type) ✅
├── rating (Number type) ✅
├── thumbnail (Files & Media type) ✅
├── notes (Checkbox type) ✅
├── link (URL type)
└── last_updated (Last edited time)
```

### How to Check:

1. Open Books database in Notion
2. Click the `•••` menu at the top
3. Select "Properties"
4. Verify each property exists with the correct type

---

## 🆘 Still Having Issues?

### Step 1: Check Console Logs

Open Developer Tools in your browser:
- Chrome: `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Option+J` (Mac)
- Look for red error messages

### Step 2: Check Server Logs

In your terminal where `yarn dev` is running:
- Look for error messages
- Note any stack traces
- Check for environment variable warnings

### Step 3: Verify Network

Test if you can reach Notion:
```sh
curl -H "Authorization: Bearer $NOTION_API_KEY" \
     https://api.notion.com/v1/users/me
```

### Step 4: Try Fresh Start

```sh
# Stop server
# Delete node_modules
rm -rf node_modules
rm -rf .next

# Reinstall
yarn install

# Restart
yarn dev
```

### Step 5: Check Notion Status

Visit [https://status.notion.so](https://status.notion.so) to see if Notion is down.

---

## 📚 Additional Resources

- [Notion API Documentation](https://developers.notion.com/docs)
- [Notion Integration Setup](https://developers.notion.com/docs/create-a-notion-integration)
- [Next.js Documentation](https://nextjs.org/docs)
- [Original Repository Issues](https://github.com/opakholis/bookshelf/issues)

---

## 💬 Getting Help

If you've tried everything above and still have issues:

1. Check existing [GitHub Issues](https://github.com/jgfall/bookshelf/issues)
2. Open a new issue with:
   - What you tried
   - Error messages (from console and terminal)
   - Your Notion database structure (screenshot)
   - Environment variable format (without actual values)

---

**Remember:** Never share your actual `NOTION_API_KEY` or database IDs publicly!
