import { asRow, getSupabase } from '@/lib/supabase/server';
import type { MacroMetric, MacroCountryArgs } from './types';

interface RowDb {
  country: string;
  cpi: number;
  rate: number;
  growth: number;
  inflation: number;
  z_cpi: number;
  z_rate: number;
  z_growth: number;
  z_inflation: number;
}

export async function fetchMacroCountry({ countries = ['US', 'CN', 'EU', 'JP', 'GB', 'ID'] }: MacroCountryArgs) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('macro_metrics_by_country')
    .select('country, cpi, rate, growth, inflation, z_cpi, z_rate, z_growth, z_inflation')
    .in('country', countries);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return {
    data: data.map(d => {
      const row = asRow<RowDb>(d);
      return {
        country: row.country,
        cpi: row.cpi,
        rate: row.rate,
        growth: row.growth,
        inflation: row.inflation,
        zScores: {
          cpi: row.z_cpi,
          rate: row.z_rate,
          growth: row.z_growth,
          inflation: row.z_inflation,
        },
      };
    }),
    asOf: new Date().toISOString(),
    synthetic: false,
  };
}
