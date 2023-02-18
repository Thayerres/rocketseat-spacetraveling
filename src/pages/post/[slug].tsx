import * as prismicH from '@prismicio/helpers';
import Header from '@/components/Header';
import { createClient } from '@/services/prismic';
import commonStyles from '@/styles/common.module.scss';
import styles from './post.module.scss';

import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';
import Image from 'next/image';
import { Content } from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { formatDate } from '@/utils/formatDate';
import { useRouter } from 'next/router';

interface Post {
  readTime: number;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: Array<Content.PostsDocumentDataContentItem>;
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Header />
      <Image
        className={styles.image}
        src={post.data.banner.url}
        alt=""
        width={1440}
        height={400}
      />
      <div className={commonStyles.container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <div className={styles.info}>
          <span>
            <FiCalendar />
            {post.first_publication_date}
          </span>
          <span>
            <FiUser />
            {post.data.author}
          </span>
          <span>
            <FiClock />
            {`${post.readTime} min`}
          </span>
        </div>
        {post.data.content.map(content => {
          return (
            <article className={styles.content} key={content.heading}>
              <h1 className={styles.content_title}>{content.heading}</h1>
              <div
                className={styles.content_body}
                dangerouslySetInnerHTML={{
                  __html: prismicH.asHTML(content.body),
                }}
              />
            </article>
          );
        })}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient();
  const allPosts = await client.getAllByType('posts');

  const paths = allPosts.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}: GetStaticPropsContext<{ slug: string }>) => {
  const prismic = createClient({ previewData });
  const response = await prismic.getByUID('posts', params.slug);
  let words = 0;

  response.data.content.map(item => {
    words += item.heading.split(' ').length;

    const bodyWords = item.body.map(item => item.text.split(' ').length);
    bodyWords.map(word => (words += word));
  });

  const readTime = Math.ceil(words / 200);

  const post: Post = {
    readTime,
    first_publication_date: formatDate(response.first_publication_date),
    data: {
      author: response.data.author,
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
