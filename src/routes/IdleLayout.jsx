import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useIdle from "../hooks/checkIdle";

export default function IdleLayout() {
  const isIdle = useIdle(30 * 60 * 1000);
  const navigate = useNavigate();

  useEffect(() => {
      if (isIdle) {
      navigate("/", { replace: true });
    }
  }, [isIdle, navigate]);

  return <Outlet />; 
}