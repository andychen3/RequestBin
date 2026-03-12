import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";
import BinViewPage from "../pages/BinViewPage/BinViewPage";
import BinsPage from "../pages/BinsPage/BinsPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    path: "/",
    children: [
      {
        element: <BinsPage />,
        index: true,
      },
      {
        element: <BinViewPage />,
        path: "/bins/:binRoute",
      },
    ],
  },
]);
