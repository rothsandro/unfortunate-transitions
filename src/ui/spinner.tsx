export interface SpinnerProps {
  label: string;
}

export function Spinner(props: SpinnerProps) {
  const { label } = props;

  return (
    <div
      role="status"
      className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center
        gap-3"
    >
      <svg className="h-6 w-6 animate-spin" viewBox="0 0 100 100">
        <circle
          fill="none"
          strokeWidth="10"
          className="stroke-current opacity-40"
          cx="50"
          cy="50"
          r="40"
        />
        <circle
          fill="none"
          strokeWidth="10"
          className="stroke-current"
          strokeDasharray="250"
          strokeDashoffset="210"
          cx="50"
          cy="50"
          r="40"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}
