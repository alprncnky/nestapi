Yapı Kredi Bankası
Ana sayfa
API'lar & Planlar
Nasıl Kullanılır?
Kaynaklar
Kullanıcı Giriş Üye Ol
NASIL KULLANILIR?
AUTHORIZATION
SIMULATION DATA
CUSTOMERS
CURRENT ACCOUNTS
MONEY TRANSFER
TIME DEPOSIT ACCOUNTS
CREDIT CARDS
FOREIGN CURRENCY
EXCHANGE RATE
MUTUAL FUNDS
PAYMENTS
LOANS
MARKET INFORMATION
Bist Indices
Stock Information
NEAREST BRANCH & ATM
COMMON
Bist Indices

TRENHEMEN DENE

API Bilgileri
Başlık: Market Information

Metot: Bist Indices

Versiyon: v1

Protokol: HTTPS

Açıklama
Bist Indices API’ı ile Borsa İstanbul(BIST) değerlerine* erişebilirsiniz. API kullanarak BIST100, BIST50, BIST30 için günlük en düşük ve en yüksek değerleri, şu anki değerini, yıllık en düşük ve en yüksek değerlerini ve düne göre değişim oranını elde edebilirsiniz.

BIST 100 Endeksi; Borsa İstanbul Pay Piyasası için temel endeks olarak kullanılmaktadır. Ulusal Pazar’da işlem gören şirketlerle, Kurumsal Ürünler Pazarı’nda işlem gören gayrimenkul yatırım ortaklıkları ve girişim sermayesi yatırım ortaklıkları arasından seçilen 100 şirketin hisse senedinden oluşuyor, BIST 30 ve BIST 50 endekslerine dahil payları da kapsıyor. BIST 50 Endeksi; Ulusal Pazar’da işlem gören şirketlerle, Kurumsal Ürünler Pazarı’nda işlem gören gayrimenkul yatırım ortaklıkları ve girişim sermayesi yatırım ortaklıkları arasından seçilen 50 paydan oluşuyor ve BIST 30 endeksine dahil payları da kapsıyor.

*BIST verileri 15 dakika gecikmelidir.

Versiyon Tarihçesi
Şu anda bu API için tek versiyon bulunmaktadır. Yeni özellikler ekleme, hataları çözme ya da performansı iyileştirme çalışmaları nedeniyle yeni versiyon çıkılması durumunda API' ın yeni versiyon bilgileri paylaşılıyor olacaktır.

Input Parametreleri
Bu API herhangi bir input parametresi almamaktadır.

Output Parametreleri
Parametre	Parametre Tipi	Açıklama
data	List	Bist değerlerini içeren liste (Listenin her bir elemanı dusuk, hacimlot, acilis, sembolId, YilDusuk, YilYuksek, simge, satis, vobSayi, aciklama, son, hacimtl, gunlukyuzde, yuksek, alis, Sermaye, piydeg, fark, sembol ve dunkukapanis parametrelerini içerir.)
dusuk	String	Bugünkü En Düşük Değeri
hacimlot	String	Bugün Oluşmuş Hacim Lot (Adet) Değeri
acilis	String	Bugünkü Açılış Değeri
sembolId	String	Endeksin Sembol Id’si
YilDusuk	String	Bu Yılki En Düşük Değeri
YilYuksek	String	Bu Yılki En Yüksek Değeri
simge	String	Düne Göre Artış/Azalış Yönü
satis	String	Satış Değeri
vobSayi	String	Vob Sayı
aciklama	String	BIST Tipi Açıklaması
son	String	Son Değeri
hacimtl	String	Bugün Oluşan Hacmin TL Karşılığı
gunlukyuzde	String	Günlük Azalış/Artış Yüzdesi
yuksek	String	Bugünkü En Yüksek Değeri
alis	String	Alış Değeri
Sermaye	String	Sermaye
piydeg	String	Piyasa Değeri
fark	String	Dünden Şu Anki Endekslerde Oluşan Fark
sembol	String	BIST Kodu
dunkukapanis	String	Dünkü Kapanış Değeri
Response
                        
{
   "response": 
  {
     "data": [ 
      {
         "dusuk": "106161,
        86",
         "hacimlot": "112946306",
         "acilis": "106510,
        62",
         "sembolId": "642",
         "YilDusuk": "71792,
        96",
         "YilYuksek": "110530,
        75",
         "simge": "**asagi**",
         "satis": "0,
        00",
         "vobSayi": "",
         "aciklama": "BIST 100 (ENDEKS)",
         "son": "106490,
        28",
         "hacimtl": "561622312",
         "gunlukyuzde": "-0,
        04",
         "yuksek": "106570,
        45",
         "alis": "0,
        00",
         "Sermaye": "0",
         "piydeg": "0",
         "fark": "-44,
        32",
         "sembol": "XU100",
         "dunkukapanis": "106534,
        60" 
      },
       
      {
         "dusuk": "130117,
        74",
         "hacimlot": "61718874",
         "acilis": "130541,
        53",
         "sembolId": "641",
         "YilDusuk": "87755,
        40",
         "YilYuksek": "136130,
        33",
         "simge": "**asagi**",
         "satis": "0,
        00",
         "vobSayi": "",
         "aciklama": "BIST 30 (ENDEKS)",
         "son": "130529,
        54",
         "hacimtl": "428349259",
         "gunlukyuzde": "-0,
        05",
         "yuksek": "130627,
        28",
         "alis": "0,
        00",
         "Sermaye": "0",
         "piydeg": "0",
         "fark": "-66,
        84",
         "sembol": "XU030",
         "dunkukapanis": "130596,
        38" 
      },
       
      {
         "dusuk": "101948,
        36",
         "hacimlot": "74794903",
         "acilis": "102273,
        87",
         "sembolId": "609",
         "YilDusuk": "68642,
        44",
         "YilYuksek": "106430,
        91",
         "simge": "**asagi**",
         "satis": "0,
        00",
         "vobSayi": "",
         "aciklama": "BIST 50 (ENDEKS)",
         "son": "102259,
        89",
         "hacimtl": "481162485",
         "gunlukyuzde": "-0,
        03",
         "yuksek": "102305,
        02",
         "alis": "0,
        00",
         "Sermaye": "0",
         "piydeg": "0",
         "fark": "-32,
        36",
         "sembol": "XU050",
         "dunkukapanis": "102292,
        25" 
      } 
    ] 
  } 
}
                        
                      
Endpoint Adresi
                                
https://api.yapikredi.com.tr/api/stockmarket/v1/bistIndices
                                
                            



Hemen Dene

API URL : https://api.yapikredi.com.tr/api/stockmarket/v1/

Authentication (None)
Tümünü Göster
bistIndices Göster/Gizle İşlemleri Listele İşlemleri Genişletin
GET bistIndices Bist Indices
API Notları
Bist Indices

Parametreler
Parametre	Parametre Değeri	Açıklama
Response Mesajları
HTTP Statü Kodu	Sebep	Response Modeli
200		
Parametre Ekle  Dene!

api
© 2017 Yapı ve Kredi Bankası A.Ş. Tüm hakları saklıdır.
Yapı Kredi Hakkında
api