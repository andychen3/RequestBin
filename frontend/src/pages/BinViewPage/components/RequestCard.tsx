import MethodBadge from "./MethodBadge";
import RequestHeaders from "./RequestHeaders";
import RequestBody from "./RequestBody";
import type { BinRequest } from "../../../types/request-bin";

type Props = {
  request: BinRequest;
};

const formatDateTime = (datetime: string) => {
  const [date, time] = datetime.split(" ");
  return { date, time };
};

const RequestCard = ({ request}: Props) => {
  const { date, time } = formatDateTime(request.created_at);

  return (
    <article
      className={`bin-view-request bin-view-request--${request.method}`}
    >
      {/* Left: method + date + time */}
      <div className="bin-view-request-meta">
        <MethodBadge method={request.method} />
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
          </div>
        </section>

        <RequestHeaders headers={request.headers} />
        <RequestBody body={request.body} />
      </div>
    </article>
  );
};

export default RequestCard;
