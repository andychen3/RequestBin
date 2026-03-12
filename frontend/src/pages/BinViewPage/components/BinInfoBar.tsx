import { useState } from "react";

type Props = {
  binRoute: string;
  sendUrl: string;
};

const BinInfoBar = ({ binRoute, sendUrl }: Props) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="bin-view-info">
      <span className="bin-view-info-label">Bin Route:</span>
      <span className="bin-view-info-url">{binRoute}</span>
      <span className="bin-view-info-divider">|</span>
      <span className="bin-view-info-label">Send URL:</span>
      <span className="bin-view-info-url">{sendUrl}</span>
      <button
        className="bin-view-copy-btn"
        onClick={() => {
          navigator.clipboard.writeText(sendUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        title="Copy send URL"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {copied && <span>Copied!</span>}
      </button>
    </div>
  );
};

export default BinInfoBar;
