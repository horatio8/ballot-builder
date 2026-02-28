"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Save } from "lucide-react"

interface SocialLinks {
  facebook?: string; twitter?: string; instagram?: string; youtube?: string
}

interface Settings {
  id: string; siteName: string; tagline: string | null; logo: string | null
  primaryColor: string; secondaryColor: string; accentColor: string
  matchGreenColor: string; matchOrangeColor: string; matchRedColor: string; matchGreyColor: string
  greenThreshold: number; orangeThreshold: number
  fontHeading: string; fontBody: string
  footerText: string | null; socialLinks: SocialLinks | null; analyticsId: string | null
}

export function BrandingClient({ settings }: { settings: Settings }) {
  const router = useRouter()
  const [form, setForm] = useState({
    siteName: settings.siteName,
    tagline: settings.tagline || "",
    logo: settings.logo || "",
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    matchGreenColor: settings.matchGreenColor,
    matchOrangeColor: settings.matchOrangeColor,
    matchRedColor: settings.matchRedColor,
    matchGreyColor: settings.matchGreyColor,
    greenThreshold: settings.greenThreshold,
    orangeThreshold: settings.orangeThreshold,
    fontHeading: settings.fontHeading,
    fontBody: settings.fontBody,
    footerText: settings.footerText || "",
    socialFacebook: (settings.socialLinks as SocialLinks)?.facebook || "",
    socialTwitter: (settings.socialLinks as SocialLinks)?.twitter || "",
    socialInstagram: (settings.socialLinks as SocialLinks)?.instagram || "",
    socialYoutube: (settings.socialLinks as SocialLinks)?.youtube || "",
    analyticsId: settings.analyticsId || "",
  })
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setLoading(true)
    try {
      const body = {
        siteName: form.siteName,
        tagline: form.tagline || null,
        logo: form.logo || null,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        matchGreenColor: form.matchGreenColor,
        matchOrangeColor: form.matchOrangeColor,
        matchRedColor: form.matchRedColor,
        matchGreyColor: form.matchGreyColor,
        greenThreshold: form.greenThreshold,
        orangeThreshold: form.orangeThreshold,
        fontHeading: form.fontHeading,
        fontBody: form.fontBody,
        footerText: form.footerText || null,
        socialLinks: {
          facebook: form.socialFacebook || undefined,
          twitter: form.socialTwitter || undefined,
          instagram: form.socialInstagram || undefined,
          youtube: form.socialYoutube || undefined,
        },
        analyticsId: form.analyticsId || null,
      }
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      router.refresh()
    } finally { setLoading(false) }
  }

  function ColorField({ label, field }: { label: string; field: string }) {
    const value = form[field as keyof typeof form] as string
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => update(field, e.target.value)}
            className="h-10 w-12 cursor-pointer rounded border"
          />
          <Input
            value={value}
            onChange={(e) => update(field, e.target.value)}
            className="font-mono"
            placeholder="#000000"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Branding & Settings</h1><p className="text-muted-foreground">Customize site identity, colors, fonts, and more.</p></div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />{loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Site Identity */}
      <Card>
        <CardHeader><CardTitle>Site Identity</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Site Name</Label><Input value={form.siteName} onChange={(e) => update("siteName", e.target.value)} /></div>
            <div className="space-y-2"><Label>Logo URL</Label><Input value={form.logo} onChange={(e) => update("logo", e.target.value)} placeholder="https://..." /></div>
          </div>
          <div className="space-y-2"><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card>
        <CardHeader><CardTitle>Brand Colors</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <ColorField label="Primary Color" field="primaryColor" />
            <ColorField label="Secondary Color" field="secondaryColor" />
            <ColorField label="Accent Color" field="accentColor" />
          </div>
          <Separator />
          <h4 className="font-medium">Match Score Colors</h4>
          <div className="grid grid-cols-4 gap-4">
            <ColorField label="Green (High Match)" field="matchGreenColor" />
            <ColorField label="Orange (Medium)" field="matchOrangeColor" />
            <ColorField label="Red (Low Match)" field="matchRedColor" />
            <ColorField label="Grey (No Data)" field="matchGreyColor" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Green Threshold (%)</Label>
              <Input type="number" value={form.greenThreshold} onChange={(e) => update("greenThreshold", parseInt(e.target.value) || 70)} min={0} max={100} />
              <p className="text-xs text-muted-foreground">Scores above this % show as green</p>
            </div>
            <div className="space-y-2">
              <Label>Orange Threshold (%)</Label>
              <Input type="number" value={form.orangeThreshold} onChange={(e) => update("orangeThreshold", parseInt(e.target.value) || 40)} min={0} max={100} />
              <p className="text-xs text-muted-foreground">Scores above this % show as orange (below = red)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader><CardTitle>Typography</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Input value={form.fontHeading} onChange={(e) => update("fontHeading", e.target.value)} />
              <p className="text-xs text-muted-foreground">Google Fonts name, e.g. Libre Baskerville</p>
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Input value={form.fontBody} onChange={(e) => update("fontBody", e.target.value)} />
              <p className="text-xs text-muted-foreground">Google Fonts name, e.g. Libre Franklin</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer & Social */}
      <Card>
        <CardHeader><CardTitle>Footer & Social Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Footer Text (Markdown)</Label><Textarea value={form.footerText} onChange={(e) => update("footerText", e.target.value)} rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Facebook URL</Label><Input value={form.socialFacebook} onChange={(e) => update("socialFacebook", e.target.value)} placeholder="https://facebook.com/..." /></div>
            <div className="space-y-2"><Label>Twitter / X URL</Label><Input value={form.socialTwitter} onChange={(e) => update("socialTwitter", e.target.value)} placeholder="https://x.com/..." /></div>
            <div className="space-y-2"><Label>Instagram URL</Label><Input value={form.socialInstagram} onChange={(e) => update("socialInstagram", e.target.value)} placeholder="https://instagram.com/..." /></div>
            <div className="space-y-2"><Label>YouTube URL</Label><Input value={form.socialYoutube} onChange={(e) => update("socialYoutube", e.target.value)} placeholder="https://youtube.com/..." /></div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader><CardTitle>Analytics</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Google Analytics ID</Label>
            <Input value={form.analyticsId} onChange={(e) => update("analyticsId", e.target.value)} placeholder="G-XXXXXXXXXX" />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />{loading ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  )
}
