"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"

interface NavItem {
  id: string; label: string; url: string; location: string; sortOrder: number
  parentId: string | null; parent: { label: string } | null
  children: { id: string; label: string }[]
  createdAt: string; updatedAt: string
}

interface FormData {
  label: string; url: string; location: string; sortOrder: number; parentId: string
}

const emptyForm: FormData = { label: "", url: "", location: "header", sortOrder: 0, parentId: "" }

export function NavigationClient({ navItems }: { navItems: NavItem[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [filterLocation, setFilterLocation] = useState<string>("all")

  const filtered = filterLocation === "all" ? navItems : navItems.filter((n) => n.location === filterLocation)
  const topLevelItems = navItems.filter((n) => !n.parentId)

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, sortOrder: navItems.length })
    setDialogOpen(true)
  }

  function openEdit(n: NavItem) {
    setEditingId(n.id)
    setForm({ label: n.label, url: n.url, location: n.location, sortOrder: n.sortOrder, parentId: n.parentId || "" })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const url = editingId ? `/api/admin/content/navigation/${editingId}` : "/api/admin/content/navigation"
      const body = { ...form, parentId: form.parentId || null }
      await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      setDialogOpen(false); router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this navigation item?")) return
    await fetch(`/api/admin/content/navigation/${id}`, { method: "DELETE" }); router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Navigation Items</h1><p className="text-muted-foreground">Manage header and footer navigation links.</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Nav Item</Button>
      </div>

      <div className="flex gap-4">
        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="header">Header</SelectItem>
            <SelectItem value="footer">Footer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-12">Order</TableHead><TableHead>Label</TableHead><TableHead>URL</TableHead><TableHead>Location</TableHead><TableHead>Parent</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No navigation items yet.</TableCell></TableRow>
            ) : filtered.map((n) => (
              <TableRow key={n.id}>
                <TableCell>{n.sortOrder}</TableCell>
                <TableCell className="font-medium">{n.label}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {n.url}
                    {n.url.startsWith("http") && <ExternalLink className="h-3 w-3" />}
                  </div>
                </TableCell>
                <TableCell><Badge variant={n.location === "header" ? "default" : "secondary"}>{n.location}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{n.parent?.label || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(n)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit Nav Item" : "Add Nav Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
              <div className="space-y-2"><Label>URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/about or https://..." /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2">
                <Label>Parent Item</Label>
                <Select value={form.parentId || "none"} onValueChange={(v) => setForm({ ...form, parentId: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top-level)</SelectItem>
                    {topLevelItems.filter((i) => i.id !== editingId).map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
