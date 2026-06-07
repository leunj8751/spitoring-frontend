import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotificationSettingsPage } from "@/pages/NotificationSettingsPage";
import { PurchaseHistoryPage } from "@/pages/PurchaseHistoryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "notifications", element: <NotificationSettingsPage /> },
      { path: "purchases", element: <PurchaseHistoryPage /> },
    ],
  },
]);
