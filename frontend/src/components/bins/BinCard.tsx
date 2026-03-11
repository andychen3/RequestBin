import "./BinCard.css";

type BinCardProps = {
  route: string;
  onOpen: () => void;
  onDelete: () => void;
};

export const BinCard = ({ route, onOpen, onDelete }: BinCardProps) => {
  const path = `/${route}`;

  return (
    <div className="bin-card">
      <div className="bin-card__header">
        <div className="bin-card__identity">
          <div className="bin-card__icon">
            <svg
              className="bin-card__icon-svg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </div>
          <div>
            <h3 className="bin-card__title">{route}</h3>
            <code className="bin-card__path">{path}</code>
          </div>
        </div>
        <button
          type="button"
          className="bin-card__delete"
          onClick={onDelete}
          aria-label="Delete bin"
        >
          <svg
            className="bin-card__delete-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            ></path>
          </svg>
        </button>
      </div>

      <div className="bin-card__meta">
        <div className="bin-card__meta-row">
          <span className="bin-card__requests">
            <svg
              className="bin-card__requests-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            0 Requests
          </span>
          <span className="bin-card__last-active">Just created</span>
        </div>
        <div className="bin-card__progress-bar">
          <div className="bin-card__progress-bar-fill" />
        </div>
      </div>

      <div className="bin-card__footer">
        <button type="button" className="bin-card__open" onClick={onOpen}>
          Open Inspector
          <svg
            className="bin-card__open-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M14 5l7 7m0 0l-7 7m7-7H3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
