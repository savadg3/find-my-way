import { useSelector } from 'react-redux';
import useNavigationManager from './useNavigationManager';

export default function NavigationManager() {
  const activeTool = useSelector((s) => s.navigation.activeTool);
  const activePath = useSelector((s) => s.navigation.activePath);

  useNavigationManager({ activeTool, activePath });

  return null;
}
