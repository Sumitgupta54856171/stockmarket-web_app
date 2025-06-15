'use client'

import Script from 'next/script';
import Head from 'next/head';

const ChatBot = () => {
  const chatbotHTML = `
    <df-messenger
      location="us-central1"
      project-id="geometric-team-457805-j0"
      agent-id="09717de9-2da3-4b01-8f31-28984361976b"
      language-code="en"
      max-query-length="-1">
      <df-messenger-chat-bubble chat-title="Nevmarket"></df-messenger-chat-bubble>
    </df-messenger>
  `;

  return (
    <>
      <Head>
        <link 
          rel="stylesheet" 
          href="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css"
        />
      </Head>

      <Script
        src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"
        strategy="afterInteractive"
      />

      <div dangerouslySetInnerHTML={{ __html: chatbotHTML }} />

      <style jsx>{`
        :global(df-messenger) {
          z-index: 999;
          position: fixed;
          --df-messenger-font-color: #000;
          --df-messenger-font-family: Google Sans;
          --df-messenger-chat-background: #f3f6fc;
          --df-messenger-message-user-background: #d3e3fd;
          --df-messenger-message-bot-background: #fff;
          bottom: 16px;
          right: 16px;
        }
      `}</style>
    </>
  );
};

export default ChatBot;