interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorMessage = ({
  message = "An error occurred. Please try again.",
  onRetry,
}: ErrorMessageProps) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
      <p>{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-800"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
