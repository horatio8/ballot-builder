"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

const AUSTRALIAN_STATES = [
  { value: "Federal", label: "Federal" },
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
]

interface Election {
  id: string
  name: string
  state: string
  date: string
  enrollmentDeadline: string | null
  description: string | null
  isActive: boolean
  _count: { electorates: number; parties: number; candidates: number }
}

interface FormData {
  name: string
  state: string
  date: string
  enrollmentDeadline: string
  description: string
  isActive: boolean
}

const emptyForm: FormData = {
  name: "",
  state: "",
  date: "",
  enrollmentDeadline: "",
  description: "",
  isActive: false,
}

export function ElectionsClient({ elections }: { elections: Election[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(election: Election) {
    setEditingId(election.id)
    setForm({
      name: election.name,
      state: election.state,
      date: election.date ? new Date(election.date).toISOString().split("T")[0] : "",
      enrollmentDeadline: election.enrollmentDeadline
        ? new Date(election.enrollmentDeadline).toISOString().split("T")[0]
        : "",
      description: election.description || "",
      isActive: election.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const body = {
        ...form,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        enrollmentDeadline: form.enrollmentDeadline
          ? new Date(form.enrollmentDeadline).toISOString()
          : null,
      }

      if (editingId) {
        await fetch(`/api/admin/elections/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        await fetch("/api/admin/elections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      }
      setDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to save election:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this election?")) return
    await fetch(`/api/admin/elections/${id}`, { method: "DELETE" })
    router.refresh()
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/elections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elections</h1>
          <p className="text-muted-foreground">Manage elections and their settings.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Election
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Electorates</TableHead>
                <TableHead>Parties</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No elections yet. Create your first election.
                  </TableCell>
                </TableRow>
              ) : (
                elections.map((election) => (
                  <TableRow key={election.id}>
                    <TableCell className="font-medium">{election.name}</TableCell>
                    <TableCell>{election.state}</TableCell>
                    <TableCell>{formatDate(election.date)}</TableCell>
                    <TableCell>{election._count.electorates}</TableCell>
                    <TableCell>{election._count.parties}</TableCell>
                    <TableCell>{election._count.candidates}</TableCell>
                    <TableCell>
                      <Badge
                        variant={election.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleActive(election.id, election.isActive)}
                      >
                        {election.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(election)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(election.id)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Election" : "Add Election"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. 2025 Federal Election"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / Level</Label>
              <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state or level" />
                </SelectTrigger>
                <SelectContent>
                  {AUSTRALIAN_STATES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Election Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollmentDeadline">Enrollment Deadline</Label>
                <Input
                  id="enrollmentDeadline"
                  type="date"
                  value={form.enrollmentDeadline}
                  onChange={(e) => setForm({ ...form, enrollmentDeadline: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
              <Label>Active Election</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
