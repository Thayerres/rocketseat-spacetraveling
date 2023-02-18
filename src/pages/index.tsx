import Header from '@/components/Header';
import commonStyles from '@/styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { GetStaticProps } from 'next';
import { createClient } from '@/services/prismic';
import Link from 'next/link';
import { formatDate } from '@/utils/formatDate';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  async function handleMorePosts() {
    if (nextPage === null) return;

    const response = await fetch(nextPage);
    const data: PostPagination = await response.json();

    const newPosts = data.results.map(post => {
      post.first_publication_date = formatDate(post.first_publication_date);
      return post;
    });

    setNextPage(data.next_page);
    setPosts(state => [...state, ...newPosts]);
  }

  return (
    <>
      <Header />

      <div className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(post => {
            return (
              <Link
                key={post.uid}
                href={`post/${post.uid}`}
                passHref
                legacyBehavior
              >
                <div className={styles.post}>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.post_info}>
                    <span>
                      <FiCalendar />
                      {post.first_publication_date}
                    </span>
                    <span>
                      <FiUser />
                      {post.data.author}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {nextPage ? (
          <button className={styles.more_posts} onClick={handleMorePosts}>
            Carregar mais posts
          </button>
        ) : null}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = createClient({ previewData });

  const postsResponse = await prismic.getByType('posts', {
    pageSize: 3,
    orderings: {
      field: 'document.first_publication_date',
      direction: 'desc',
    },
  });

  const posts = postsResponse.results.map(posts => {
    return {
      uid: posts.uid,
      first_publication_date: formatDate(posts.first_publication_date),
      data: {
        title: posts.data.title,
        subtitle: posts.data.subtitle,
        author: posts.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
