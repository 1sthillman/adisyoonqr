import { createClient } from '@supabase/supabase-js';

// Supabase istemcisini oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: number;
  urun_adi: string;
  fiyat: number;
  kategori: string;
  stok_durumu: boolean;
  resim_url?: string;
}

export interface OrderItem {
  siparis_id: number;
  urun_id: number;
  miktar: number;
  birim_fiyat: number;
  toplam_fiyat: number;
}

export interface Order {
  id?: number;
  masa_no: string;
  siparis_durumu: string;
  toplam_tutar: number;
  musteri_notu?: string;
  siparis_tipi: string;
  created_at?: string;
}

export interface CustomerOrder {
  id?: number;
  masa_no: string;
  siparis_id: number;
  siparis_zamani: string;
}

/**
 * Ürünleri kategorilerine göre getirir
 */
export async function getProducts() {
  const { data, error } = await supabase
    .from('urunler')
    .select('*')
    .order('kategori');

  if (error) {
    console.error('Ürünler yüklenirken hata:', error);
    throw error;
  }

  return data as Product[];
}

/**
 * Yeni bir sipariş oluşturur
 */
export async function createOrder(order: Order, orderItems: OrderItem[]) {
  // Sipariş başlığı oluştur
  const { data: orderHeader, error: headerError } = await supabase
    .from('siparisler')
    .insert([order])
    .select();

  if (headerError) {
    console.error('Sipariş oluşturulurken hata:', headerError);
    throw headerError;
  }

  if (!orderHeader || orderHeader.length === 0) {
    throw new Error('Sipariş oluşturulamadı');
  }

  const orderId = orderHeader[0].id;

  // Sipariş detaylarını oluştur
  const orderItemsWithId = orderItems.map(item => ({
    ...item,
    siparis_id: orderId
  }));

  const { error: detailsError } = await supabase
    .from('siparis_detaylari')
    .insert(orderItemsWithId);

  if (detailsError) {
    console.error('Sipariş detayları oluşturulurken hata:', detailsError);
    throw detailsError;
  }

  // Müşteri siparişi kaydı
  const { error: customerOrderError } = await supabase
    .from('customer_orders')
    .insert([
      {
        masa_no: order.masa_no,
        siparis_id: orderId,
        siparis_zamani: new Date().toISOString()
      }
    ]);

  if (customerOrderError) {
    console.error('Müşteri siparişi kaydedilirken hata:', customerOrderError);
    throw customerOrderError;
  }

  return orderId;
}

/**
 * Garson çağırma işlemi
 */
export async function callWaiter(tableId: string) {
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
    throw error;
  }
} 