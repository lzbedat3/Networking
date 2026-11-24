// Condensed course context for the AI assistant (built from the syllabus, lectures, tirgulim and HW of 214.2900).
export const COURSE_NOTES = `
# קורס: תקשורת נתונים 214.2900, אוניברסיטת חיפה, תשפ"ז (סמסטר א' 2026-27)
מרצה: פרופ' אסנת מוקרין. מתרגל: ויאם שאהין. ספר: Kurose & Ross, Computer Networking: A Top-Down Approach, מהדורה 7 (Global Edition).

## הערכה
- 5% השתתפות, 5% הגשת כל תרגילי הבית, 90% באחד משני מסלולים: (1) שני בחנים, 45% כל אחד. (2) בחן אחד + פרויקט תכנות בשכבת הרשת עם בחינה בעל פה (45%+45%).
- בוחן 1: יום שישי 27.11.2026 בשעה 09:00, בכיתות המחשבים בקמפוס ההר. חומר סגור, דף עזר אחד. בערך 14 עד 22 שאלות אמריקאיות בעברית, בחירה יחידה ורב-ברירה (סימון שגוי מוריד ניקוד), עם צילומי Wireshark, קוד ותרשימים. 90 דקות.
- בוחן 2: יום רביעי 6.1.2027 במקום ההרצאה. שכבת הרשת והלינק, ענן ו-CDN.
- ציון עובר בקורס: 55.

## חומר בוחן 1
1. מבוא (פרק 1): edge/core, רשתות גישה (DSL, cable, Ethernet, WiFi), packet switching, store-and-forward, מודל השכבות (5 שכבות TCP/IP: application, transport, network, link, physical), encapsulation: message → segment → datagram → frame.
   השהיות: d = d_proc + d_queue + d_trans + d_prop. d_trans = L/R (L בביטים!). d_prop = d/s, או מרחק × delay factor (μs/km). אנלוגיית השיירה (cars = bits, caravan = packet).
   **שיטת ציר הזמן של הקורס (תרגול 1): סה"כ = proc(A) + L/R + prop + proc(B)**. עיבוד נספר בשני הצדדים. "ביט אחד מ-A ל-B" = prop בלבד. "כל החבילה על הלינק" = L/R.
   יחידות: 1 Byte = 8 bits, Mbps = ביטים למיקרו-שנייה. 100 Mbps ≠ 100 MBps.
2. שכבת האפליקציה: client-server מול P2P, socket = IP + port (IP 32 ביט, port 16 ביט), דרישות אפליקציות (reliability, throughput, timing, security). פורטים: HTTP 80, HTTPS 443, SMTP 25, DNS 53, FTP 21. 0-1023 well-known, 1024-65535 ephemeral (מערכת ההפעלה בוחרת ללקוח).
3. HTTP: stateless, רץ מעל TCP. non-persistent (HTTP/1.0): 2RTT + trans לכל אובייקט, חיבור TCP חדש לכל אובייקט. persistent (HTTP/1.1): 2RTT ל-HTML ואחר כך בערך RTT לכל אובייקט (בערך RTT אחד לכולם עם pipelining). HTTP/2 (2015) frames בינאריים, HTTP/3 (2022) מעל QUIC/UDP.
   הודעות: request line (method URL version), headers, שורה ריקה, body. GET (פרמטרים ב-URL), POST (ב-body), HEAD (בלי האובייקט), PUT, DELETE. Host חובה מ-1.1.
   קודי סטטוס: 1xx, 2xx (200), 3xx (301, 304), 4xx (400, 401, 403, 404), 5xx (500, 503, 505).
   Conditional GET: If-Modified-Since. לא השתנה → 304 בלי body. השתנה → 200 + data. ההשוואה היא מול If-Modified-Since, לא מול Date.
   HTTPS = HTTP בתוך TLS על 443. ב-Wireshark רואים רק "Application Data". ב-HTTP רגיל רואים סיסמאות ב-POST.
4. Cookies ו-Proxy (תרגול 3): 4 רכיבים: Set-Cookie בתשובה, Cookie בבקשה, קובץ בדפדפן, DB בשרת. ה-cookie נשמר אצל הלקוח. Proxy הוא גם לקוח וגם שרת. hit → מחזיר עותק, miss → מביא מה-origin, שומר ושולח. בקשות למקור = (1 − hit rate) × סה"כ.
5. DNS: מבוזר והיררכי (לא מרכזי: single point of failure, traffic volume, distant DB, maintenance). Root (13 שמות לוגיים a-m, anycast), TLD (com, org, il), Authoritative (של הארגון), Local DNS (של ה-ISP, לא חלק מההיררכיה, נשאל ראשון, יש לו cache).
   איטרטיבי: השרת המקומי פונה לכל שרת בעצמו. רקורסיבי: כל שרת פונה לבא אחריו (עומס על הרמות העליונות).
   RR = (name, value, type, ttl). A: שם → IP. NS: דומיין → שם השרת הסמכותי. CNAME: alias → canonical. MX: דומיין → שם שרת הדואר. TLD מחזיר NS + A (glue).
   UDP 53 לשאילתות רגילות, TCP 53 לתשובה גדולה או zone transfer. DoH 443, DoT/DoQ 853.
   nslookup name [server]. 'Non-authoritative answer' = ממטמון. ipconfig /displaydns, /flushdns, /all. אם אין חבילות DNS ב-Wireshark → התשובה כבר במטמון.
6. שכבת התעבורה: תקשורת לוגית בין תהליכים (רשת = בין hosts). אנלוגיית אן וביל: houses = hosts, kids = processes, Ann & Bill = transport, postal = network.
   Mux/Demux: נעשה על ידי מערכת ההפעלה בעזרת פורטים. UDP: סוקט מזוהה לפי (dst IP, dst port), לקוחות שונים מגיעים לאותו סוקט. TCP: 4-tuple (src IP, src port, dst IP, dst port), סוקט נפרד לכל חיבור (accept מחזיר סוקט חדש).
   UDP: כותרת 8 בתים (src port, dst port, length, checksum), best effort, connectionless, אין flow/congestion control. checksum = סכום 1's complement של מילים בנות 16 ביט, עם wraparound של ה-carry ואז היפוך. רק מזהה שגיאות, לא מתקן.
7. העברה אמינה: rdt, Stop-and-Wait (seq# 0/1 נגד כפילויות כשה-ACK אובד), U = (L/R)/(RTT + L/R) (דוגמה: 1Gbps, 8000 bit, RTT 30ms → 0.027%). Pipelining: GBN (ACK מצטבר, טיימר לוותיקה ביותר, ב-timeout שולחים מחדש את כל החלון, המקבל זורק חבילות שלא לפי הסדר ושולח שוב ACK על האחרונה שהגיעה לפי הסדר) ו-Selective Repeat.
8. TCP: point-to-point, full duplex, byte stream, MSS. Seq = מספר הבית הראשון בסגמנט. ACK = הבית הבא שמצופה (מצטבר). Next seq = Seq + Len. חבילה שהגיעה שלא לפי הסדר → נשמרת ב-buffer + ACK כפול מיד.
   ACK generation (RFC 1122): לפי הסדר ואין ACK ממתין → delayed ACK עד 200ms. לפי הסדר ויש ACK ממתין → ACK מצטבר מיד. שלא לפי הסדר → dup ACK מיד. ממלא חור → ACK מיד.
   Fast retransmit: 3 dup ACKs → שליחה מחדש לפני ה-timeout. טיימר יחיד לסגמנט הוותיק ביותר שלא אושר.
   RTT: EstimatedRTT = (1−α)·Est + α·Sample (α=0.125). DevRTT = (1−β)·Dev + β·|Sample−Est| (β=0.25). Timeout = Est + 4·DevRTT. לא מודדים RTT על שידור חוזר.
   Flow control: RcvWindow = RcvBuffer − (LastByteRcvd − LastByteRead). חלון 0 → השולח עוצר (zero window deadlock).
   Silly Window Syndrome (מצגת SWS): tinygram (40B כותרת + 1B = 97.6% תקורה). Nagle (צד שולח): לא שולחים מידע קטן עד שיש MSS מלא או שהתקבל ACK על הקודם. Clark (צד מקבל): מפרסמים חלון 0 עד שיש MSS פנוי או 50% מה-buffer. Nagle + delayed ACK = השרת לא יכול לשלוח עד שמגיע ACK.
   Three-way handshake: SYN(seq=x) → SYN-ACK(seq=y, ack=x+1) → ACK(seq=x+1, ack=y+1). הסיבה: delayed duplicates. סגירה: FIN, ACK, FIN, ACK, ו-timed wait אצל מי שסגר ראשון.
9. בקרת עומס: שונה מ-flow control. אובדן = timeout או 3 dup ACKs. AIMD (+1 MSS לכל RTT, חצי באובדן, saw-tooth). Slow start: cwnd=1, מוכפל בכל RTT עד ssthresh. Congestion avoidance מעל ssthresh. 3 dup ACKs: ssthresh=cwnd/2, cwnd=ssthresh. Timeout: ssthresh=cwnd/2, cwnd=1 MSS. השולח מוגבל ל-min(CongWin, RcvWindow). Throughput ממוצע ≈ 0.75·W/RTT. Fairness: K חיבורים מקבלים R/K כל אחד, אבל חיבורים מקבילים "עוקפים" את זה, ו-UDP לא הוגן.
10. תכנות Sockets בפייתון: UDP client: socket(AF_INET, SOCK_DGRAM) → sendto → recvfrom → close. UDP server: socket → bind → recvfrom/sendto בלולאה (בלי accept). TCP server: socket(SOCK_STREAM) → bind → listen(5) (backlog) → accept (סוקט חדש) → recv/send → close. TCP client: socket → connect → send/recv → close. send/recv בלי כתובת = TCP. "recv ואז send" = שרת. bind('') = INADDR_ANY. קבצי התרגול: UDP_Server.py/UDP_Client.py (פורט 5000), TCP_BlockingServer.py/TCP_Client.py (פורט 27015, תפריט: time, random word, name, exit). לכידה באותו מחשב: ממשק Npcap Loopback.

## Wireshark
מסננים: http, dns, tcp.port == 80, udp.port == 5000, ip.addr == X, http.request.method == "GET", tcp.flags.syn==1 && tcp.flags.ack==0. צבעים: TCP לילך, HTTP ירוק בהיר, UDP/DNS תכלת, Bad TCP (dup ack, retransmission) שחור עם טקסט אדום, SYN/FIN אפור. פרטי חבילה: Frame → Ethernet II (MAC) → IP → TCP (ports, Seq, Ack, Len) → HTTP.

## תרגילי בית
1. Wireshark + שכבת האפליקציה + השהיות (הוגש 16.11): כמה חיבורי TCP ב-HTTP 1.0 לדף עם 6 תמונות (7), badssl, cookies מול cache, היררכיית DNS (הרווארד → campus.gov.il), חישובי השהיה.
2. תכנות Client/Server מעל UDP + שאלות שכבת התעבורה (מצבים מתמשך / לא מתמשך, השוואת RTT).
3-5 (לבוחן 2): Wireshark IP, DHCP, ענן ו-CDN.

## חומר בוחן 2 (לא בבוחן 1)
שכבת הרשת: IPv4, datagram, fragmentation, subnetting/CIDR, longest prefix match, NAT, AS, ISP. שכבת הלינק: MAC, ARP, DHCP, Ethernet, switches, VLAN. ענן (NIST, SaaS/PaaS/IaaS) ו-CDN. בינארי ו-subnet masks (תרגול 7).
`;
