import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Adisyon Yönetim Sistemi</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Garson, Mutfak ve Kasiyer panelleri için giriş noktası
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold mb-4">Garson Paneli</h2>
            <p className="text-muted-foreground mb-6">
              Masa yönetimi ve sipariş alma işlemleri
            </p>
            <Link href="/garson" className="mt-auto">
              <Button size="lg" className="w-full">Giriş Yap</Button>
            </Link>
          </Card>

          <Card className="p-6 flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold mb-4">Mutfak Paneli</h2>
            <p className="text-muted-foreground mb-6">
              Gelen siparişleri görüntüleme ve hazırlama
            </p>
            <Link href="/mutfak" className="mt-auto">
              <Button size="lg" className="w-full">Giriş Yap</Button>
            </Link>
          </Card>

          <Card className="p-6 flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold mb-4">Kasiyer Paneli</h2>
            <p className="text-muted-foreground mb-6">
              Ödeme alma ve hesap kapatma işlemleri
            </p>
            <Link href="/kasiyer" className="mt-auto">
              <Button size="lg" className="w-full">Giriş Yap</Button>
            </Link>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6 flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold mb-4">Yönetici Paneli</h2>
            <p className="text-muted-foreground mb-6">
              Sistem ayarları ve raporlama işlemleri
            </p>
            <Link href="/yonetici" className="mt-auto">
              <Button size="lg" variant="outline" className="w-full">Giriş Yap</Button>
            </Link>
          </Card>

          <Card className="p-6 flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold mb-4">QR Kod Oluşturucu</h2>
            <p className="text-muted-foreground mb-6">
              Masalar için QR kodları oluşturun ve yazdırın
            </p>
            <Link href="/qr-generator" className="mt-auto">
              <Button size="lg" variant="outline" className="w-full">Oluştur</Button>
            </Link>
          </Card>
        </div>
      </div>
    </main>
  );
}
