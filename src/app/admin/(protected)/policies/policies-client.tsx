"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
interface Category { id: string; name: string; description: string | null; icon: string | null; sortOrder: number }
interface Question {
  id: string; questionText: string; description: string | null; sortOrder: number
  categoryId: string; electionId: string
  category: { name: string }; election: { name: string }
}
interface Option {
  id: string; optionText: string; description: string | null
  policyStatement: string | null; sortOrder: number; questionId: string
  question: { questionText: string }
}

export function PoliciesClient({ elections, categories, questions, options }: {
  elections: Election[]; categories: Category[]; questions: Question[]; options: Option[]
}) {
  const router = useRouter()

  // Category state
  const [catDialog, setCatDialog] = useState(false)
  const [catEditId, setCatEditId] = useState<string | null>(null)
  const [catForm, setCatForm] = useState({ name: "", description: "", icon: "", sortOrder: 0 })

  // Question state
  const [qDialog, setQDialog] = useState(false)
  const [qEditId, setQEditId] = useState<string | null>(null)
  const [qForm, setQForm] = useState({ questionText: "", description: "", sortOrder: 0, categoryId: "", electionId: "" })

  // Option state
  const [optDialog, setOptDialog] = useState(false)
  const [optEditId, setOptEditId] = useState<string | null>(null)
  const [optForm, setOptForm] = useState({ optionText: "", description: "", policyStatement: "", sortOrder: 0, questionId: "" })

  const [loading, setLoading] = useState(false)

  // Category CRUD
  async function saveCat() {
    setLoading(true)
    try {
      const url = catEditId ? `/api/admin/policies/categories/${catEditId}` : "/api/admin/policies/categories"
      await fetch(url, { method: catEditId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(catForm) })
      setCatDialog(false)
      router.refresh()
    } finally { setLoading(false) }
  }
  async function deleteCat(id: string) {
    if (!confirm("Delete this category and all its questions?")) return
    await fetch(`/api/admin/policies/categories/${id}`, { method: "DELETE" })
    router.refresh()
  }

  // Question CRUD
  async function saveQ() {
    setLoading(true)
    try {
      const url = qEditId ? `/api/admin/policies/questions/${qEditId}` : "/api/admin/policies/questions"
      await fetch(url, { method: qEditId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(qForm) })
      setQDialog(false)
      router.refresh()
    } finally { setLoading(false) }
  }
  async function deleteQ(id: string) {
    if (!confirm("Delete this question?")) return
    await fetch(`/api/admin/policies/questions/${id}`, { method: "DELETE" })
    router.refresh()
  }

  // Option CRUD
  async function saveOpt() {
    setLoading(true)
    try {
      const url = optEditId ? `/api/admin/policies/options/${optEditId}` : "/api/admin/policies/options"
      await fetch(url, { method: optEditId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(optForm) })
      setOptDialog(false)
      router.refresh()
    } finally { setLoading(false) }
  }
  async function deleteOpt(id: string) {
    if (!confirm("Delete this option?")) return
    await fetch(`/api/admin/policies/options/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Policies & Questions</h1>
        <p className="text-muted-foreground">Manage policy categories, questions, and answer options.</p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
          <TabsTrigger value="options">Options ({options.length})</TabsTrigger>
        </TabsList>

        {/* CATEGORIES TAB */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setCatEditId(null); setCatForm({ name: "", description: "", icon: "", sortOrder: categories.length }); setCatDialog(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Order</TableHead><TableHead>Name</TableHead><TableHead>Icon</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.sortOrder}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.icon}</TableCell>
                    <TableCell className="max-w-xs truncate">{c.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setCatEditId(c.id); setCatForm({ name: c.name, description: c.description || "", icon: c.icon || "", sortOrder: c.sortOrder }); setCatDialog(true) }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCat(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* QUESTIONS TAB */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setQEditId(null); setQForm({ questionText: "", description: "", sortOrder: 0, categoryId: "", electionId: "" }); setQDialog(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Order</TableHead><TableHead>Question</TableHead><TableHead>Category</TableHead><TableHead>Election</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>{q.sortOrder}</TableCell>
                    <TableCell className="max-w-md truncate font-medium">{q.questionText}</TableCell>
                    <TableCell>{q.category.name}</TableCell>
                    <TableCell>{q.election.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setQEditId(q.id); setQForm({ questionText: q.questionText, description: q.description || "", sortOrder: q.sortOrder, categoryId: q.categoryId, electionId: q.electionId }); setQDialog(true) }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteQ(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* OPTIONS TAB */}
        <TabsContent value="options" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setOptEditId(null); setOptForm({ optionText: "", description: "", policyStatement: "", sortOrder: 0, questionId: "" }); setOptDialog(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Add Option
            </Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Order</TableHead><TableHead>Option Text</TableHead><TableHead>Question</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {options.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.sortOrder}</TableCell>
                    <TableCell className="max-w-md truncate font-medium">{o.optionText}</TableCell>
                    <TableCell className="max-w-xs truncate">{o.question.questionText}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setOptEditId(o.id); setOptForm({ optionText: o.optionText, description: o.description || "", policyStatement: o.policyStatement || "", sortOrder: o.sortOrder, questionId: o.questionId }); setOptDialog(true) }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteOpt(o.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{catEditId ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Icon (emoji or icon name)</Label><Input value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} /></div>
            <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: parseInt(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button>
            <Button onClick={saveCat} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={qDialog} onOpenChange={setQDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{qEditId ? "Edit Question" : "Add Question"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Election</Label>
              <Select value={qForm.electionId} onValueChange={(v) => setQForm({ ...qForm, electionId: v })}>
                <SelectTrigger><SelectValue placeholder="Select election" /></SelectTrigger>
                <SelectContent>{elections.map((el) => <SelectItem key={el.id} value={el.id}>{el.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={qForm.categoryId} onValueChange={(v) => setQForm({ ...qForm, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Question Text</Label><Textarea value={qForm.questionText} onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={qForm.description} onChange={(e) => setQForm({ ...qForm, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={qForm.sortOrder} onChange={(e) => setQForm({ ...qForm, sortOrder: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQDialog(false)}>Cancel</Button>
            <Button onClick={saveQ} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Option Dialog */}
      <Dialog open={optDialog} onOpenChange={setOptDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{optEditId ? "Edit Option" : "Add Option"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Select value={optForm.questionId} onValueChange={(v) => setOptForm({ ...optForm, questionId: v })}>
                <SelectTrigger><SelectValue placeholder="Select question" /></SelectTrigger>
                <SelectContent>{questions.map((q) => <SelectItem key={q.id} value={q.id}>{q.questionText.substring(0, 80)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Option Text</Label><Textarea value={optForm.optionText} onChange={(e) => setOptForm({ ...optForm, optionText: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={optForm.description} onChange={(e) => setOptForm({ ...optForm, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Policy Statement</Label><Textarea value={optForm.policyStatement} onChange={(e) => setOptForm({ ...optForm, policyStatement: e.target.value })} /></div>
            <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={optForm.sortOrder} onChange={(e) => setOptForm({ ...optForm, sortOrder: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOptDialog(false)}>Cancel</Button>
            <Button onClick={saveOpt} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
