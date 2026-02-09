'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTenants } from '@/hooks/useTenants'
import { useCategories } from '@/hooks/useCategories'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TenantCreateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coordinates: { lat: number; lng: number } | null
}

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 },
  }),
}

export function TenantCreateSheet({
  open,
  onOpenChange,
  coordinates,
}: TenantCreateSheetProps) {
  const { createTenant } = useTenants()
  const { categories } = useCategories()
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    address: '',
    phone: '',
    url1: '',
    url2: '',
    url3: '',
    memo: '',
  })

  const resetForm = () => {
    setForm({
      name: '',
      category_id: '',
      address: '',
      phone: '',
      url1: '',
      url2: '',
      url3: '',
      memo: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coordinates) return
    setIsLoading(true)

    try {
      await createTenant({
        ...form,
        category_id: form.category_id || null,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      })
      toast.success('店舗を登録しました')
      resetForm()
      onOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : '登録に失敗しました'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>店舗を登録</SheetTitle>
          <SheetDescription>
            マップ上のクリック位置に店舗を登録します
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
              className="space-y-2"
            >
              <Label htmlFor="name">店舗名 *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                placeholder="店舗名を入力"
              />
            </motion.div>

            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
              className="space-y-2"
            >
              <Label>カテゴリ</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category_id: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
              className="space-y-2"
            >
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="住所を入力"
              />
            </motion.div>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
              className="space-y-2"
            >
              <Label htmlFor="phone">予約電話</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="電話番号を入力"
              />
            </motion.div>

            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
              className="space-y-2"
            >
              <Label htmlFor="url1">URL 1</Label>
              <Input
                id="url1"
                type="url"
                value={form.url1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url1: e.target.value }))
                }
                placeholder="https://..."
              />
            </motion.div>

            <motion.div
              custom={5}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
              className="space-y-2"
            >
              <Label htmlFor="url2">URL 2</Label>
              <Input
                id="url2"
                type="url"
                value={form.url2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url2: e.target.value }))
                }
                placeholder="https://..."
              />
            </motion.div>

            <motion.div
              custom={6}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
              className="space-y-2"
            >
              <Label htmlFor="url3">URL 3</Label>
              <Input
                id="url3"
                type="url"
                value={form.url3}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url3: e.target.value }))
                }
                placeholder="https://..."
              />
            </motion.div>

            <motion.div
              custom={7}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
              className="space-y-2"
            >
              <Label htmlFor="memo">備考</Label>
              <Textarea
                id="memo"
                value={form.memo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, memo: e.target.value }))
                }
                placeholder="備考を入力"
                rows={3}
              />
            </motion.div>

            {coordinates && (
              <motion.div
                custom={8}
                initial="hidden"
                animate="visible"
                variants={fieldVariants}
                className="grid grid-cols-2 gap-2"
              >
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">緯度</Label>
                  <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {coordinates.lat.toFixed(6)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">経度</Label>
                  <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </motion.div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登録中...' : '登録する'}
            </Button>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
