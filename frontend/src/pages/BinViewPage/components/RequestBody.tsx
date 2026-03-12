import { useState } from "react";

type Props = {
  body: Record<string, unknown>;
};

const RequestBody = ({ body }: Props) => {
  const [expanded, setExpanded] = useState(false);

  if (!body || Object.keys(body).length === 0) return null;

  return (
    <section className="bin-view-section">
      <h3
        className="bin-view-section-title"
        onClick={() => setExpanded(prev => !prev)}
        style={{ cursor: "pointer" }}
      >
        <svg className="bin-view-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Request Body
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{
            width: "16px",
            height: "16px",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </h3>
      {expanded && (
        <div className="bin-view-body-block">
          <pre>{JSON.stringify(body, null, 2)}</pre>
        </div>
      )}
    </section>
  );
};

export default RequestBody;
