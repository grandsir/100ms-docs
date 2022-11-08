import EditFile from '@/components/EditFile';
import components from '@/components/MDXComponents';
import Pagination from '@/components/Pagination';
import Toc from '@/components/Toc';
import DocLayout from '@/layouts/DocLayout';
import getPagination from '@/lib/getPagination';
import imagePlugin from '@/lib/image';
import { scrollToUrlHash } from '@/lib/scrollToUrlHash';
import withTableofContents from '@/lib/withTableofContents';
import mdxPrism from 'mdx-prism';
import hydrate from 'next-mdx-remote/hydrate';
import renderToString from 'next-mdx-remote/render-to-string';
import { useRouter } from 'next/router';
import { join } from 'path';
import React from 'react';

// type NavRoute = {
//     url: string;
//     title: string;
// };

export type AllDocsType = {
    url: string;
    title: string;
    description: string;
    nav: number;
    content: string;
};

export interface PaginationType {
    url: string;
    title: string;
    description: string;
    nav: number;
    content: unknown;
}
interface Props {
    frontMatter: {
        title: string;
        nav: number;
    };
    // nav: Record<string, Record<string, NavRoute>>;
    pagination: {
        previousPost: PaginationType;
        nextPost: PaginationType;
    };
    // allDocs: AllDocsType[];
    source: {
        compiledSource: string;
        renderedOutput: string;
        scope: { title: string; nav: number };
    };
}

const DocSlugs = ({ source, frontMatter, pagination }: Props) => {
    const {
        query: { slug },
        asPath
    } = useRouter() as any;
    const [currentDocSlug] = slug as string[];
    const [activeHeading, setActiveHeading] = React.useState('');
    const [activeSubHeading, setActiveSubHeading] = React.useState('');
    const content = hydrate(source, { components });

    React.useEffect(() => {
        setTimeout(() => {
            scrollToUrlHash(asPath);
        }, 500);
    }, [asPath]);
    React.useEffect(() => {
        if (!window.location.href.includes('#')) window.scrollTo(0, 0);
        const getTopIndex = (arr) => {
            for (let i = arr.length - 1; i >= 0; i--)
                if (Math.floor(arr[i].getBoundingClientRect().top) < 200) return i;
            return -1;
        };
        const getActiveLinks = () => {
            const h2Array = document.getElementsByTagName('h2');
            const h3Array = document.getElementsByTagName('h3');

            const h2Index = getTopIndex(h2Array);
            const h3Index = getTopIndex(h3Array);

            if (h2Index >= 0) {
                setActiveHeading(h2Array[h2Index].id);
                if (
                    h3Index >= 0 &&
                    h3Array[h3Index].getBoundingClientRect().top >
                    h2Array[h2Index].getBoundingClientRect().top
                )
                    setActiveSubHeading(h3Array[h3Index].id);
                else setActiveSubHeading('');
            }
        };
        getActiveLinks();
        window.addEventListener('scroll', getActiveLinks);

        return () => window.removeEventListener('scroll', getActiveLinks);
    }, []);
    let showPagination = true;
    // Don't show Pagination for Android
    if (slug[1] === 'android') {
        showPagination = false;
    }
    return (
        <>
            <article>
                <h1>{frontMatter.title}</h1>
                {content}
                <hr />
                {pagination.previousPost && showPagination && (
                    <Pagination next={pagination.nextPost} prev={pagination.previousPost} />
                )}
                <EditFile slug={asPath} />
            </article>
            <Toc
                activeHeading={activeHeading}
                activeSubHeading={activeSubHeading}
                CurrentDocsSlug={currentDocSlug}
            />
            <style jsx>{`
                 article {
                     max-width: 1200px;
                     width: calc(100vw - 630px);
                     flex-grow: 1;
                     box-sizing: border-box;
                     padding: 0 2rem;
                     min-height: calc(100vh - 140px);
                     padding-bottom: 80px;
                     display: flex;
                     flex-direction: column;
                 }
             `}</style>
        </>
    );
};

export default DocSlugs;

export const getStaticProps = async ({ params }) => {
    try {
        if (params.slug.join('/') !== params.slug.join('/').toLowerCase())
            return {
                redirect: {
                    destination: `/${params.slug.join('/').toLowerCase()}`,
                    permanent: true,
                },
            }
        const url = !process.env.VERCEL_URL || process.env.VERCEL_URL === 'localhost' ? `http://localhost:${process.env.PORT}` : `https://${process.env.VERCEL_URL}`;
        const { docs: allDocs, nav } = (await (await fetch(`${url}/docs/api/content?query=*`)).json())
        const [currentDocSlug] = params.slug as string[];
        const currentDocs = allDocs.filter((doc) => doc.url.includes(`/${currentDocSlug}/`));
        const { previousPost, nextPost } = getPagination(currentDocs, params.slug as string[]);
        const pagination = { previousPost, nextPost };
        const toc = [];
        const [currentNavDoc] = allDocs.filter((doc) => doc.url.includes(`/${join(...params.slug)}`));
        const { content } = currentNavDoc
        const data = {
            ...currentNavDoc
        }
        delete data.content;
        const mdxSource = await renderToString(content, {
            components,
            // Optionally pass remark/rehype plugins
            mdxOptions: {
                remarkPlugins: [
                    require('@/lib/remark-code-header'),
                    require('@fec/remark-a11y-emoji'),
                    withTableofContents(toc),
                    imagePlugin
                ],
                rehypePlugins: [mdxPrism]
            },
            scope: data
        });
        return {
            props: {
                toc,
                pagination,
                nav: { [currentDocSlug]: nav[currentDocSlug] },
                source: mdxSource, // { compiledSource: mdxSource.compiledSource },
                frontMatter: data,
            }
        };
    } catch {
        return {
            notFound: true,
        }
    }
};

export const getStaticPaths = async () =>
// Map the path into the static paths object required by Next.js
// Would Contains all slugs for files inside Docs
// const paths = getDocsPaths().map((slug) => ({
//     params: {
//         slug: slug.split(path.sep).filter(Boolean)
//     }
// }));

({
    paths: [],
    fallback: "blocking"
});

DocSlugs.getLayout = function getLayout(page) {
    return <DocLayout>{page}</DocLayout>;
};
