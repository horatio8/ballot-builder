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

interface Page {
  id: string; slug: string; title: string; content: string
  metaTitle: string | null; metaDescription: string | null; isPublished: boolean
  createdAt: string; updatedAt: string
}

interface FormData {
  slug: string; title: string; content: string
  metaTitle: string; metaDescription: string; isPublished: boolean
}

const emptyForm: FormData = { slug: "", title: "", content: "", metaTitle: "", metaDescription: "", isPublished: true }

export function ContentPagesClient({ pages }: { pages: Page[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)

  function openCreate() { setEditingId(null); setForm(emptyForm); setDialogOpen(true) }
  function openEdit(p: Page) {
    setEditingId(p.id)
    setForm({ slug: p.slug, title: p.title, content: p.content, metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "", isPublished: p.isPublished })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const url = editingId ? `/api/admin/content/pages/${editingId}` : "/api/admin/content/pages"
      await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      setDialogOpen(false); router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this page?")) return
    await fetch(`/api/admin/content/pages/${id}`, { method: "DELETE" }); router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Content Pages</h1><p className="text-muted-foreground">Manage static CMS pages.</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Page</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Title</TableHead><TableHead>Slug</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No pages yet.</TableCell></TableRow>
            ) : pages.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-muted-foreground">/{p.slug}</TableCell>
                <TableCell><Badge variant={p.isPublished ? "default" : "secondary"}>{p.isPublished ? "Published" : "Draft"}</Badge></TableCell>
                <TableCell>{formatDate(p.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? "Edit Page" : "Add Page"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="about-us" /></div>
            </div>
            <div className="space-y-2"><Label>Content (Markdown)</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Meta Title</Label><Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></div>
              <div className="space-y-2"><Label>Meta Description</Label><Input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} /></div>
            </div>
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
