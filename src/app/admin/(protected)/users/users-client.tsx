"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, KeyRound, Shield } from "lucide-react"

interface AdminUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  isAdmin: boolean
  hasPassword: boolean
  providers: string[]
}

interface FormData {
  name: string
  email: string
  password: string
}

const emptyForm: FormData = { name: "", email: "", password: "" }

export function UsersClient({ users }: { users: AdminUser[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Change password dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null)
  const [passwordUserEmail, setPasswordUserEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
    setDialogOpen(true)
  }

  function openEdit(u: AdminUser) {
    setEditingId(u.id)
    setForm({
      name: u.name || "",
      email: u.email || "",
      password: "",
    })
    setError("")
    setDialogOpen(true)
  }

  function openChangePassword(u: AdminUser) {
    setPasswordUserId(u.id)
    setPasswordUserEmail(u.email || "")
    setNewPassword("")
    setError("")
    setPasswordDialogOpen(true)
  }

  async function handleSubmit() {
    setLoading(true)
    setError("")
    try {
      const url = editingId ? `/api/admin/users/${editingId}` : "/api/admin/users"
      const payload: any = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "An error occurred")
        setLoading(false)
        return
      }

      setDialogOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/users/${passwordUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "An error occurred")
        setLoading(false)
        return
      }

      setPasswordDialogOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this admin user? This cannot be undone.")) return
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || "Failed to delete user")
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Users</h1>
          <p className="text-muted-foreground">Manage who can access the admin portal.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Admin User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Auth Methods</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No admin users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {u.hasPassword && (
                          <Badge variant="secondary" className="text-xs">
                            Password
                          </Badge>
                        )}
                        {u.providers.map((p) => (
                          <Badge key={p} variant="outline" className="text-xs capitalize">
                            {p}
                          </Badge>
                        ))}
                        {!u.hasPassword && u.providers.length === 0 && (
                          <span className="text-muted-foreground text-xs">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.isAdmin ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Shield className="mr-1 h-3 w-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Change password"
                          onClick={() => openChangePassword(u)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit user"
                          onClick={() => openEdit(u)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete user"
                          onClick={() => handleDelete(u.id)}
                        >
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

      {/* Create / Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Admin User" : "Add Admin User"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the user's details. Leave password blank to keep unchanged."
                : "Create a new admin user with email and password login."}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{editingId ? "New Password (leave blank to keep)" : "Password *"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingId ? "••••••••" : "Min 6 characters"}
                required={!editingId}
              />
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

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {passwordUserEmail}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? "Saving..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
