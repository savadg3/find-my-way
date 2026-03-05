// NavigationManager.jsx
// Reads tool/path state from Redux and runs useNavigationManager.
// Renders nothing — all interaction is imperative via MapLibre events.

import { useSelector } from 'react-redux';
import useNavigationManager from './useNavigationManager';

export default function NavigationManager() {
  const activeTool = useSelector((s) => s.navigation.activeTool);
  const activePath = useSelector((s) => s.navigation.activePath);

  // Always call the hook; it no-ops when activeTool is null
  useNavigationManager({ activeTool, activePath });

  return null;
}
