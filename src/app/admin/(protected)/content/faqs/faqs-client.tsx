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
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react"

interface FAQ {
  id: string; question: string; answer: string; sortOrder: number
  isPublished: boolean; createdAt: string; updatedAt: string
}

interface FormData {
  question: string; answer: string; sortOrder: number; isPublished: boolean
}

const emptyForm: FormData = { question: "", answer: "", sortOrder: 0, isPublished: true }

export function FAQsClient({ faqs }: { faqs: FAQ[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, sortOrder: faqs.length })
    setDialogOpen(true)
  }

  function openEdit(f: FAQ) {
    setEditingId(f.id)
    setForm({ question: f.question, answer: f.answer, sortOrder: f.sortOrder, isPublished: f.isPublished })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const url = editingId ? `/api/admin/content/faqs/${editingId}` : "/api/admin/content/faqs"
      await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      setDialogOpen(false); router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return
    await fetch(`/api/admin/content/faqs/${id}`, { method: "DELETE" }); router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">FAQs</h1><p className="text-muted-foreground">Manage frequently asked questions.</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add FAQ</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-12">Order</TableHead><TableHead>Question</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {faqs.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No FAQs yet.</TableCell></TableRow>
            ) : faqs.map((f) => (
              <TableRow key={f.id}>
                <TableCell><div className="flex items-center gap-1"><GripVertical className="h-4 w-4 text-muted-foreground" />{f.sortOrder}</div></TableCell>
                <TableCell className="font-medium max-w-md truncate">{f.question}</TableCell>
                <TableCell><Badge variant={f.isPublished ? "default" : "secondary"}>{f.isPublished ? "Published" : "Draft"}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? "Edit FAQ" : "Add FAQ"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Question</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
            <div className="space-y-2"><Label>Answer (Markdown)</Label><Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={6} /></div>
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
