"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { toast } from "sonner";

// Supabase istemcisini oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ürün tipini tanımla
interface Product {
  id: number;
  urun_adi: string;
  fiyat: number;
  kategori: string;
  stok_durumu: boolean;
  resim_url?: string;
}

// Sepet öğesi tipini tanımla
interface CartItem extends Product {
  quantity: number;
}

export default function CustomerPage({ params }: { params: { tableId: string } }) {
  const tableId = params.tableId;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [callWaiter, setCallWaiter] = useState<boolean>(false);

  // Ürünleri ve kategorileri yükle
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("urunler")
          .select("*")
          .order("kategori");

        if (error) throw error;

        if (data) {
          setProducts(data as Product[]);
          
          // Kategorileri ayıkla
          const uniqueCategories = Array.from(
            new Set(data.map((item: Product) => item.kategori))
          );
          setCategories(["Tümü", ...uniqueCategories]);
        }
      } catch (error) {
        console.error("Ürünler yüklenirken hata:", error);
        toast.error("Ürünler yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Garson çağırma fonksiyonu
  const handleCallWaiter = async () => {
    try {
      setLoading(true);
      
      // Masa durumunu güncelle
      const { error: updateError } = await supabase
        .from("masalar")
        .update({ garson_cagrildi: true })
        .eq("masa_no", tableId);

      if (updateError) throw updateError;

      // Garson çağırma kaydı oluştur
      const { error: insertError } = await supabase
        .from("garson_cagrilari")
        .insert([
          { 
            masa_no: tableId, 
            cagrilma_zamani: new Date().toISOString(),
            durum: "bekliyor" 
          }
        ]);

      if (insertError) throw insertError;

      setCallWaiter(true);
      toast.success("Garson çağrıldı");
      
      // 30 saniye sonra durumu sıfırla
      setTimeout(() => {
        setCallWaiter(false);
      }, 30000);
      
    } catch (error) {
      console.error("Garson çağırma hatası:", error);
      toast.error("Garson çağrılamadı");
    } finally {
      setLoading(false);
    }
  };

  // Sepete ürün ekleme
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    toast.success(`${product.urun_adi} sepete eklendi`);
  };

  // Sepetten ürün çıkarma
  const removeFromCart = (productId: number) => {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  // Siparişi gönderme
  const submitOrder = async () => {
    if (cart.length === 0) {
      toast.error("Sepetiniz boş");
      return;
    }

    try {
      setLoading(true);
      
      // Sipariş başlığı oluştur
      const { data: orderHeader, error: headerError } = await supabase
        .from("siparisler")
        .insert([
          {
            masa_no: tableId,
            siparis_durumu: "beklemede",
            toplam_tutar: calculateTotal(),
            musteri_notu: note,
            siparis_tipi: "müşteri-qr"
          }
        ])
        .select();

      if (headerError) throw headerError;
      
      if (!orderHeader || orderHeader.length === 0) {
        throw new Error("Sipariş oluşturulamadı");
      }

      const orderId = orderHeader[0].id;
      
      // Sipariş detaylarını oluştur
      const orderItems = cart.map(item => ({
        siparis_id: orderId,
        urun_id: item.id,
        miktar: item.quantity,
        birim_fiyat: item.fiyat,
        toplam_fiyat: item.fiyat * item.quantity
      }));
      
      const { error: detailsError } = await supabase
        .from("siparis_detaylari")
        .insert(orderItems);

      if (detailsError) throw detailsError;
      
      // Müşteri siparişi kaydı
      const { error: customerOrderError } = await supabase
        .from("customer_orders")
        .insert([
          {
            masa_no: tableId,
            siparis_id: orderId,
            siparis_zamani: new Date().toISOString()
          }
        ]);
        
      if (customerOrderError) throw customerOrderError;
      
      toast.success("Siparişiniz başarıyla gönderildi");
      setCart([]);
      setNote("");
      
    } catch (error) {
      console.error("Sipariş gönderilirken hata:", error);
      toast.error("Sipariş gönderilemedi");
    } finally {
      setLoading(false);
    }
  };

  // Toplam tutarı hesapla
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.fiyat * item.quantity), 0);
  };

  // Filtrelenmiş ürünleri getir
  const filteredProducts = selectedCategory === "Tümü"
    ? products
    : products.filter(product => product.kategori === selectedCategory);

  // Menü sekmesine geçiş fonksiyonu
  const goToMenu = () => {
    const menuTab = document.querySelector('[data-value="menu"]') as HTMLElement;
    if (menuTab) {
      menuTab.click();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Masa {tableId}</h1>
        <p className="text-muted-foreground">QR Sipariş Sistemi</p>
      </div>

      <div className="grid gap-6">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Garson Çağır</h2>
            <Button 
              onClick={handleCallWaiter} 
              disabled={loading || callWaiter}
              variant={callWaiter ? "outline" : "default"}
              className={callWaiter ? "border-green-500" : ""}
            >
              {callWaiter ? "Garson Çağrıldı" : "Garson Çağır"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Yardıma ihtiyacınız olduğunda garson çağırabilirsiniz.
          </p>
        </Card>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">Menü</TabsTrigger>
            <TabsTrigger value="cart">
              Sepet {cart.length > 0 && <Badge variant="outline" className="ml-2">{cart.length}</Badge>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu">
            <Card>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Menü</h2>
                
                <ScrollArea className="h-12 whitespace-nowrap rounded-md mb-4">
                  <div className="flex space-x-2 p-1">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
                
                <Separator className="my-4" />
                
                <div className="grid gap-4">
                  {loading ? (
                    <p className="text-center py-4">Yükleniyor...</p>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div key={product.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{product.urun_adi}</h3>
                          <p className="text-sm text-muted-foreground">{product.kategori}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold">{product.fiyat} ₺</p>
                          <Button size="sm" onClick={() => addToCart(product)}>Ekle</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4">Bu kategoride ürün bulunamadı</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="cart">
            <Card>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Sepetim</h2>
                
                {cart.length > 0 ? (
                  <div className="grid gap-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{item.urun_adi}</h3>
                          <p className="text-sm text-muted-foreground">{item.fiyat} ₺ x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{(item.fiyat * item.quantity).toFixed(2)} ₺</p>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="outline" onClick={() => removeFromCart(item.id)}>-</Button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <Button size="icon" variant="outline" onClick={() => addToCart(item)}>+</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4">
                      <Label htmlFor="note">Sipariş Notu</Label>
                      <Input
                        id="note"
                        placeholder="Özel istekleriniz varsa belirtebilirsiniz"
                        value={note}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-6 p-3 bg-muted rounded-lg">
                      <span className="font-semibold">Toplam Tutar:</span>
                      <span className="text-xl font-bold">{calculateTotal().toFixed(2)} ₺</span>
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      size="lg"
                      onClick={submitOrder}
                      disabled={loading}
                    >
                      {loading ? "İşleniyor..." : "Siparişi Gönder"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Sepetiniz boş</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={goToMenu}
                    >
                      Menüye Dön
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 