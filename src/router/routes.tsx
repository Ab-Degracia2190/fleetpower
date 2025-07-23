import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PrimaryLoader from "@/components/partials/loaders/Primary";

const Conference = lazy(() => import("@/components/pages/main/Conference"));

const LoaderFallback = () => (
    <div className="flex justify-center items-center h-screen w-full">
        <PrimaryLoader overlay />
    </div>
);

const routes = createBrowserRouter([
    { path: "/", element: <Suspense fallback={<LoaderFallback />}><Conference /></Suspense> },
    { path: "*", element: <Navigate to="/not-found" replace /> },
]);

export default routes;
