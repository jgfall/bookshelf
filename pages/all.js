import { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { CaretDown, CheckCircle } from 'phosphor-react';

import Container from '@/components/Container';
import BookCard, { LinkWrapper } from '@/components/BookCard';
import SuggestionForm from '@/components/SuggestionForm';

import { getBooksTable } from '@/config/notion';

const sortOptions = [{ name: 'Terbaru' }, { name: 'Rating' }];

export default function All({ finished, hasError, errorMessage, totalBooks }) {
  const [sorting, setSorting] = useState(sortOptions[0].name);
  const [searchValue, setSearchValue] = useState('');

  const filteredBooks = finished
    .sort((a, b) => {
      if (sorting === 'Terbaru') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return b.rating - a.rating;
    })
    .filter(
      (f) =>
        f.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        f.author.toLowerCase().includes(searchValue.toLowerCase())
    );

  // Determine what message to show
  const getEmptyStateMessage = () => {
    if (hasError) {
      return (
        <div className="my-10 p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-medium text-red-800">❌ {errorMessage}</p>
          <p className="mt-2 text-sm text-red-700">
            💡 Please check your .env file and ensure:
          </p>
          <ul className="mt-2 ml-4 text-sm text-red-700 list-disc">
            <li>NOTION_API_KEY is set correctly</li>
            <li>NOTION_BOOKS database ID is correct</li>
            <li>Your Notion integration has access to the database</li>
            <li>The database has entries with status="Finished"</li>
          </ul>
        </div>
      );
    }

    if (totalBooks === 0) {
      return (
        <div className="my-10 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-medium text-yellow-800">📚 No books in your database yet</p>
          <p className="mt-2 text-sm text-yellow-700">
            Start adding books to your Notion database to see them here!
          </p>
        </div>
      );
    }

    if (searchValue && filteredBooks.length === 0) {
      return (
        <div className="my-10 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-medium text-blue-800">
            🔍 No books found matching "{searchValue}"
          </p>
          <p className="mt-2 text-sm text-blue-700">
            Try adjusting your search terms or browse all books below.
          </p>
        </div>
      );
    }

    if (finished.length === 0) {
      return (
        <div className="my-10 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="font-medium text-gray-800">
            📖 No finished books in your collection yet
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Books with status="Finished" will appear here automatically.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Container
      title="Koleksi Buku - Opa Kholis Majid"
      description="Halaman ini berisi resensi, catatan, dan ulasan terhadap Buku yang
          sudah saya baca."
      searchBar={(e) => setSearchValue(e.target.value)}
    >
      <div className="h-[420px] absolute -top-24 w-full bg-groovy-lilac" />
      <main className="relative z-40 mx-auto p-6 w-full max-w-screen-sm bg-white rounded-xl md:mt-20 md:max-w-screen-md">
        <div className="leading-7 space-y-3">
          <h1 className="pb-3 text-gray-900 text-2xl font-bold">Koleksi Buku</h1>
          <p>
            Mulai gemar membaca di awal tahun 2021, dengan didasari oleh hasutan teman yang berhasil
            membuka minat saya terhadap dunia literatur.
          </p>
          <p>
            Dan hei, halaman ini berisi buku-buku yang telah saya baca dengan resensi dan ulasan
            terhadap buku tersebut. Enjoy!
          </p>
        </div>
        <div className="my-6">
          <SuggestionForm />
        </div>

        {finished.length > 0 && (
          <div className="my-6">
            <Listbox value={sorting} onChange={setSorting}>
              <Listbox.Label className="float-left">Urutkan Berdasarkan: </Listbox.Label>
              <div className="relative w-64">
                <Listbox.Button className="focus-visible:ring-groovy-violet/20 inline-flex items-center ml-1 px-1 text-groovy-violet font-medium rounded focus:outline-none focus-visible:ring-2">
                  {sorting}
                  <CaretDown size={19} weight="bold" className="pl-1" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 mt-1 p-2 w-full bg-white rounded-md focus:outline-none shadow-md sm:text-sm md:left-40">
                  {sortOptions.map(({ name }) => (
                    <Listbox.Option
                      key={name}
                      value={name}
                      className={({ active }) =>
                        `${active ? 'text-groovy-violet bg-groovy-violet/10' : 'text-gray-900'}
                          select-none relative py-2 pl-10 pr-4 flex items-center rounded`
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          {name}
                          {selected ? (
                            <span
                              className={`${
                                active ? 'text-groovy-violet' : 'text-groovy-violet'
                              } absolute inset-y-0 left-0 pl-3 flex items-center`}
                            >
                              <CheckCircle size={20} weight="regular" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        )}

        {getEmptyStateMessage()}

        {filteredBooks.length > 0 && (
          <div className="grid gap-7 grid-cols-1 pt-3 md:grid-cols-3">
            {filteredBooks.map((book) =>
              book.notes ? (
                <LinkWrapper book={book} key={book.id}>
                  <BookCard book={book} featured />
                </LinkWrapper>
              ) : (
                <BookCard book={book} key={book.id} featured />
              )
            )}
          </div>
        )}
      </main>
    </Container>
  );
}

export async function getStaticProps() {
  let hasError = false;
  let errorMessage = '';

  try {
    console.log('📚 Building all books page...');
    
    const booksTable = await getBooksTable();

    // Validate data type
    if (!Array.isArray(booksTable)) {
      console.error('❌ booksTable is not an array:', typeof booksTable);
      hasError = true;
      errorMessage = 'Unable to load books from Notion database';
      
      return {
        props: {
          books: [],
          finished: [],
          hasError: true,
          errorMessage,
          totalBooks: 0
        },
        revalidate: 10
      };
    }

    // Filter with validation
    const finished = booksTable.filter((book) => {
      if (!book) {
        console.warn('⚠️ Encountered null/undefined book entry');
        return false;
      }
      return book.status === 'Finished';
    });

    console.log(`✅ All books page built successfully:`);
    console.log(`   - Total books: ${booksTable.length}`);
    console.log(`   - Finished books: ${finished.length}`);

    // Check if we're using fallback data
    if (booksTable.length === 1 && booksTable[0].name === 'Sample Book - Configuration Needed') {
      hasError = true;
      errorMessage = 'Using sample data - Notion database not configured';
    }

    return {
      props: {
        books: booksTable,
        finished,
        hasError,
        errorMessage,
        totalBooks: booksTable.length
      },
      revalidate: 10
    };
  } catch (error) {
    console.error('❌ Error in getStaticProps for all books page:', error.message);
    
    return {
      props: {
        books: [],
        finished: [],
        hasError: true,
        errorMessage: `Failed to build page: ${error.message}`,
        totalBooks: 0
      },
      revalidate: 10
    };
  }
}
