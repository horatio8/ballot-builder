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
import { Plus, Pencil, Trash2, Quote } from "lucide-react"

interface Testimonial {
  id: string; quote: string; author: string; role: string | null
  sortOrder: number; isPublished: boolean; createdAt: string; updatedAt: string
}

interface FormData {
  quote: string; author: string; role: string; sortOrder: number; isPublished: boolean
}

const emptyForm: FormData = { quote: "", author: "", role: "", sortOrder: 0, isPublished: true }

export function TestimonialsClient({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, sortOrder: testimonials.length })
    setDialogOpen(true)
  }

  function openEdit(t: Testimonial) {
    setEditingId(t.id)
    setForm({ quote: t.quote, author: t.author, role: t.role || "", sortOrder: t.sortOrder, isPublished: t.isPublished })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const url = editingId ? `/api/admin/content/testimonials/${editingId}` : "/api/admin/content/testimonials"
      await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      setDialogOpen(false); router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return
    await fetch(`/api/admin/content/testimonials/${id}`, { method: "DELETE" }); router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Testimonials</h1><p className="text-muted-foreground">Manage user testimonials and quotes.</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Testimonial</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-12">Order</TableHead><TableHead>Quote</TableHead><TableHead>Author</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {testimonials.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No testimonials yet.</TableCell></TableRow>
            ) : testimonials.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.sortOrder}</TableCell>
                <TableCell className="max-w-xs">
                  <div className="flex items-start gap-2">
                    <Quote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{t.quote}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{t.author}</p>
                    {t.role && <p className="text-sm text-muted-foreground">{t.role}</p>}
                  </div>
                </TableCell>
                <TableCell><Badge variant={t.isPublished ? "default" : "secondary"}>{t.isPublished ? "Published" : "Draft"}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Quote</Label><Textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} rows={4} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Author Name</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              <div className="space-y-2"><Label>Role / Title</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. First-time voter" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.isPublished} onCheckedChange={(c) => setForm({ ...form, isPublished: c })} /><Label>Published</Label></div>
            </div>
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
