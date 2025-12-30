import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  return (
    <Link to="/" className="rounded-full text-slate-500 outline-offset-4">
      <ArrowLeft />
      <span className="sr-only">Back</span>
    </Link>
  );
}
