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
import { useCategories } from '@/hooks/useCategories'

interface CategoryManageSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryManageSheet({
  open,
  onOpenChange,
}: CategoryManageSheetProps) {
  const { categories, createCategory, updateCategory, deleteCategory } =
    useCategories()
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setIsAdding(true)
    try {
      await createCategory(newName.trim())
      toast.success('カテゴリを追加しました')
      setNewName('')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : '追加に失敗しました'
      )
    } finally {
      setIsAdding(false)
    }
  }

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return
    try {
      await updateCategory(id, editName.trim())
      toast.success('カテゴリを更新しました')
      setEditingId(null)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : '更新に失敗しました'
      )
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id)
      toast.success('カテゴリを削除しました')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : '削除に失敗しました'
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>カテゴリ管理</SheetTitle>
          <SheetDescription>
            店舗のカテゴリを管理します
          </SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="新しいカテゴリ名"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={isAdding || !newName.trim()}>
              追加
            </Button>
          </form>
        </div>
        <Separator />
        <ScrollArea className="h-[calc(100vh-220px)] px-6">
          <div className="space-y-1 py-4">
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                カテゴリがありません
              </p>
            )}
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2 py-2 group"
              >
                {editingId === cat.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEdit(cat.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleEdit(cat.id)}
                    >
                      保存
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      onClick={() => setEditingId(null)}
                    >
                      取消
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{cat.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2"
                        onClick={() => {
                          setEditingId(cat.id)
                          setEditName(cat.name)
                        }}
                      >
                        編集
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2"
                          >
                            削除
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>カテゴリを削除</DialogTitle>
                            <DialogDescription>
                              「{cat.name}」を削除しますか？使用中の店舗がある場合は削除できません。
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => handleDelete(cat.id)}
                            >
                              削除する
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
