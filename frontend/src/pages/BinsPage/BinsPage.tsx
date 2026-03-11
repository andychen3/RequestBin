import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBin } from "./services";
import { generateBinId } from "./utils";
import { BinPageLayout } from "./components/layout/BinPageLayout";
import { PageHeader } from "./components/layout/PageHeader";
import { CreateBinPanel } from "./components/bins/CreateBinPanel";
import { BinCard } from "./components/bins/BinCard";
import "./BinsPage.css";

const BINS_STORAGE_PREFIX = "basket_";
const BINS_ORDER_KEY = "basket_order";
const BinsPage = () => {
  const [urlInput, setUrlInput] = useState<string>(generateBinId());
  const [isCreating, setIsCreating] = useState(false);
  const [binsVersion, setBinsVersion] = useState(0);
  const [binOrder, setBinOrder] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(BINS_ORDER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBinOrder(parsed);
          return;
        }
      } catch {
        // Ignore malformed storage and rebuild below.
      }
    }

    const fallback = Object.keys(localStorage)
      .filter((key) => key.startsWith(BINS_STORAGE_PREFIX))
      .map((key) => key.replace(BINS_STORAGE_PREFIX, ""));
    setBinOrder(fallback);
  }, []);

  const persistOrder = (order: string[]) => {
    localStorage.setItem(BINS_ORDER_KEY, JSON.stringify(order));
  };

  const orderedBins = binOrder.filter((id) =>
    localStorage.getItem(`${BINS_STORAGE_PREFIX}${id}`),
  );

  const handleCreateBin = async () => {
    try {
      setIsCreating(true);
      const response = await createBin(urlInput);
      localStorage.setItem(`${BINS_STORAGE_PREFIX}${urlInput}`, response.token);
      setBinOrder((order) => {
        const next = [...order, urlInput];
        persistOrder(next);
        return next;
      });
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
    setBinOrder((order) => {
      const next = order.filter((id) => id !== binId);
      persistOrder(next);
      return next;
    });
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
