import React from "react";
import client, { getClient } from "@lib/sanity";
import GetImage from "@utils/getImage";
import { NextSeo } from "next-seo";
import Layout from "@components/layout";
import Container from "@components/container";
import PostList from "@components/postlist";
import { configQuery } from "@lib/groq";
import CategoryLabel from "@components/blog/category";
const Category = ({ posts, siteConfig }) => {
  return (
    <Layout {...siteConfig}>
      <Container>
        <h1 className="text-3xl font-semibold tracking-tight text-center lg:leading-snug text-brand-primary lg:text-4xl dark:text-white">
          <CategoryLabel categories={posts[0].categories} />
        </h1>
        <div className="text-center">
          <p className="mt-2 text-lg">
            {posts[0].categories[0].description}
          </p>
        </div>
        <div className="grid gap-10 mt-10 lg:gap-10 md:grid-cols-2 xl:grid-cols-3 ">
          {posts?.length > 0 &&
            posts.map(post => (
              <PostList key={post._id} post={post} aspect="square" />
            ))}
        </div>
      </Container>
    </Layout>
  );
};

export async function getStaticPaths() {
  const paths = await client.fetch(
    `*[_type == "category" && defined(slug.current)][].slug.current`
  );

  return {
    paths: paths.map(slug => ({ params: { slug } })),
    fallback: true
  };
}

export async function getStaticProps(context, preview = false) {
  // It's important to default the slug so that it doesn't return "undefined"

  const { slug = "" } = context.params;
  const posts = await client.fetch(
    `*[_type == "post" && $slug in categories[]->.slug.current] {..., author->, categories[]->}`,
    {
      slug: slug
    }
  );
  const config = await getClient(preview).fetch(configQuery);

  return {
    props: {
      posts,
      siteConfig: { ...config },
      preview
    },
    revalidate: 10
  };
}

export default Category;
