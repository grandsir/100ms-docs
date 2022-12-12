import React from 'react';
import { Flex, Box, Button, Text } from '@100mslive/react-ui';
import useClickOutside from '@/lib/useClickOutside';
import { currentUser } from '../lib/currentUser';

const emojis = [{ score: 1 }, { score: 2 }, { score: 3 }, { score: 4 }];

const Feedback = () => {
    const [showTextBox, setShowTextBox] = React.useState(false);
    const [clickedEmoji, setClickedEmoji] = React.useState(0);
    const [submitSuccessful, setSubmitSuccessful] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const feedBackRef = React.useRef<HTMLDivElement | null>();
    const inputRef = React.useRef<HTMLTextAreaElement | undefined>();

    // @ts-ignore
    useClickOutside(feedBackRef, () => setShowTextBox(false));

    React.useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [clickedEmoji]);

    return (
        // @ts-ignore
        <Box ref={feedBackRef} css={{ maxWidth: '200px' }}>
            <hr />
            <Text
                variant="tiny"
                css={{ fontWeight: 'bold', color: '$textHighEmp', textTransform: 'uppercase' }}>
                Was this helpful?
            </Text>
            <Flex css={{ gap: '30px', p: '$9 0' }}>
                {emojis.map((emoji) => (
                    <span
                        title="Share your feedback!"
                        style={{ position: 'relative', width: '24px', height: '24px' }}
                        key={emoji.score}
                        onClick={() => {
                            setShowTextBox(true);
                            setClickedEmoji(emoji.score);
                        }}>
                        <img
                            className="emoji"
                            data-active={emoji.score === clickedEmoji}
                            src={`/emoji-${emoji.score}.png`}
                            style={{ position: 'absolute', top: '0', left: '0' }}
                            alt={`${emoji.score}`}
                        />
                    </span>
                ))}
            </Flex>
            <Box css={{ position: 'relative' }}>
                {submitSuccessful ? (
                    <Text
                        variant="xs"
                        css={{
                            color: '$textAccentHigh',
                            fontWeight: '$semiBold',
                            textAlign: 'center'
                        }}>
                        Feedback successfully submitted. Thank you!
                    </Text>
                ) : (
                    <div
                        className="bottomContent"
                        style={{
                            opacity: showTextBox ? '1' : '0',
                            top: showTextBox ? '0' : '-16px'
                        }}>
                        <textarea
                            maxLength={140}
                            placeholder="Please share your feedback"
                            cols={20}
                            rows={3}
                            // @ts-ignore
                            ref={inputRef}
                            onChange={(e) => {
                                setMessage(e.target.value);
                            }}
                            style={{
                                background: 'none',
                                fontSize: '13px',
                                marginBottom: '18px',
                                borderRadius: '4px'
                            }}
                        />
                        <Button
                            variant="primary"
                            css={{
                                ml: 'auto',
                                fontSize: '$sm',
                                padding: '$3 $6',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                window.analytics.track('docs.feedback.message', {
                                    title: document.title,
                                    message,
                                    referrer: document.referrer,
                                    path: window.location.pathname,
                                    rating: clickedEmoji,
                                    timeStamp: new Date().toLocaleString(),
                                    ...currentUser()
                                });
                                setSubmitSuccessful(true);
                            }}>
                            Submit
                        </Button>
                    </div>
                )}
            </Box>
            <style jsx>{`
                .emoji {
                    filter: grayscale(100%);
                    transition: 200ms ease-in-out;
                }

                .emoji:hover {
                    filter: none;
                    cursor: pointer;
                    transform: scale(1.05);
                }

                img.emoji[data-active='true'] {
                    filter: none;
                    transform: scale(1.08);
                }

                .bottomContent {
                    display: flex;
                    position: relative;
                    opacity: 0;
                    transition: opacity, top 0.3s;
                    flex-direction: column;
                    margin-bottom: 16px;
                }

                textarea {
                    resize: none;
                    padding: 8px;
                }
            `}</style>
        </Box>
    );
};

export default Feedback;
