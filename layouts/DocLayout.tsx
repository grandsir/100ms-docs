import React from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Toc from '@/components/Toc';
import { PaginationType } from '@/lib/getPagination';
import { scrollToUrlHash } from '@/lib/scrollToUrlHash';
import useLockBodyScroll from '@/lib/useLockBodyScroll';
import EditFile from '@/components/EditFile';
import SegmentAnalytics from '@/components/SegmentAnalytics';

type NavRoute = {
    url: string;
    title: string;
};

export type AllDocsType = {
    url: string;
    title: string;
    description: string;
    nav: number;
    content: string;
};

interface Props {
    frontMatter: {
        title: string;
        nav: number;
    };
    nav: Record<string, Record<string, NavRoute>>;
    pagination: {
        previousPost: PaginationType;
        nextPost: PaginationType;
    };
    allDocs: AllDocsType[];
}

const DocLayout: React.FC<Props> = ({ frontMatter, nav, children, pagination, allDocs }) => {
    const router = useRouter();
    const SEO = {
        title: `${
            frontMatter.title || '100ms Docs'
        } | 100ms - Video conferencing infrastructure for a video-first world`,
        openGraph: {
            title: `${
                frontMatter.title || '100ms Docs'
            } | 100ms - Video conferencing infrastructure for a video-first world`
        },
        canonical: `${process.env.NEXT_PUBLIC_CANONICAL_BASE_URL}${
            router.asPath === '/' ? '' : router.asPath.split('?')[0]
        }`
    };
    const [menu, setMenu] = React.useState(false);
    const [modal, setModal] = React.useState(false);
    const menuState = { menu, setMenu };
    const [activeHeading, setActiveHeading] = React.useState('');
    const [activeSubHeading, setActiveSubHeading] = React.useState('');

    useLockBodyScroll(modal);
    let newNav;
    // if 3 levels of directory
    let showPagination = true;
    // @ts-ignore
    if (router.query.slug[0] !== 'v1' && router.query.slug[0] !== 'v2') {
        // TODO: remove this ^ not needed if `v1` & `v2` docs are replaced
        // @ts-ignore
        if (router.query.slug?.length > 3) {
            // @ts-ignore
            newNav = nav[router.query.slug[1]];
            // ? Case for `api-reference`
            // @ts-ignore
            if (router.query.slug[0] === 'api-reference') {
                // Don't show Pagination for Android
                // @ts-ignore
                if (router.query.slug[1] === 'android') {
                    showPagination = false;
                }
                // object -> folder-> content
                // @ts-ignore
                newNav = nav[router.query.slug[1]][router.query.slug[2]];
            }
        }
    } else {
        newNav = nav;
    }

    React.useEffect(() => {
        setTimeout(() => {
            scrollToUrlHash(router.asPath);
        }, 500);
    }, [router.asPath]);

    React.useEffect(() => {
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

    return (
        <>
            <div className="page">
                <NextSeo {...SEO} />
                <SegmentAnalytics options={{}} title={frontMatter.title} />
                <Header modal={modal} setModal={setModal} menuState={menuState} docs={allDocs} currentDocSlug={''} />
                <div className="ctx">
                    <div className="content-wrapper">
                        <div
                            className="sidebar-container"
                            style={{
                                borderRight: '1px solid var(--new_border_default)'
                            }}>
                            <Sidebar menu={menu} nav={newNav} />
                        </div>
                        <article>
                            <h1>{frontMatter.title}</h1>
                            {children}
                            <hr />
                            {pagination.previousPost && showPagination && (
                                <Pagination
                                    next={pagination.nextPost}
                                    prev={pagination.previousPost}
                                />
                            )}
                            <EditFile slug={router.asPath} />
                        </article>
                        <Toc activeHeading={activeHeading} activeSubHeading={activeSubHeading} />
                    </div>
                </div>
                <style jsx>{`
                    html {
                        height: 100%;
                        scroll-behavior: smooth !important;
                    }
                    .page {
                        margin: 0;
                    }
                    .ctx {
                        display: flex;
                        width: 100%;
                        filter: blur(${modal ? '10px' : '0px'});
                        background-color: var(--sidebar_bg) !important;
                    }
                    .sidebar-container {
                        background-color: var(--sidebar_bg) !important;
                    }
                    .wrapper-ctx {
                        display: flex;
                    }
                    article {
                        max-width: 1200px;
                        width: calc(100vw - 590px);
                        flex-grow: 1;
                        box-sizing: border-box;
                        padding: 0 2rem;
                        min-height: calc(100vh - 140px);
                        padding-bottom: 80px;
                        display: flex;
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .content-wrapper {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        background-color: var(--article_bg);
                    }
                    .mobile-menu {
                        display: none;
                        position: absolute;
                    }
                `}</style>
                <Footer />
            </div>
        </>
    );
};

export default DocLayout;
