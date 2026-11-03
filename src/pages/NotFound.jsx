import { MapPinOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Empty } from '../components/ui/StatusView';

export default function NotFound() {
  return (
    <Empty icon={MapPinOff} title="Nothing at this address" className="min-h-[70vh]" action={<Button to="/">Back to the shop</Button>}>
      The page may have moved, or the link has a typo.
    </Empty>
  );
}
