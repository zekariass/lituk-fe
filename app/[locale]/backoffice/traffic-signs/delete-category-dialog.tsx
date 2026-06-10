"use client"

import { useState } from 'react'
import { useAdminTrafficSignStore } from '@/lib/store/admin-traffic-sign-store'
import { adminTrafficSignCategoryApi } from '@/lib/api/admin-traffic-signs'
import { AlertTriangle, Loader2, X } from 'lucide-react'

interface DeleteCategoryDialogProps {
  category: any
  onClose: () => void
}

export function DeleteCategoryDialog({ category, onClose }: DeleteCategoryDialogProps) {
  const { removeCategory } = useAdminTrafficSignStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      await adminTrafficSignCategoryApi.deleteCategory(category.id)
      removeCategory(category.id)
      onClose()
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error?.message || 
                          err?.message || 
                          'Failed to delete category'
      setError(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Delete Category?</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            disabled={isDeleting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete <span className="font-semibold">"{category.name}"</span>?
          </p>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive font-medium mb-2">
              ⚠️ This will permanently delete:
            </p>
            <ul className="text-sm text-destructive space-y-1 ml-4 list-disc">
              <li>All {category.signCount || 0} traffic signs in this category</li>
              <li>All associated image and video files</li>
              <li>All translations and metadata</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground font-medium">
            This action cannot be undone.
          </p>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
