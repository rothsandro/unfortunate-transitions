import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  return (
    <Link
      to="/"
      className="self-start rounded text-slate-500 outline-offset-4 transition-colors
        hover:text-slate-400"
    >
      <ArrowLeft />
      <span className="sr-only">Back</span>
    </Link>
  );
}
