type Props = {
  headers: Record<string, string>;
};

const RequestHeaders = ({ headers }: Props) => {
  return (
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
            {Object.entries(headers).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td className="header-value">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RequestHeaders;
