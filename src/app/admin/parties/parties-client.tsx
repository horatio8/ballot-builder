"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface Election { id: string; name: string }
interface Party {
  id: string; name: string; abbreviation: string | null; color: string | null
  logo: string | null; website: string | null; electionId: string
  election: { name: string }; _count: { candidates: number }
}

interface FormData {
  name: string; abbreviation: string; color: string; logo: string
  website: string; electionId: string
}
const emptyForm: FormData = { name: "", abbreviation: "", color: "#000000", logo: "", website: "", electionId: "" }

export function PartiesClient({ elections, parties }: { elections: Election[]; parties: Party[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [filterElection, setFilterElection] = useState<string>("all")

  const filtered = filterElection === "all" ? parties : parties.filter((p) => p.electionId === filterElection)

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, electionId: filterElection !== "all" ? filterElection : "" })
    setDialogOpen(true)
  }

  function openEdit(p: Party) {
    setEditingId(p.id)
    setForm({
      name: p.name, abbreviation: p.abbreviation || "", color: p.color || "#000000",
      logo: p.logo || "", website: p.website || "", electionId: p.electionId,
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const url = editingId ? `/api/admin/parties/${editingId}` : "/api/admin/parties"
      await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      setDialogOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this party?")) return
    await fetch(`/api/admin/parties/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parties</h1>
          <p className="text-muted-foreground">Manage political parties for each election.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Party</Button>
      </div>

      <Select value={filterElection} onValueChange={setFilterElection}>
        <SelectTrigger className="w-64"><SelectValue placeholder="Filter by election" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Elections</SelectItem>
          {elections.map((el) => <SelectItem key={el.id} value={el.id}>{el.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Abbreviation</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Election</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No parties found.</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: p.color || "#ccc" }} />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.abbreviation}</TableCell>
                  <TableCell>
                    {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{new URL(p.website).hostname}</a>}
                  </TableCell>
                  <TableCell>{p.election.name}</TableCell>
                  <TableCell>{p._count.candidates}</TableCell>
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
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit Party" : "Add Party"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Election</Label>
              <Select value={form.electionId} onValueChange={(v) => setForm({ ...form, electionId: v })}>
                <SelectTrigger><SelectValue placeholder="Select election" /></SelectTrigger>
                <SelectContent>{elections.map((el) => <SelectItem key={el.id} value={el.id}>{el.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Abbreviation</Label>
              <Input value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-16 p-1" />
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : editingId ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
