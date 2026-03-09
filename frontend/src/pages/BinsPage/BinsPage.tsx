import { Link } from "react-router-dom";
import { useState } from "react";
import { createBin } from "./services";
import { generateBinId } from "./utils";

const BinsPage = () => {
  const [urlInput, setUrlInput] = useState(generateBinId());




  return (
    <>
      <div>
        <h1>Bins</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const authToken = crypto.randomUUID();
              const response = await createBin(urlInput, authToken);
              localStorage.setItem(`basket_${urlInput}`, authToken);
              console.log(response);
              setUrlInput(generateBinId());
            } catch (error) {
              alert("Failed to create a new bin.");
              console.error(error);
            }
          }}
        >
          
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button type="submit">Create New Bin</button>
        </form>

        <Link to="/bins/123">Go to Bin 123</Link>
      </div>
    </>
  );
};

export default BinsPage;
