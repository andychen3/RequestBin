import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBin } from "./services";
import { generateBinId } from "./utils";
import { BinPageLayout } from "./components/layout/BinPageLayout";
import { PageHeader } from "./components/layout/PageHeader";
import { CreateBinPanel } from "./components/bins/CreateBinPanel";
import { BinCard } from "./components/bins/BinCard";
import "./BinsPage.css";

const BINS_STORAGE_PREFIX = "basket_";

const BinsPage = () => {
  const [urlInput, setUrlInput] = useState<string>(generateBinId());
  const [isCreating, setIsCreating] = useState(false);
  const [binsVersion, setBinsVersion] = useState(0);
  const navigate = useNavigate();

  const basketKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith(BINS_STORAGE_PREFIX),
  );

  const handleCreateBin = async () => {
    try {
      setIsCreating(true);
      const authToken = crypto.randomUUID();
      await createBin(urlInput, authToken);
      localStorage.setItem(`${BINS_STORAGE_PREFIX}${urlInput}`, authToken);
      setUrlInput(generateBinId());
      setBinsVersion((version) => version + 1);
    } catch (error: unknown) {
      alert("Failed to create a new bin.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenBin = (binId: string) => {
    navigate(`/bins/${binId}`);
  };

  const handleDeleteBin = (binId: string) => {
    const storageKey = `${BINS_STORAGE_PREFIX}${binId}`;
    localStorage.removeItem(storageKey);
    setBinsVersion((version) => version + 1);
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
        {basketKeys.length === 0 ? (
          <div className="bins-page__empty">
            <p>No bins yet.</p>
            <p>Create your first bin using the form on the left.</p>
          </div>
        ) : (
          basketKeys.map((key) => {
            const binId = key.replace(BINS_STORAGE_PREFIX, "");
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
