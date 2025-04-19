"use client"

import { useAppContext } from "./app-context"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"

export default function ToastContainer() {
  const { toasts, removeToast } = useAppContext()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-white rounded-lg p-4 shadow-lg flex items-center gap-3 max-w-sm animate-slide-in ${
            toast.type === "success"
              ? "border-l-4 border-green-500"
              : toast.type === "error"
                ? "border-l-4 border-red-500"
                : "border-l-4 border-primary"
          }`}
        >
          <div className="text-xl">
            {toast.type === "success" ? (
              <CheckCircle className="text-green-500" />
            ) : toast.type === "error" ? (
              <AlertCircle className="text-red-500" />
            ) : (
              <Info className="text-primary" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold">{toast.title}</div>
            <div className="text-sm text-gray-600">{toast.message}</div>
          </div>
          <button className="text-gray-500 p-1" onClick={() => removeToast(toast.id)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

