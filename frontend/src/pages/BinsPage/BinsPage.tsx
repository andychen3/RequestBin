import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBin, deleteBin } from "./services";
import type { Bin } from "../../types/request-bin";
import { generateBinId } from "./utils";
import { BinPageLayout } from "./components/layout/BinPageLayout";
import { PageHeader } from "./components/layout/PageHeader";
import { CreateBinPanel } from "./components/bins/CreateBinPanel";
import { BinCard } from "./components/bins/BinCard";
import { BINS_STORAGE_PREFIX, useBinOrder } from "./hooks/useBinOrder";
import "./BinsPage.css";

type BinRoute = Bin["bin_route"];

const BinsPage = () => {
  const [urlInput, setUrlInput] = useState<BinRoute>(generateBinId());
  const [isCreating, setIsCreating] = useState(false);
  const [binsVersion, setBinsVersion] = useState(0);
  const navigate = useNavigate();
  const { orderedBins, addBin, removeBin } = useBinOrder();

  const handleCreateBin = async (): Promise<void> => {
    try {
      setIsCreating(true);
      const response = await createBin(urlInput);
      localStorage.setItem(`${BINS_STORAGE_PREFIX}${urlInput}`, response.token);
      addBin(urlInput);
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

  const handleDeleteBin = async (binId: BinRoute): Promise<void> => {
    const storageKey = `${BINS_STORAGE_PREFIX}${binId}`;
    const token = localStorage.getItem(storageKey);
    if (!token) {
      alert("Missing bin token. Unable to delete.");
      return;
    }

    try {
      await deleteBin(binId, token);
      localStorage.removeItem(storageKey);
      removeBin(binId);
      setBinsVersion((version) => version + 1);
    } catch (error) {
      alert("Failed to delete bin.");
      console.error(error);
    }
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
                onDelete={() => handleDeleteBin(binId)}
              />
            );
          })
        )}
      </div>
    </BinPageLayout>
  );
};

export default BinsPage;
