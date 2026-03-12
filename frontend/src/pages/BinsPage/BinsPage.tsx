import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBin, deleteBin } from "./services";
import type { Bin } from "../../types/request-bin";
import { generateBinId } from "./utils";
import { BinPageLayout } from "./components/layout/BinPageLayout";
import { PageHeader } from "./components/layout/PageHeader";
import { CreateBinPanel } from "./components/bins/CreateBinPanel";
import { BinCard } from "./components/bins/BinCard";
import { Modal } from "./components/common/Modal";
import { BINS_STORAGE_PREFIX, useBinOrder } from "./hooks/useBinOrder";
import "./BinsPage.css";

type BinRoute = Bin["bin_route"];

const BinsPage = () => {
  const [urlInput, setUrlInput] = useState<BinRoute>(generateBinId());
  const [isCreating, setIsCreating] = useState(false);
  const [binsVersion, setBinsVersion] = useState(0);
  const [createdBin, setCreatedBin] = useState<{
    route: BinRoute;
    token: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BinRoute | null>(null);
  const navigate = useNavigate();
  const { orderedBins, addBin, removeBin } = useBinOrder();

  const BIN_ROUTE_PATTERN = /^[a-zA-Z0-9_-]{3,15}$/;

  const handleCreateBin = async (): Promise<void> => {
    const createdRoute = urlInput;
    const trimmed = createdRoute.trim();
    if (trimmed.length === 0) {
      alert("Bin URL cannot be empty.");
      return;
    }
    if (trimmed.length > 15) {
      alert("Bin URL must be 15 characters or fewer.");
      return;
    }
    if (!BIN_ROUTE_PATTERN.test(trimmed)) {
      alert(
        "Bin URL can only contain letters, numbers, hyphens, and underscores.",
      );
      return;
    }
    if (trimmed !== createdRoute) {
      setUrlInput(trimmed);
    }

    try {
      setIsCreating(true);
      const response = await createBin(trimmed);
      localStorage.setItem(`${BINS_STORAGE_PREFIX}${trimmed}`, response.token);
      addBin(trimmed);
      setCreatedBin({ route: trimmed, token: response.token });
      setUrlInput(generateBinId());
      setBinsVersion((version) => version + 1);
    } catch (error: unknown) {
      alert("Failed to create a new bin.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenBin = (binId: BinRoute) => {
    navigate(`/bins/${binId}`);
  };

  const handleDeleteBin = async (binId: BinRoute): Promise<boolean> => {
    const storageKey = `${BINS_STORAGE_PREFIX}${binId}`;
    const token = localStorage.getItem(storageKey);
    if (!token) {
      alert("Missing bin token. Unable to delete.");
      return false;
    }

    try {
      await deleteBin(binId, token);
      localStorage.removeItem(storageKey);
      removeBin(binId);
      setBinsVersion((version) => version + 1);
      return true;
    } catch (error) {
      alert("Failed to delete bin.");
      console.error(error);
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const deleted = await handleDeleteBin(deleteTarget);
    if (deleted) {
      setDeleteTarget(null);
    }
  };

  const handleOpenCreatedBin = () => {
    if (!createdBin) return;
    const route = createdBin.route;
    setCreatedBin(null);
    handleOpenBin(route);
  };

  return (
    <BinPageLayout
      sidebar={
        <CreateBinPanel
          value={urlInput}
          onChange={setUrlInput}
          onSubmit={handleCreateBin}
          isCreating={isCreating}
        />
      }
    >
      <PageHeader
        title="Your Bins"
        subtitle="Manage your active webhook endpoints and inspect payloads."
      />
      <div className="bins-page__grid" key={`bins-${binsVersion}`}>
        {orderedBins.length === 0 ? (
          <div className="bins-page__empty">
            <p>No bins yet.</p>
            <p>Create your first bin using the form on the left.</p>
          </div>
        ) : (
          orderedBins.map((binId) => {
            return (
              <BinCard
                key={binId}
                route={binId}
                onOpen={() => handleOpenBin(binId)}
                onDelete={() => setDeleteTarget(binId)}
              />
            );
          })
        )}
      </div>
      <Modal
        open={createdBin !== null}
        title="Bin created"
        onClose={() => setCreatedBin(null)}
        footer={
          <>
            <button
              type="button"
              className="modal__button"
              onClick={() => setCreatedBin(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="modal__button modal__button--primary"
              onClick={handleOpenCreatedBin}
            >
              Open bin
            </button>
          </>
        }
      >
        <p className="modal__lead">Congratulations, you have created a bin.</p>
        {createdBin && (
          <div className="modal__details">
            <div className="modal__detail">
              <span className="modal__label">Bin Route</span>
              <code className="modal__code">{createdBin.route}</code>
            </div>
            <div className="modal__detail">
              <span className="modal__label">Auth Token</span>
              <code className="modal__code">{createdBin.token}</code>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={deleteTarget !== null}
        title="Delete bin?"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="modal__button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="modal__button modal__button--danger"
              onClick={handleConfirmDelete}
            >
              Delete bin
            </button>
          </>
        }
      >
        <p className="modal__lead">
          This will permanently delete the bin and all stored requests.
        </p>
        {deleteTarget && (
          <div className="modal__detail">
            <span className="modal__label">Bin Route</span>
            <code className="modal__code">{deleteTarget}</code>
          </div>
        )}
      </Modal>
    </BinPageLayout>
  );
};

export default BinsPage;
