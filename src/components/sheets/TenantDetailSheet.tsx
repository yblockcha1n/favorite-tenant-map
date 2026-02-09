'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTenants } from '@/hooks/useTenants'
import { useAuth } from '@/hooks/useAuth'

interface TenantDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string | null
  onEdit: (tenantId: string) => void
}

export function TenantDetailSheet({
  open,
  onOpenChange,
  tenantId,
  onEdit,
}: TenantDetailSheetProps) {
  const { tenants, deleteTenant } = useTenants()
  const { user, isAdmin } = useAuth()

  const tenant = useMemo(
    () => tenants.find((t) => t.id === tenantId),
    [tenants, tenantId]
  )

  const canModify = isAdmin || (user && tenant?.created_by === user.id)

  const handleDelete = async () => {
    if (!tenantId) return
    try {
      await deleteTenant(tenantId)
      toast.success('店舗を削除しました')
      onOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : '削除に失敗しました'
      )
    }
  }

  if (!tenant) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>{tenant.name}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] px-6 pb-6">
          <div className="space-y-4 pt-2">
            {tenant.categories?.name && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Badge variant="secondary">{tenant.categories.name}</Badge>
              </motion.div>
            )}

            {tenant.address && (
              <DetailRow label="住所" value={tenant.address} />
            )}

            {tenant.phone && (
              <DetailRow label="予約電話" value={tenant.phone} isPhone />
            )}

            {tenant.url1 && (
              <DetailRow label="URL 1" value={tenant.url1} isLink />
            )}
            {tenant.url2 && (
              <DetailRow label="URL 2" value={tenant.url2} isLink />
            )}
            {tenant.url3 && (
              <DetailRow label="URL 3" value={tenant.url3} isLink />
            )}

            {tenant.memo && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  備考
                </p>
                <p className="text-sm whitespace-pre-wrap">{tenant.memo}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">緯度</p>
                <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {tenant.latitude.toFixed(6)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">経度</p>
                <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {tenant.longitude.toFixed(6)}
                </p>
              </div>
            </div>

            <Separator />

            <p className="text-xs text-muted-foreground">
              登録日: {new Date(tenant.created_at).toLocaleDateString('ja-JP')}
            </p>

            {canModify && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onEdit(tenant.id)}
                >
                  編集
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      削除
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>店舗を削除しますか？</DialogTitle>
                      <DialogDescription>
                        「{tenant.name}」を削除します。この操作は取り消せません。
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleDelete}>
                        削除する
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({
  label,
  value,
  isLink,
  isPhone,
}: {
  label: string
  value: string
  isLink?: boolean
  isPhone?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors break-all"
        >
          {value}
        </a>
      ) : isPhone ? (
        <a
          href={`tel:${value}`}
          className="text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  )
}
