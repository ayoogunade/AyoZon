import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { IconButton } from './ui/Button';

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return <IconButton label={dark ? 'Switch to light mode' : 'Switch to dark mode'} icon={dark ? Sun : Moon} onClick={toggle} />;
}
