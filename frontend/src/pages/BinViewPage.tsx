import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBin } from './BinViewService';
import type { BinRequest } from '../types/request-bin';
import './BinViewPage.css';

const methodClass = (method: string): string => {
  const map: Record<string, string> = {
    GET: "bin-view-method-GET",
    POST: "bin-view-method-POST",
    PUT: "bin-view-method-PUT",
    PATCH: "bin-view-method-PATCH",
    DELETE: "bin-view-method-DELETE",
  };
  return `bin-view-method ${map[method] ?? "bin-view-method-default"}`;
};

const formatDateTime = (datetime: string) => {
  const [date, time] = datetime.split(" ");
  return { date, time };
};

const BinViewPage = () => {
  const { binRoute } = useParams<{ binRoute: string }>()
  const [bin, setBin] = useState({ bin_route: "", send_url: "" });
  const [requests, setRequests] = useState<BinRequest[]>([]);
  const [copied, setCopied] = useState(false);
  const [expandedBodies, setExpandedBodies] = useState<Set<number>>(new Set());

  useEffect(() => {
  if (!binRoute) return;
  const token = localStorage.getItem(`basket_${binRoute}`);
  console.log("binRoute:", binRoute);
  console.log("token:", token);
  if (!token) return;
  getBin(binRoute, token).then(data => {
    setBin({ ...data, send_url: `/in/${data.bin_route}` });
    setRequests(data.requests);
  }).catch((error) => {
    console.error("getBin failed:", error);
  });
}, []);

  return (
    <div className="bin-view-page">
      <div className="bin-view-container">
        <Link
          to="/"
          style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}
        >
          ← Back to Bins
        </Link>
        {/* Title + status */}
        <div className="bin-view-title-row">
          <h1 className="bin-view-heading">Incoming Requests</h1>
          <div className="bin-view-status">
            <span className="bin-view-status-dot">
              <span className="bin-view-status-dot-ping"></span>
              <span className="bin-view-status-dot-solid"></span>
            </span>
            Listening
          </div>
        </div>

      {/* Title + status */}
      <div className="bin-view-title-row">
        <h1 className="bin-view-heading">Incoming Requests</h1>
        <div className="bin-view-status">
          <span className="bin-view-status-dot">
            <span className="bin-view-status-dot-ping"></span>
            <span className="bin-view-status-dot-solid"></span>
          </span>
          <span className="bin-view-info-divider">|</span>
          <span className="bin-view-info-label">Send URL:</span>
          <span className="bin-view-info-url">{bin.send_url}</span>
          <button
            className="bin-view-copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(bin.send_url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            title="Copy send URL"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {copied && <span>Copied!</span>}
          </button>
        </div>

        {/* Request list */}
        <main className="bin-view-main">
          {requests.length === 0 ? (
            <div className="bin-view-empty">
              <p>No requests yet.</p>
              <p>
                Send a request to <code>{bin.send_url}</code> to get started.
              </p>
            </div>
          ) : (
            requests.map((request, index) => {
              const { date, time } = formatDateTime(request.created_at);
              return (
                <article
                  key={index}
                  className={`bin-view-request bin-view-request--${request.method}`}
                >
                  {/* Left: method + date + time */}
                  <div className="bin-view-request-meta">
                    <span className={methodClass(request.method)}>
                      {request.method}
                    </span>
                    <div className="bin-view-date">{date}</div>
                    <div className="bin-view-time">{time}</div>
                  </div>

                  {/* Right: details */}
                  <div className="bin-view-request-detail">
                    {/* Path */}
                    <section className="bin-view-section">
                      <h3 className="bin-view-section-title">
                        <svg
                          className="bin-view-section-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        URL / Path
                      </h3>
                      <div className="bin-view-path-row">
                        <span className="bin-view-path">{request.path}</span>
                      </div>
                    </section>

                    {/* Headers */}
                    <section className="bin-view-section">
                      <h3 className="bin-view-section-title">
                        <svg
                          className="bin-view-section-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 10h16M4 14h16M4 18h16"
                          />
                        </svg>
                        Request Headers
                      </h3>
                      <div className="bin-view-headers-table-wrapper">
                        <table className="bin-view-headers-table">
                          <thead>
                            <tr>
                              <th>Key</th>
                              <th>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(request.headers).map(
                              ([key, value]) => (
                                <tr key={key}>
                                  <td>{key}</td>
                                  <td className="header-value">{value}</td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Body */}
                    {request.body && Object.keys(request.body).length > 0 && (
                      <section className="bin-view-section">
                        <h3
                          className="bin-view-section-title"
                          onClick={() => {
                            const next = new Set(expandedBodies);
                            next.has(index)
                              ? next.delete(index)
                              : next.add(index);
                            setExpandedBodies(next);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <svg
                            className="bin-view-section-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Request Body
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{
                              width: "16px",
                              height: "16px",
                              transform: expandedBodies.has(index)
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </h3>
                        {expandedBodies.has(index) && (
                          <div className="bin-view-body-block">
                            <pre>{JSON.stringify(request.body, null, 2)}</pre>
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </main>
      </div>

      {/* Bin info */}
      <div className="bin-view-info">
        <span className="bin-view-info-label">Bin Route: {bin.bin_route}</span>
        <span className="bin-view-info-divider">|</span>
        <span className="bin-view-info-label">Send URL:</span>
        <span className="bin-view-info-url">{bin.send_url}</span>
        <button
          className="bin-view-copy-btn"
          onClick={() => navigator.clipboard.writeText(bin.send_url)}
          title="Copy send URL"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Request list */}
      <main className="bin-view-main">
        {requests.map((request, index) => {
          const { date, time } = formatDateTime(request.created_at);
          return (
            <article key={index} className={`bin-view-request bin-view-request--${request.method}`}>

              {/* Left: method + date + time */}
              <div className="bin-view-request-meta">
                <span className={methodClass(request.method)}>
                  {request.method}
                </span>
                <div className="bin-view-date">{date}</div>
                <div className="bin-view-time">{time}</div>
              </div>

              {/* Right: details */}
              <div className="bin-view-request-detail">

                {/* Path */}
                <section className="bin-view-section">
                  <h3 className="bin-view-section-title">
                    <svg className="bin-view-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    URL / Path
                  </h3>
                  <div className="bin-view-path-row">
                    <span className="bin-view-path">{request.path}</span>
                    <button
                      className="bin-view-path-copy-btn"
                      onClick={() => navigator.clipboard.writeText(request.path)}
                      title="Copy path"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </section>

                {/* Headers */}
                <section className="bin-view-section">
                  <h3 className="bin-view-section-title">
                    <svg className="bin-view-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Request Headers
                  </h3>
                  <div className="bin-view-headers-table-wrapper">
                    <table className="bin-view-headers-table">
                      <thead>
                        <tr>
                          <th>Key</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(request.headers).map(([key, value]) => (
                          <tr key={key}>
                            <td>{key}</td>
                            <td className="header-value">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Body */}
                {request.body && Object.keys(request.body).length > 0 && (
                  <section className="bin-view-section">
                    <h3 className="bin-view-section-title">
                      <svg className="bin-view-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Request Body
                    </h3>
                    <div className="bin-view-body-block">
                      <pre>{JSON.stringify(request.body, null, 2)}</pre>
                    </div>
                  </section>
                )}

              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
};

export default BinViewPage;
