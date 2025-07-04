"use client";

import { QRCodeGenerator } from "@/components/ui/qr-code-generator";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function QRGeneratorPage() {
  // GitHub Pages URL'si veya kendi domain'iniz
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourusername.github.io/adisyon-uygulamasi";

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">QR Kod Oluşturucu</h1>
        <p className="text-muted-foreground">
          Masalar için QR kodları oluşturun ve yazdırın
        </p>
      </div>

      <div className="grid gap-6">
        <QRCodeGenerator baseUrl={baseUrl} />

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">Nasıl Kullanılır?</h2>
          <Separator className="my-2" />
          <div className="space-y-4 text-sm">
            <p>
              QR kodları oluşturmak ve masalara yerleştirmek için bu aracı kullanabilirsiniz.
              Müşteriler QR kodu tarayarak doğrudan sipariş verebilir ve garson çağırabilirler.
            </p>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>Masa numarasını seçin (1-100 arası)</li>
              <li>QR kodunu özelleştirmek için "Özelleştir" sekmesini kullanın</li>
              <li>QR kodunu indirin veya doğrudan yazdırın</li>
              <li>Yazdırılan QR kodunu masa üzerine yerleştirin</li>
            </ol>
            
            <p>
              QR kodu tarandığında, müşteriler doğrudan ilgili masanın sipariş sayfasına yönlendirilecektir.
              Bu sayfadan menüyü görüntüleyebilir, sipariş verebilir ve garson çağırabilirler.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
} 