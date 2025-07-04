export const metadata = {
  title: "Masa Siparişi",
  description: "QR kod ile sipariş verme",
};

// Statik parametreleri oluştur
export function generateStaticParams() {
  return [
    { tableId: '1' },
    { tableId: '2' },
    { tableId: '3' },
    { tableId: '4' },
    { tableId: '5' },
    { tableId: '6' },
    { tableId: '7' },
    { tableId: '8' },
    { tableId: '9' },
    { tableId: '10' },
  ];
}

export default function Page({ params }: { params: { tableId: string } }) {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Masa {params.tableId}</h1>
        <p>QR Sipariş Sistemi</p>
      </div>
      
      <div className="grid gap-6">
        <div className="p-4 border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Garson Çağır</h2>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Garson Çağır
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Yardıma ihtiyacınız olduğunda garson çağırabilirsiniz.
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Menü</h2>
          <p>Bu sayfanın client component versiyonu için lütfen web-garson-panel/components/customer/CustomerPage.tsx dosyasını oluşturun.</p>
        </div>
      </div>
    </div>
  );
} 