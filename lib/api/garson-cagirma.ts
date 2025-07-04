import { createClient } from '@supabase/supabase-js';

// Supabase istemcisini oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface GarsonCagrisi {
  id?: number;
  masa_no: string;
  cagrilma_zamani: string;
  durum: 'bekliyor' | 'yolda' | 'tamamlandi';
  created_at?: string;
}

/**
 * Garson çağırma işlemi
 * @param tableId Masa numarası
 * @returns İşlem başarılı mı
 */
export async function callWaiter(tableId: string): Promise<boolean> {
  try {
    // Masa durumunu güncelle
    const { error: updateError } = await supabase
      .from('masalar')
      .update({ garson_cagrildi: true })
      .eq('masa_no', tableId);

    if (updateError) throw updateError;

    // Garson çağırma kaydı oluştur
    const { error: insertError } = await supabase
      .from('garson_cagrilari')
      .insert([
        { 
          masa_no: tableId, 
          cagrilma_zamani: new Date().toISOString(),
          durum: 'bekliyor' 
        }
      ]);

    if (insertError) throw insertError;

    return true;
  } catch (error) {
    console.error('Garson çağırma hatası:', error);
    return false;
  }
}

/**
 * Garson çağrılarını getir
 * @param status Çağrı durumu (opsiyonel)
 * @returns Garson çağrıları listesi
 */
export async function getWaiterCalls(status?: 'bekliyor' | 'yolda' | 'tamamlandi'): Promise<GarsonCagrisi[]> {
  try {
    let query = supabase
      .from('garson_cagrilari')
      .select('*')
      .order('cagrilma_zamani', { ascending: false });
    
    if (status) {
      query = query.eq('durum', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data as GarsonCagrisi[];
  } catch (error) {
    console.error('Garson çağrıları getirilirken hata:', error);
    return [];
  }
}

/**
 * Garson çağrı durumunu güncelle
 * @param callId Çağrı ID
 * @param status Yeni durum
 * @returns İşlem başarılı mı
 */
export async function updateWaiterCallStatus(
  callId: number, 
  status: 'bekliyor' | 'yolda' | 'tamamlandi'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('garson_cagrilari')
      .update({ durum: status })
      .eq('id', callId);
    
    if (error) throw error;
    
    // Eğer durum tamamlandı ise, masanın garson_cagrildi durumunu false yap
    if (status === 'tamamlandi') {
      // Önce çağrı kaydını al
      const { data, error: fetchError } = await supabase
        .from('garson_cagrilari')
        .select('masa_no')
        .eq('id', callId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Masa durumunu güncelle
      const { error: updateError } = await supabase
        .from('masalar')
        .update({ garson_cagrildi: false })
        .eq('masa_no', data.masa_no);
      
      if (updateError) throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error('Garson çağrı durumu güncellenirken hata:', error);
    return false;
  }
} 