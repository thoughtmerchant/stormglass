interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-lg bg-red-50 p-6 border border-red-200 text-red-700">
      <h3 className="text-lg font-medium mb-2">Error</h3>
      <p>{message}</p>
    </div>
  )
}
