import React from 'react';

export type TocItem = {
    depth: number;
    slug: string;
    title: string;
};

const TocContainer = ({ activeHeading, activeSubHeading, CurrentDocsSlug }) => {
    const [toc, setToc] = React.useState<TocItem[] | []>([]);
    React.useEffect(() => {
        const list: TocItem[] = [];
        const ids = document.querySelectorAll('h2,h3');
        ids.forEach((t) =>
            list.push({
                title: t.textContent || '',
                slug: t.id,
                depth: +t.tagName[1]
            })
        );
        setToc(list);
    }, []);
    return (
        <div className="toc-ctx">
            {toc.length !== 0 ? <p className="menu-title">ON THIS PAGE</p> : null}
            {toc.map((item) =>
                item.title !== '' ? (
                    <span
                        className={`${item.slug === activeHeading ? 'active-toc' : ''} text ${
                            item.depth === 3
                                ? `child ${item.slug === activeSubHeading ? 'active-sublink' : ''}`
                                : ''
                        }`}
                        key={item.slug}>
                        <a href={`#${item.slug}`}>{item.title}</a>
                    </span>
                ) : null
            )}
            {CurrentDocsSlug === 'server-side' ? (
                <>
                    <hr />
                    <div>
                        <a href="https://god.gw.postman.com/run-collection/22726679-47dcd974-29d5-4965-a35b-bf9b74a8b25a?action=collection%2Ffork&collection-url=entityId%3D22726679-47dcd974-29d5-4965-a35b-bf9b74a8b25a%26entityType%3Dcollection%26workspaceId%3Dd9145dd6-337b-4761-81d6-21a30b4147a2">
                            <img src="https://run.pstmn.io/button.svg" alt="Run in postman" />
                        </a>
                    </div>
                </>
            ) : null}

            <style jsx>{`
                .toc-ctx {
                    display: flex;
                    flex-direction: column;
                    padding-top: 16px;
                    position: sticky;
                    top: 96px;
                    right: 0;
                    height: calc(100vh - 96px);
                    overflow-y: auto;
                    overflow-x: clip;
                    margin-left: 16px;
                    padding-left: 10px;
                }
                .menu-title{
                    margin-left: -8px;
                }
                .head {
                    font-weight: bold;
                    text-transform: uppercase;
                }
                a {
                    color: inherit;
                    text-decoration: none;
                    color: var(--docs_text_tertiary);
                }
                .text {
                    font-size: 14px;
                    margin: 0.5rem 0;
                    color: var(--docs_text_tertiary);
                }
                .text a {
                    padding-left: 1rem !important;
                    display: block;
                }
                .child {
                    margin-left: 1.25rem;
                }
                ::-webkit-scrollbar {
                    width: 0px;
                }
                ::-webkit-scrollbar-thumb {
                    outline: 0px solid var(--gray7);
                }
                @media screen and (max-width: 1250px) {
                    .toc-ctx {
                        display: none;
                    }
                }
                button {
                    width: max-content;
                    background-color: #f16b16;
                    border-radius: 4px;
                    padding: 8px;
                    font-size: 12px;
                }
                hr {
                    margin: 24px 0;
                    max-width: 245px;
                }
            `}</style>
        </div>
    );
};

export default TocContainer;
