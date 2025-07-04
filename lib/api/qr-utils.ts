/**
 * QR kod oluşturma ve yönetimi için yardımcı fonksiyonlar
 */

/**
 * QR kod URL'i oluşturur
 * @param baseUrl Site URL'i
 * @param tableId Masa numarası
 * @returns QR kod URL'i
 */
export function generateQRUrl(baseUrl: string, tableId: string): string {
  // URL'in sonunda / varsa kaldır
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/customer/${tableId}`;
}

/**
 * QR kod için dosya adı oluşturur
 * @param tableId Masa numarası
 * @returns Dosya adı
 */
export function generateQRFileName(tableId: string): string {
  return `masa-${tableId}-qr.png`;
}

/**
 * QR kod için yazdırma HTML'i oluşturur
 * @param dataUrl QR kod resmi (data URL formatında)
 * @param tableId Masa numarası
 * @returns HTML içeriği
 */
export function generatePrintHTML(dataUrl: string, tableId: string): string {
  return `
    <html>
      <head>
        <title>Masa ${tableId} QR Kodu</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
          }
          .container {
            text-align: center;
            max-width: 400px;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          h1 {
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 24px;
          }
          p {
            margin-top: 10px;
            font-size: 16px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="${dataUrl}" alt="QR Kod" />
          <h1>Masa ${tableId}</h1>
          <p>Sipariş vermek için QR kodu okutun</p>
          <button class="no-print" onclick="window.print();return false;">Yazdır</button>
        </div>
      </body>
    </html>
  `;
}

/**
 * QR kod için varsayılan boyut ve renkleri içeren ayarlar
 */
export const defaultQRSettings = {
  size: 200,
  bgColor: '#ffffff',
  fgColor: '#000000',
  level: 'H' as 'L' | 'M' | 'Q' | 'H',
  includeMargin: true,
}; 