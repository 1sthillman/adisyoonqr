"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Separator } from "./separator";
import QRCode from "qrcode.react";

interface QRCodeGeneratorProps {
  baseUrl: string;
  className?: string;
}

export function QRCodeGenerator({ baseUrl, className }: QRCodeGeneratorProps) {
  const [tableId, setTableId] = useState<string>("1");
  const [qrUrl, setQrUrl] = useState<string>("");
  const [qrSize, setQrSize] = useState<number>(200);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [fgColor, setFgColor] = useState<string>("#000000");

  useEffect(() => {
    const url = `${baseUrl}/customer/${tableId}`;
    setQrUrl(url);
  }, [baseUrl, tableId]);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `masa-${tableId}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const printQR = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
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
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <Card className={`p-4 ${className || ""}`}>
      <h2 className="text-xl font-semibold mb-4">QR Kod Oluşturucu</h2>
      <Tabs defaultValue="generate">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Oluştur</TabsTrigger>
          <TabsTrigger value="customize">Özelleştir</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="table-id">Masa Numarası</Label>
            <Input
              id="table-id"
              type="number"
              min="1"
              max="100"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
            />
          </div>
          
          <div className="flex justify-center py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode
                id="qr-code"
                value={qrUrl}
                size={qrSize}
                bgColor={bgColor}
                fgColor={fgColor}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>URL: {qrUrl}</p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={downloadQR} variant="outline">
              İndir
            </Button>
            <Button onClick={printQR}>
              Yazdır
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="customize" className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="qr-size">QR Kod Boyutu</Label>
            <div className="flex items-center gap-2">
              <Input
                id="qr-size"
                type="range"
                min="100"
                max="300"
                step="10"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
              />
              <span className="w-12 text-center">{qrSize}px</span>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bg-color">Arka Plan Rengi</Label>
            <div className="flex items-center gap-2">
              <Input
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-12 h-8 p-0"
              />
              <Input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="fg-color">QR Kod Rengi</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fg-color"
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-12 h-8 p-0"
              />
              <Input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 