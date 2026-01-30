import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'phosphor-react';
import { NotionRenderer } from 'react-notion';

import BookCard, { LinkWrapper } from '@/components/BookCard';
import Container from '@/components/Container';
import ReviewHeader from '@/components/ReviewHeader';
import Subscribe from '@/components/Subscribe';

import { NAME } from '@/utils/constant';
import { formatDate } from '@/utils/format-date';
import { getBooksTable, getPageBlocks, slugByName } from '@/config/notion';

export default function DetailBook({ book, page, moreBooks }) {
  if (!book) {
    return (
      <Container
        title="Book Not Found"
        description="The requested book could not be found"
      >
        <div className="relative mx-auto px-6 max-w-screen-sm py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h1>
          <p className="text-gray-600 mb-8">
            The book you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Link href="/all">
            <a className="text-groovy-violet hover:underline">← Back to all books</a>
          </Link>
        </div>
      </Container>
    );
  }

  const { name: title, author, date, thumbnail } = book;
  const seoTitle = `Resensi Buku ${title} Karya ${author}`;
  const seoDesc = `Catatan dan ulasan dari buku ${title} karya ${author}`;

  return (
    <Container
      type="article"
      title={seoTitle}
      image={thumbnail?.[0]?.url || '/static/images/placeholder-book.jpg'}
      description={seoDesc}
      date={date ? new Date(date).toISOString() : new Date().toISOString()}
    >
      <ReviewHeader book={book} />
      <div className="relative mx-auto px-6 max-w-screen-sm">
        <section className="flex items-center mb-3 mt-4 mb:mt-8">
          <Image src="/static/images/me.png" width={30} height={30} alt="me" priority />
          <h3 className="ml-2 text-gray-600 text-sm">
            <span>{NAME}</span>
            <span className="mx-1">/</span>
            {formatDate(book.date)}
          </h3>
        </section>

        {page ? (
          <>
            <NotionRenderer blockMap={page} />

            <section className="mb-4 mt-12">
              <Subscribe />
            </section>

            <section className="my-4">
              <p className="text-gray-600 text-sm">
                Tulisan ini diperbarui pada tanggal:
                <span className="ml-1 font-medium">
                  {formatDate(book?.last_updated || book?.date)}
                </span>
              </p>
            </section>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              Review content is not available for this book yet.
            </p>
          </div>
        )}

        {moreBooks && moreBooks.length > 0 && (
          <section className="mb-16 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[14.5px] text-gray-500 font-semibold uppercase">
                Lanjutkan Membaca
              </h3>
              <Link href="/all">
                <a className="fancy-link inline-flex items-center">
                  Koleksi <ArrowRight size={14} weight="bold" className="ml-0.5" />
                </a>
              </Link>
            </div>
            <div className="grid gap-5 grid-cols-1 pt-4 sm:grid-cols-2">
              {moreBooks.map((book) => (
                <LinkWrapper book={book} key={book.id}>
                  <BookCard book={book} />
                </LinkWrapper>
              ))}
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}

export async function getStaticPaths() {
  try {
    console.log('🔍 Generating static paths for book detail pages...');
    
    const booksTable = await getBooksTable();

    // Validate data
    if (!Array.isArray(booksTable)) {
      console.error('❌ booksTable is not an array in getStaticPaths');
      return {
        paths: [],
        fallback: false
      };
    }

    const paths = booksTable
      .filter((book) => {
        if (!book) return false;
        return book.status === 'Finished' && book.notes === true;
      })
      .map((book) => {
        const slug = slugByName(book.name);
        return `/${slug}`;
      })
      .filter((path) => path !== '/untitled'); // Filter out invalid slugs

    console.log(`✅ Generated ${paths.length} static paths for book pages`);

    return {
      paths,
      fallback: false
    };
  } catch (error) {
    console.error('❌ Error generating static paths:', error.message);
    return {
      paths: [],
      fallback: false
    };
  }
}

export async function getStaticProps({ params: { slug } }) {
  try {
    console.log(`📖 Building book detail page for slug: ${slug}`);
    
    const booksTable = await getBooksTable();

    // Validate data
    if (!Array.isArray(booksTable)) {
      console.error('❌ booksTable is not an array in getStaticProps');
      return {
        props: {
          book: null,
          page: null,
          moreBooks: []
        },
        revalidate: 10
      };
    }

    const published = booksTable
      .filter((book) => {
        if (!book) return false;
        return book.status === 'Finished' && book.notes === true;
      })
      .sort((a, b) => {
        const dateA = a.date ? Number(new Date(a.date)) : 0;
        const dateB = b.date ? Number(new Date(b.date)) : 0;
        return dateB - dateA;
      });

    const book = booksTable.find((b) => b && slugByName(b.name) === slug);

    if (!book) {
      console.warn(`⚠️ Book not found for slug: ${slug}`);
      return {
        props: {
          book: null,
          page: null,
          moreBooks: []
        },
        revalidate: 10
      };
    }

    const bookIndex = published.findIndex((b) => b && slugByName(b.name) === slug);
    const moreBooks = [...published, ...published]
      .slice(bookIndex + 1, bookIndex + 3)
      .filter(Boolean);

    // Try to fetch page blocks
    let page = null;
    try {
      page = await getPageBlocks(book.id);
      if (!page) {
        console.warn(`⚠️ No page blocks found for book: ${book.name}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching page blocks for ${book.name}:`, error.message);
    }

    console.log(`✅ Successfully built page for: ${book.name}`);

    return {
      props: {
        book,
        page,
        moreBooks,
        bookIndex,
        published
      },
      revalidate: 10
    };
  } catch (error) {
    console.error('❌ Error in getStaticProps for book detail:', error.message);
    
    return {
      props: {
        book: null,
        page: null,
        moreBooks: []
      },
      revalidate: 10
    };
  }
}
