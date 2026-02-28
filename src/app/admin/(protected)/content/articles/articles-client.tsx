"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Article {
  id: string; slug: string; title: string; content: string; category: string | null
  readTimeMinutes: number; thumbnail: string | null; isPublished: boolean
  createdAt: string; updatedAt: string
}

interface FormData {
  slug: string; title: string; content: string; category: string
  readTimeMinutes: number; thumbnail: string; isPublished: boolean
}

const emptyForm: FormData = {
  slug: "", title: "", content: "", category: "", readTimeMinutes: 3, thumbnail: "", isPublished: true,
}

export function ArticlesClient({ articles }: { articles: Article[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)

  function openCreate() { setEditingId(null); setForm(emptyForm); setDialogOpen(true) }
  function openEdit(a: Article) {
    setEditingId(a.id)
    setForm({ slug: a.slug, title: a.title, content: a.content, category: a.category || "", readTimeMinutes: a.readTimeMinutes, thumbnail: a.thumbnail || "", isPublished: a.isPublished })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const url = editingId ? `/api/admin/content/articles/${editingId}` : "/api/admin/content/articles"
      await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      setDialogOpen(false); router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return
    await fetch(`/api/admin/content/articles/${id}`, { method: "DELETE" }); router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Articles</h1><p className="text-muted-foreground">Manage articles and blog posts.</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Article</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Read Time</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No articles yet.</TableCell></TableRow>
            ) : articles.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell>{a.category}</TableCell>
                <TableCell>{a.readTimeMinutes} min</TableCell>
                <TableCell><Badge variant={a.isPublished ? "default" : "secondary"}>{a.isPublished ? "Published" : "Draft"}</Badge></TableCell>
                <TableCell>{formatDate(a.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? "Edit Article" : "Add Article"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Read Time (min)</Label><Input type="number" value={form.readTimeMinutes} onChange={(e) => setForm({ ...form, readTimeMinutes: parseInt(e.target.value) || 3 })} /></div>
              <div className="space-y-2"><Label>Thumbnail URL</Label><Input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Content (Markdown)</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.isPublished} onCheckedChange={(c) => setForm({ ...form, isPublished: c })} /><Label>Published</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
