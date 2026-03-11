import type { FormEvent } from "react";
import "./CreateBinPanel.css";

type CreateBinPanelProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
  isCreating?: boolean;
};

export const CreateBinPanel = ({
  value,
  onChange,
  onSubmit,
  isCreating = false,
}: CreateBinPanelProps) => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <div className="create-bin">
      <div className="create-bin__brand">
        <div className="create-bin__brand-icon">
          <svg
            className="create-bin__brand-icon-svg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M13 10V3L4 14h7v7l9-11h-7z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            ></path>
          </svg>
        </div>
        <div>
          <div className="create-bin__brand-title">RequestBin</div>
          <div className="create-bin__brand-subtitle">Webhook inspector</div>
        </div>
      </div>

      <h2 className="create-bin__section-title">Create New Bin</h2>

      <form className="create-bin__form" onSubmit={handleSubmit}>
        <label className="create-bin__label">
          <span className="create-bin__label-text">Bin Name (optional)</span>
          <input
            className="create-bin__input"
            placeholder="e.g., Stripe Webhooks"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>

        <div className="create-bin__preview">
          <div className="create-bin__preview-label">URL Preview</div>
          <div className="create-bin__preview-value">
            https://requestbin.io/v1/
            <span className="create-bin__preview-value-muted">
              {value || "auto-generated"}
            </span>
          </div>
        </div>

        <button className="create-bin__button" type="submit" disabled={isCreating}>
          <svg
            className="create-bin__button-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 4v16m8-8H4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            ></path>
          </svg>
          {isCreating ? "Creating..." : "Create New Bin"}
        </button>
      </form>
    </div>
  );
};
