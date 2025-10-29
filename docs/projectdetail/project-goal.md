# StockInsight App

İnternet üstünde ki haberleri, ekonomik gelişmeleri, ve belirli baz alınabilcek piyasa değerlerini araştırma ve bunları bir araya getirip kaydeden bir uygulama olucak. Bu kaydedilen verilerden AI ile anlamlı tahminleme yapıp alınabilecek borsa hisselerini tespit etme amacı ile kullanılabilecek.

# Uygulama Detayı:

Önce zaman ayarlı tetiklemeler ile websiteleri ve Api lere istek atıp doğru verileri çekebilmek lazım. Aynı zamanda bir borsa API si ilede takip edilen hisselerin değerlerini yakalamış olacağız. Sonrasında bu verilerden anlamlı kategorilendirme, etiketleme ve puanlama ile veritabanına kaydedebilmek lazım. Sonrasında Buradaki veri ile borsa hisselerini satın almak için bir sıralama yapıp durama göre bir rapor olarak dashboardta gözükmesini sağlayacağız. 

Haber ve finans verilerini topladıktan sonra ilgili zaman damgalarına göre borsa hisselerini ve artışlarını kıyaslayıp bu toplanan datanın güvenirliğini puanlayacağız. Böylece geçmişe yönelik hangi veri kaynağı ve yapılan puanlamanın doğruluğunu tespit edip kaydedeceğiz. Böylece bir sonraki veri ve haber kaynaklarındaki geçen hisselerin gelecekteki tahminlemesini daha doğru yapabilmemiz sağlayacak.

Önemli noktalardan birisi geçmişe yönelik veri kıyaslaması yaparken zaman damgaları ve borsa saatlerinin haftasonu işlemediğine göre çalışma zamanlarında hesaba katarak kıyaslamak gerekebilir.

## Sistem Mimarisi Notları:

Birden fazla Borsa takip edilebilir. Ülke bazlı ayrım olması lazım. Hesaba katılan veri kaynağı ülke bazlı olabilir. Genel etki ve local etki ayrımı ile dahil edilebilir