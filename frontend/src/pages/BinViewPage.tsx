import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBin } from './binViewService';

const BinViewPage = () => {
  const { binRoute } = useParams<{ binRoute: string }>();

  const mockBin = {
  bin_route: "abc123",
  send_url: "/in/abc123",
  requests: [
    {
      id: 1,
      method: "POST",
      path: "/in/abc123",
      created_at: "2026-03-08 10:00:00",
      headers: { "content-type": "application/json" },
      body: { raw: '{"hello": "world"}' }
    }
  ]
};

  const [bin, setBin] = useState(mockBin);
  const [requests, setRequests] = useState(mockBin.requests);

  useEffect(() => {
    if (!binRoute) return;
    const token = localStorage.getItem(binRoute);
    if (!token) return;
    getBin(binRoute, token).then(data => {
      setBin(data);
      setRequests(data.requests);
    })
  }, [])

  return (
  <section>
    <Link to="/">Back to bins</Link>
    <p>Bin Route: {bin.bin_route}</p>
    <p>Send URL: {bin.send_url}</p>
    {requests.map(request => (
      <div key={request.id} style={{ display: "flex", borderBottom: "1px solid #ccc", padding: "10px 0" }}>
        <div style={{ width: "20%" }}>
          <p>{request.method}</p>
          <p>{request.created_at}</p>
        </div>
        <div style={{ width: "80%" }}>
          <p>{request.path}</p>
          <p>Headers: {JSON.stringify(request.headers)}</p>
          <p>Body: {request.body.raw}</p>
        </div>
      </div>
    ))}
  </section>
)};
export default BinViewPage;
