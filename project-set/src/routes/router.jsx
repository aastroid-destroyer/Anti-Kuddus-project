import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import MakeComplaint from "../pages/make-complaint/MakeComplaint";
import AllComplaints from "../pages/all-complaints/AllComplaints";
import SeatPlanner from "../pages/seat-planner/SeatPlanner";
import SyllabusNegotiator from "../pages/syllabus-negotiator/SyllabusNegotiator";
import TiffinLedger from "../pages/tiffin-ledger/TiffinLedger";
import SosFlare from "../pages/sos-flare/SosFlare";
import CaptainDashboard from "../pages/sos-captain/CaptainDashboard";
import KuddusFactChecker from "../pages/kuddus-fact-checker/KuddusFactChecker";
import PrivateRoute from "./PrivateRoute";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout></RootLayout>,
    children: [
      {
        index: true,
        element: <Home></Home>,
      },
      {
        path: "make-complaint",
        element: (
          <PrivateRoute>
            <MakeComplaint></MakeComplaint>
          </PrivateRoute>
        ),
      },
      {
        path: "all-complaints",
        element: (
          <PrivateRoute>
            <AllComplaints></AllComplaints>
          </PrivateRoute>
        ),

      },
      {
        path: "seat-planner",
        element: <PrivateRoute><SeatPlanner></SeatPlanner></PrivateRoute>,
      },
      {
        path: "syllabus-negotiator",
        element: <PrivateRoute><SyllabusNegotiator></SyllabusNegotiator></PrivateRoute>,
      },
      {
        path: "tiffin-ledger",
        element: <PrivateRoute><TiffinLedger></TiffinLedger></PrivateRoute>,
      },
      {
        path: "sos",
        element: (
            <SosFlare></SosFlare>
        ),
      },
      {
        path: "captain",
        element: (
          <PrivateRoute>
            <CaptainDashboard></CaptainDashboard>
          </PrivateRoute>
        ),
      },
      {
        path: "kuddus-fact-checker",
        element: (
          <PrivateRoute>
            <KuddusFactChecker></KuddusFactChecker>
          </PrivateRoute>
        ),
      },
      {
        path: "/login",
        element: <Login></Login>,
      },
      {
        path: "/register",
        element: <Register></Register>,
      },
    ],
  },

]);
