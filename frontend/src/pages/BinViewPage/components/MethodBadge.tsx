type Props = {
  method: string;
}

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

const MethodBadge = ({ method }: Props) => {
  return (
    <span className={methodClass(method)}>
      {method}
    </span>
  );
};

export default MethodBadge;
