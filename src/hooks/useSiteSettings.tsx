import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  primary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  brand_name: string;
}

const defaults: SiteSettings = {
  primary_color: '220 70% 25%',
  accent_color: '45 100% 51%',
  font_heading: 'Playfair Display',
  font_body: 'Inter',
  brand_name: 'Western Trust Bank',
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('setting_key, setting_value');
      if (error) throw error;

      const mapped: any = { ...defaults };
      (data as any[])?.forEach((row: any) => {
        if (row.setting_key in mapped) {
          mapped[row.setting_key] = row.setting_value;
        }
      });
      setSettings(mapped);
      applySettings(mapped);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySettings = (s: SiteSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', s.primary_color);
    root.style.setProperty('--ring', s.primary_color);
    root.style.setProperty('--accent', s.accent_color);
    root.style.setProperty('--font-heading', `'${s.font_heading}', Georgia, serif`);
    root.style.setProperty('--font-body', `'${s.font_body}', system-ui, sans-serif`);
    // Update gradient
    const [h, s1, l] = s.primary_color.split(' ');
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${s.primary_color}), hsl(${h} ${parseInt(s1) + 10}% ${Math.max(parseInt(l) - 10, 5)}%))`);
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_settings' as any)
        .update({ setting_value: value, updated_at: new Date().toISOString() } as any)
        .eq('setting_key', key);
      if (error) throw error;
      
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      applySettings(newSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, updateSetting, refetch: fetchSettings };
};
