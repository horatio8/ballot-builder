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
import { Plus, Pencil, Trash2, Upload } from "lucide-react"

interface Election { id: string; name: string; state: string }
interface Electorate {
  id: string; name: string; state: string; type: string; electionId: string
  election: { name: string }; _count: { candidates: number }
}

interface FormData { name: string; state: string; type: string; electionId: string }
const emptyForm: FormData = { name: "", state: "", type: "lower", electionId: "" }

export function ElectoratesClient({
  elections, electorates,
}: { elections: Election[]; electorates: Electorate[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [filterElection, setFilterElection] = useState<string>("all")

  const filtered = filterElection === "all"
    ? electorates
    : electorates.filter((e) => e.electionId === filterElection)

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, electionId: filterElection !== "all" ? filterElection : "" })
    setDialogOpen(true)
  }

  function openEdit(e: Electorate) {
    setEditingId(e.id)
    setForm({ name: e.name, state: e.state, type: e.type, electionId: e.electionId })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      if (editingId) {
        await fetch(`/api/admin/electorates/${editingId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        })
      } else {
        await fetch("/api/admin/electorates", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        })
      }
      setDialogOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this electorate?")) return
    await fetch(`/api/admin/electorates/${id}`, { method: "DELETE" })
    router.refresh()
  }

  async function handleCSVImport() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const lines = text.split("\n").slice(1).filter(Boolean)
      for (const line of lines) {
        const [name, state, type] = line.split(",").map((s) => s.trim())
        if (name && state) {
          await fetch("/api/admin/electorates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              state,
              type: type || "lower",
              electionId: filterElection !== "all" ? filterElection : elections[0]?.id,
            }),
          })
        }
      }
      router.refresh()
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Electorates</h1>
          <p className="text-muted-foreground">Manage electorates for each election.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCSVImport}>
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Electorate
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={filterElection} onValueChange={setFilterElection}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by election" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Elections</SelectItem>
            {elections.map((el) => (
              <SelectItem key={el.id} value={el.id}>{el.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Election</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No electorates found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.state}</TableCell>
                    <TableCell className="capitalize">{e.type}</TableCell>
                    <TableCell>{e.election.name}</TableCell>
                    <TableCell>{e._count.candidates}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Electorate" : "Add Electorate"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Election</Label>
              <Select value={form.electionId} onValueChange={(v) => setForm({ ...form, electionId: v })}>
                <SelectTrigger><SelectValue placeholder="Select election" /></SelectTrigger>
                <SelectContent>
                  {elections.map((el) => (
                    <SelectItem key={el.id} value={el.id}>{el.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sydney" />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. NSW" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lower">Lower House</SelectItem>
                  <SelectItem value="upper">Upper House</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
