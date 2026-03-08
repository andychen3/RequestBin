import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

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
  const [selectedId, setSelectedId] = useState(null);

  // useEffect(() => {

  // }, [])

  return (
    <section>
      <Link to="/">Back to bins</Link>
      <p>Bin Route:{bin.bin_route}</p>
      <p>Send URL:{bin.send_url}</p>
      {requests.map(request => (
        <div key={request.id}>
          <p>Request {request.id}: {request.method} {request.path}</p>
          <p>Body: {request.body.raw}</p>
        </div>
      ))}
    </section>
  );
};

export default BinViewPage;
