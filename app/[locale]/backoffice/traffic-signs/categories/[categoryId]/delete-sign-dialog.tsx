"use client"

import { useState } from 'react'
import { useAdminTrafficSignStore } from '@/lib/store/admin-traffic-sign-store'
import { adminTrafficSignApi } from '@/lib/api/admin-traffic-signs'
import { AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface DeleteSignDialogProps {
  sign: any
  onClose: () => void
}

export function DeleteSignDialog({ sign, onClose }: DeleteSignDialogProps) {
  const { removeSign } = useAdminTrafficSignStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await adminTrafficSignApi.deleteSign(sign.id)
      removeSign(sign.id)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to delete traffic sign')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="font-dm max-w-sm bg-[#181920] border border-white/[0.09]
                                 shadow-[0_24px_64px_rgba(0,0,0,0.55)] rounded-2xl p-0">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
          .font-syne { font-family: 'Syne', sans-serif; }
          .font-dm   { font-family: 'DM Sans', sans-serif; }
        `}</style>

        {/* ── Header ── */}
        <DialogHeader className="flex flex-row items-center gap-3 px-6 pt-6 pb-5 border-b border-white/[0.07]">
          <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20
                          flex items-center justify-center shrink-0">
            <Trash2 size={15} className="text-red-400" />
          </div>
          <div>
            <DialogTitle className="font-syne font-bold text-base tracking-tight text-red-400">
              Delete Traffic Sign
            </DialogTitle>
            <p className="text-xs text-white/30 font-light mt-0.5">This action cannot be undone</p>
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-3">

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl
                            bg-red-400/[0.07] border border-red-400/20">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-400/90 font-light">{error}</p>
            </div>
          )}

          {/* Confirmation copy */}
          <p className="text-sm text-white/50 font-light leading-relaxed">
            Are you sure you want to delete this traffic sign? All associated assets will also be permanently removed.
          </p>

          {/* Sign description preview */}
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-1.5">
              Sign Description
            </p>
            <p className="text-sm text-white/60 font-light leading-relaxed line-clamp-3">
              {sign.description}
            </p>
          </div>

        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 pb-6 pt-2 flex gap-2.5 border-t border-white/[0.07]">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-white/55 border border-white/[0.09] bg-white/[0.03]
                       hover:text-white/85 hover:border-white/20
                       disabled:opacity-40 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                       inline-flex items-center justify-center gap-2
                       text-[#12131a] bg-red-400
                       hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-200
                       [box-shadow:0_0_20px_rgba(248,113,113,0.25)]"
          >
            {isDeleting
              ? <><Loader2 size={14} className="animate-spin" /> Deleting…</>
              : 'Delete Sign'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}