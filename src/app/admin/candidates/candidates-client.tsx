"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
interface Electorate { id: string; name: string; electionId: string; election: { name: string } }
interface Party { id: string; name: string; electionId: string; color: string | null; election: { name: string } }
interface Candidate {
  id: string; name: string; photo: string | null; website: string | null
  votingRecordUrl: string | null; isIncumbent: boolean
  partyId: string | null; electorateId: string; electionId: string
  party: { name: string; color: string | null } | null
  electorate: { name: string }; election: { name: string }
}

interface FormData {
  name: string; photo: string; website: string; votingRecordUrl: string
  isIncumbent: boolean; partyId: string; electorateId: string; electionId: string
}

const emptyForm: FormData = {
  name: "", photo: "", website: "", votingRecordUrl: "",
  isIncumbent: false, partyId: "", electorateId: "", electionId: "",
}

export function CandidatesClient({
  elections, electorates, parties, candidates,
}: {
  elections: Election[]; electorates: Electorate[]; parties: Party[]; candidates: Candidate[]
}) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [filterElection, setFilterElection] = useState<string>("all")
  const [filterElectorate, setFilterElectorate] = useState<string>("all")
  const [filterParty, setFilterParty] = useState<string>("all")

  let filtered = candidates
  if (filterElection !== "all") filtered = filtered.filter((c) => c.electionId === filterElection)
  if (filterElectorate !== "all") filtered = filtered.filter((c) => c.electorateId === filterElectorate)
  if (filterParty !== "all") filtered = filtered.filter((c) => c.partyId === filterParty)

  const filteredElectorates = form.electionId
    ? electorates.filter((e) => e.electionId === form.electionId) : electorates
  const filteredParties = form.electionId
    ? parties.filter((p) => p.electionId === form.electionId) : parties

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, electionId: filterElection !== "all" ? filterElection : "" })
    setDialogOpen(true)
  }

  function openEdit(c: Candidate) {
    setEditingId(c.id)
    setForm({
      name: c.name, photo: c.photo || "", website: c.website || "",
      votingRecordUrl: c.votingRecordUrl || "", isIncumbent: c.isIncumbent,
      partyId: c.partyId || "", electorateId: c.electorateId, electionId: c.electionId,
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const body = { ...form, partyId: form.partyId || null }
      const url = editingId ? `/api/admin/candidates/${editingId}` : "/api/admin/candidates"
      await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      setDialogOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this candidate?")) return
    await fetch(`/api/admin/candidates/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">Manage candidates across elections.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Candidate</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={filterElection} onValueChange={(v) => { setFilterElection(v); setFilterElectorate("all"); setFilterParty("all") }}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Election" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Elections</SelectItem>
            {elections.map((el) => <SelectItem key={el.id} value={el.id}>{el.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterElectorate} onValueChange={setFilterElectorate}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Electorate" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Electorates</SelectItem>
            {(filterElection !== "all" ? electorates.filter(e => e.electionId === filterElection) : electorates).map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterParty} onValueChange={setFilterParty}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Party" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Parties</SelectItem>
            {(filterElection !== "all" ? parties.filter(p => p.electionId === filterElection) : parties).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
                <TableHead>Party</TableHead>
                <TableHead>Electorate</TableHead>
                <TableHead>Election</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No candidates found.</TableCell></TableRow>
              ) : filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    {c.party && (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.party.color || "#ccc" }} />
                        {c.party.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{c.electorate.name}</TableCell>
                  <TableCell>{c.election.name}</TableCell>
                  <TableCell>{c.isIncumbent && <Badge variant="secondary">Incumbent</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit Candidate" : "Add Candidate"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Election</Label>
              <Select value={form.electionId} onValueChange={(v) => setForm({ ...form, electionId: v, electorateId: "", partyId: "" })}>
                <SelectTrigger><SelectValue placeholder="Select election" /></SelectTrigger>
                <SelectContent>{elections.map((el) => <SelectItem key={el.id} value={el.id}>{el.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Electorate</Label>
              <Select value={form.electorateId} onValueChange={(v) => setForm({ ...form, electorateId: v })}>
                <SelectTrigger><SelectValue placeholder="Select electorate" /></SelectTrigger>
                <SelectContent>{filteredElectorates.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Party (optional)</Label>
              <Select value={form.partyId || "none"} onValueChange={(v) => setForm({ ...form, partyId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Independent / None</SelectItem>
                  {filteredParties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Voting Record URL</Label>
              <Input value={form.votingRecordUrl} onChange={(e) => setForm({ ...form, votingRecordUrl: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isIncumbent} onCheckedChange={(checked) => setForm({ ...form, isIncumbent: checked })} />
              <Label>Incumbent</Label>
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
