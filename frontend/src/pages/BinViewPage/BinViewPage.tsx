import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBin } from "./BinViewService";
import BinInfoBar from "./components/BinInfoBar";
import RequestCard from "./components/RequestCard";
import type { BinRequest } from "../../types/request-bin";
import "./BinViewPage.css";

const BinViewPage = () => {
  const { binRoute } = useParams<{ binRoute: string }>();
  const [bin, setBin] = useState({ bin_route: "", send_url: "" });
  const [requests, setRequests] = useState<BinRequest[]>([]);

  useEffect(() => {
    if (!binRoute) return;
    const token = localStorage.getItem(`basket_${binRoute}`);
    if (!token) return;
    getBin(binRoute, token)
      .then((data) => {
        setBin({ ...data, send_url: `/in/${data.bin_route}` });
        setRequests(data.requests);
      })
      .catch((error) => {
        console.error("getBin failed:", error);
      });
  }, []);

  return (
    <div className="bin-view-page">
      <div className="bin-view-container">
        <Link to="/" className="bin-view-back-link">
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
        <BinInfoBar binRoute={bin.bin_route} sendUrl={bin.send_url} />
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
            requests.map((request, index) => (
              <RequestCard key={index} request={request} />
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default BinViewPage;
