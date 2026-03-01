import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Type, Save, RotateCcw } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";

const fontOptions = [
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Georgia", value: "Georgia" },
  { label: "Merriweather", value: "Merriweather" },
  { label: "Lora", value: "Lora" },
  { label: "Times New Roman", value: "Times New Roman" },
];

const bodyFontOptions = [
  { label: "Inter", value: "Inter" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Roboto", value: "Roboto" },
  { label: "Lato", value: "Lato" },
  { label: "Source Sans Pro", value: "Source Sans Pro" },
];

const presetColors = [
  { label: "Navy Blue", value: "220 70% 25%" },
  { label: "Forest Green", value: "152 60% 30%" },
  { label: "Burgundy", value: "350 65% 30%" },
  { label: "Charcoal", value: "220 15% 20%" },
  { label: "Deep Purple", value: "270 50% 30%" },
  { label: "Teal", value: "180 60% 28%" },
];

const accentPresets = [
  { label: "Gold", value: "45 100% 51%" },
  { label: "Amber", value: "38 92% 50%" },
  { label: "Rose", value: "350 80% 60%" },
  { label: "Emerald", value: "152 76% 45%" },
  { label: "Sky", value: "200 80% 55%" },
  { label: "Copper", value: "25 70% 50%" },
];

const AdminCustomization = () => {
  const { settings, updateSetting } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async (key: string, value: string) => {
    setSaving(true);
    try {
      await updateSetting(key, value);
      toast({ title: "Setting Updated", description: `${key.replace(/_/g, ' ')} has been updated.` });
    } catch {
      toast({ title: "Error", description: "Failed to update setting.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await updateSetting('primary_color', '220 70% 25%');
      await updateSetting('accent_color', '45 100% 51%');
      await updateSetting('font_heading', 'Playfair Display');
      await updateSetting('font_body', 'Inter');
      toast({ title: "Settings Reset", description: "All customizations have been reset to defaults." });
    } catch {
      toast({ title: "Error", description: "Failed to reset settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Color Customization */}
      <Card className="banking-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Brand Colors
          </CardTitle>
          <CardDescription>Customize the primary and accent colors across the entire site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">Primary Color</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presetColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleSave('primary_color', c.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    settings.primary_color === c.value
                      ? 'border-primary shadow-elegant'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg shadow-sm"
                    style={{ background: `hsl(${c.value})` }}
                  />
                  <span className="text-sm font-medium">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Accent Color</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {accentPresets.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleSave('accent_color', c.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    settings.accent_color === c.value
                      ? 'border-primary shadow-elegant'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg shadow-sm"
                    style={{ background: `hsl(${c.value})` }}
                  />
                  <span className="text-sm font-medium">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-6 rounded-2xl border bg-card">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Live Preview</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl shadow-lg" style={{ background: `hsl(${settings.primary_color})` }} />
              <div className="w-16 h-16 rounded-xl shadow-lg" style={{ background: `hsl(${settings.accent_color})` }} />
              <div className="flex-1">
                <Button className="bg-gradient-primary text-primary-foreground shadow-elegant">
                  Sample Button
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="banking-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Typography
          </CardTitle>
          <CardDescription>Choose heading and body fonts for the site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Select
                value={settings.font_heading}
                onValueChange={(v) => handleSave('font_heading', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Select
                value={settings.font_body}
                onValueChange={(v) => handleSave('font_body', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bodyFontOptions.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-card">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Typography Preview</p>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: `'${settings.font_heading}', serif` }}>
              Western Trust Bank
            </h3>
            <p className="text-muted-foreground" style={{ fontFamily: `'${settings.font_body}', sans-serif` }}>
              Experience premium banking with security you can trust and service you deserve.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Brand Name */}
      <Card className="banking-border">
        <CardHeader>
          <CardTitle>Brand Name</CardTitle>
          <CardDescription>Update the displayed brand name across the site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={settings.brand_name}
              onChange={(e) => handleSave('brand_name', e.target.value)}
              placeholder="Western Trust Bank"
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleReset} disabled={saving}>
          <RotateCcw className="w-4 h-4 mr-2" /> Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default AdminCustomization;
