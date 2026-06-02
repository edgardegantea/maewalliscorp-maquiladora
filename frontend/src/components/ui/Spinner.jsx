export default function Spinner({ size = 6 }) {
  return <div className={`w-${size} h-${size} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
}
