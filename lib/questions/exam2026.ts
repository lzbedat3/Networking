import { Question, o } from "../types";

// The 14 questions from the real 2026 Quiz 1 (בוחן 1), reconstructed from "2026 exam A.pdf".
export const exam2026: Question[] = [
  {
    id: "ex1",
    topic: "dns",
    source: "exam2026",
    prompt:
      "סטודנטית נכנסת לאתר www.tapuz.co.il מביתה דרך Wi-Fi, ומפעילה Wireshark במקביל. השרת שולח דף HTML שבעקבותיו נטענים 10 קבצי JS, 13 קבצי CSS ו-19 תמונות JPG. היא מגלה שלא עברה אף חבילת DNS. מה עשוי להסביר את התופעה?",
    images: [{ src: "/exam/q1-wireshark.png", alt: "Wireshark: HTTP/1.1 200 OK response details", caption: "דוגמה לאחד מדפי ה-Wireshark שלכדה (מהבוחן המקורי)" }],
    options: [
      o(
        "התרגום התבצע על ידי שרת ה-DNS המקומי ולכן לא נקלט ב-Wireshark",
        false,
        "שרת ה-DNS המקומי (של ספק האינטרנט) נמצא מחוץ למחשב. כדי לשאול אותו, המחשב חייב לשלוח שאילתת DNS (UDP 53), ו-Wireshark היה לוכד אותה.",
      ),
      o(
        "התרגום כבר קיים ב-cache (זיכרון מטמון) של הדפדפן של הסטודנטית",
        true,
        "נכון. אם הכתובת כבר במטמון המקומי (של הדפדפן או של מערכת ההפעלה), אין צורך לשלוח שאילתה, ולכן לא תופיע אף חבילת DNS. בגלל זה בתרגול מריצים ipconfig /flushdns לפני הלכידה.",
      ),
      o("אף תשובה אינה נכונה", false, "תשובה 2 מסבירה את התופעה."),
      o(
        "אין צורך בשירותי DNS בבקשה זו",
        false,
        "היא הקלידה שם מתחם ולא כתובת IP, ולכן חייבים לתרגם אותו. השאלה רק אם התרגום כבר שמור במטמון.",
      ),
    ],
    explanation:
      "DNS נשלח רק כשאין תשובה במטמון המקומי. סדר החיפוש: מטמון הדפדפן, מטמון מערכת ההפעלה, ורק אחר כך שאילתה לשרת המקומי. כל שאילתה שיוצאת מהמחשב נראית ב-Wireshark.",
  },
  {
    id: "ex2",
    topic: "dns",
    source: "exam2026",
    prompt: "מה תהיה תוצאת הפקודה הבאה?",
    pre: "nslookup www.example.com 8.8.8.8",
    options: [
      o(
        "הפקודה תחפש מידע על שרתי השורש (ROOT) המחזיקים מידע על ה-Authoritative Domain של www.example.com, בשרת www.example.com",
        false,
        "nslookup לא פונה לשרתי השורש ולא לשרת היעד עצמו. הוא שולח שאילתה לשרת DNS אחד.",
      ),
      o(
        "הפקודה תחפש מידע על שרתי השורש המחזיקים מידע על ה-Authoritative Domain של www.example.com, בשרת 8.8.8.8",
        false,
        "הפקודה שואלת על הדומיין עצמו ולא על שרתי השורש.",
      ),
      o(
        "הפקודה תחפש מידע DNS על הדומיין www.example.com באמצעות שרת ה-DNS שכתובתו 8.8.8.8",
        true,
        "נכון. התחביר הוא nslookup <name> [server]. הארגומנט השני קובע לאיזה שרת DNS לשלוח את השאילתה במקום שרת ברירת המחדל (8.8.8.8 הוא השרת של Google).",
      ),
      o(
        "הפקודה גורמת לחיפוש מידע DNS על www.example.com בשרת ה-DNS המקומי של המשתמש",
        false,
        "זה היה נכון בלי הארגומנט 8.8.8.8. כשמציינים שרת, השאילתה נשלחת אליו ולא לשרת המקומי.",
      ),
    ],
    explanation:
      "nslookup name → שואל את שרת ה-DNS המוגדר (המקומי). nslookup name server → שואל את השרת שציינת. 'Non-authoritative answer' אומר שהתשובה הגיעה ממטמון של שרת שאינו הסמכותי (authoritative).",
  },
  {
    id: "ex3",
    topic: "http",
    source: "exam2026",
    multi: true,
    prompt: "מתבצעת בקשת HTTP GET לשרת, והשרת מחזיר את התשובה המוצגת. בהתבסס על הכותרת If-Modified-Since, אילו מהטענות נכונות?",
    images: [
      { src: "/exam/q3-request.png", alt: "HTTP GET request with If-Modified-Since", caption: "חלק מהבקשה" },
      { src: "/exam/q3-response.png", alt: "HTTP 200 OK response", caption: "התשובה שהשרת החזיר" },
    ],
    pre: `GET /resources/image.jpg HTTP/1.1
Host: www.example.com
If-Modified-Since: Tue, 19 Dec 2023 14:30:00 GMT

HTTP/1.1 200 OK
Date: Tue, 19 Dec 2023 14:32:00 GMT
Content-Type: image/jpeg
Content-Length: 2048
Last-Modified: Tue, 19 Dec 2023 14:31:00 GMT
Cache-Control: max-age=3600, public`,
    options: [
      o(
        "התגובה 200 OK מצביעה על כך שהקובץ לא נמצא במטמון של השרת",
        false,
        "לשרת המקור אין 'מטמון' במובן הזה, והמטמון שרלוונטי כאן הוא של הלקוח. 200 אומר רק שהבקשה הצליחה והאובייקט נשלח.",
      ),
      o(
        "השרת קבע שהקובץ השתנה מאז התאריך שצוין בכותרת, ולכן שלח עותק מעודכן",
        true,
        "נכון. Last-Modified = 14:31 מאוחר מ-If-Modified-Since = 14:30. הקובץ השתנה, ולכן השרת שלח 200 עם הקובץ.",
      ),
      o(
        "שדה ה-If-Modified-Since נועד להקטין את העומס על הרשת במקרה שבו הקובץ לא השתנה",
        true,
        "נכון. זו המטרה של Conditional GET: אם הקובץ לא השתנה, השרת מחזיר 304 בלי body וחוסך רוחב פס.",
      ),
      o(
        "השרת לא בחן את הכותרת If-Modified-Since ולכן שלח את הקובץ ללא קשר למצבו",
        false,
        "התאריכים מראים שהקובץ באמת השתנה, ולכן 200 היא התגובה הנכונה אחרי בדיקה. אין סיבה להניח שהשרת התעלם מהכותרת.",
      ),
      o(
        "אם הקובץ לא היה משתנה מאז התאריך שצוין בכותרת Date, השרת היה מחזיר 304 Not Modified",
        false,
        "מלכודת! ההשוואה היא מול התאריך שבכותרת If-Modified-Since, לא מול כותרת Date. כותרת Date היא רק זמן יצירת התשובה.",
      ),
    ],
    explanation:
      "Conditional GET: הלקוח שולח If-Modified-Since עם התאריך של העותק שבמטמון. אם הקובץ לא השתנה, השרת מחזיר 304 Not Modified בלי body. אם השתנה, הוא מחזיר 200 OK עם הקובץ החדש. שימו לב לאיזו כותרת התשובות מתייחסות.",
  },
  {
    id: "ex4",
    topic: "transport",
    source: "exam2026",
    multi: true,
    prompt: "מה מהבאים מאפיין את ה-Multiplexing בשכבת התעבורה?",
    options: [
      o("קישור חיבור TCP באמצעות כתובות MAC", false, "כתובות MAC שייכות לשכבת הלינק. שכבת התעבורה משתמשת בפורטים (ו-TCP גם בכתובות IP, כחלק מה-4-tuple)."),
      o("נעשה על ידי תהליך המשתמש", false, "התהליך רק כותב לסוקט. את הוספת הכותרת עם הפורטים עושה שכבת התעבורה, שממומשת במערכת ההפעלה."),
      o("תלוי בגרסת ה-HTTP", false, "Multiplexing הוא מנגנון של שכבת התעבורה ולא תלוי בפרוטוקול האפליקציה."),
      o("נעשה על ידי מערכת ההפעלה", true, "נכון. שכבת התעבורה (TCP/UDP) ממומשת בקרנל של מערכת ההפעלה. הסוקט הוא ה'דלת' בין האפליקציה למערכת ההפעלה."),
      o("שימוש בפורטים לזיהוי תהליכים", true, "נכון. כתובת IP מזהה מחשב ופורט מזהה תהליך. כותרת התעבורה מכילה את פורט המקור ופורט היעד."),
    ],
    explanation:
      "Multiplexing (בצד השולח): איסוף נתונים מכמה סוקטים והוספת כותרת עם פורטים. Demultiplexing (בצד המקבל): ניתוב הסגמנט לסוקט הנכון לפי הכותרת. את שניהם עושה מערכת ההפעלה.",
  },
  {
    id: "ex5",
    topic: "tcp",
    source: "exam2026",
    prompt:
      "בתרשים יש תקשורת דו-כיוונית בין לקוח לשרת: הלקוח שולח Request, השרת עונה ACK, ואז השרת שולח Response מלא (Full-size) ואחריו Response קטן (Small). בשלב הזה השרת לא יכול לשלוח תשובות נוספות עד שיקבל ACK, והלקוח מעכב את ה-ACK. ממה נובעת המגבלה שהשרת לא יכול לשלוח עד שיקבל ACK?",
    images: [{ src: "/exam/q5-diagram.png", alt: "Client/server timing diagram: server cannot send until ACK is received", caption: "התרשים מהבוחן (הלקוח משמאל, השרת מימין)" }],
    pre: `Client                      Server
  |------- Request -------->|
  |<-------- ACK -----------|
  |<--- Response (full) ----|
  |<--- Response (small) ---|
  |  (delayed...)           |  Server cannot send additional
  |--------- ACK ---------->|  responses until ACK is received
  |<------ Response --------|`,
    options: [
      o("מנגנון Fast Retransmit", false, "Fast Retransmit שולח מחדש סגמנט אחרי 3 ACK כפולים. כאן אין אובדן חבילות."),
      o(
        "מנגנון Delayed ACK",
        false,
        "Delayed ACK (המתנה של עד 200ms) הוא מה שגורם ל-ACK של הלקוח להתעכב, אבל זה מנגנון של צד המקבל. החוק 'אסור לי לשלוח עוד עד שאקבל ACK' שייך לשולח, וזה Nagle. (בצילום מהמבחן סומנה תשובה זו, אבל המגבלה המתוארת היא של Nagle.)",
      ),
      o("מנגנון Slow Start", false, "Slow Start מגביל את גודל ה-CongWin בתחילת חיבור, ולא קשור לסגמנט קטן שמחכה ל-ACK."),
      o(
        "אלגוריתם Nagle",
        true,
        "נכון. לפי Nagle, אי אפשר לשלוח מידע קטן חדש כל עוד יש מידע שעוד לא קיבל ACK. השרת שלח סגמנט קטן ולכן חייב לחכות ל-ACK. השילוב של Nagle בצד אחד ו-Delayed ACK בצד השני יוצר את ההמתנה הארוכה בתרשים.",
      ),
    ],
    explanation:
      "זו האינטראקציה המפורסמת בין Nagle ל-Delayed ACK. Nagle (בשולח) לא מאפשר לשלוח tinygram נוסף לפני שמתקבל ACK, ו-Delayed ACK (במקבל) מחכה עד 200ms לפני ששולח ACK. ⚠️ האופציות 3 ו-4 נחתכו בצילום המקורי ושוחזרו כאן.",
  },
  {
    id: "ex6",
    topic: "rdt",
    source: "exam2026",
    prompt: "מה עושה הצד המקבל עם חבילה שמגיעה שלא לפי הסדר? בחרו את הצירוף הנכון עבור TCP ועבור Go-Back-N.",
    options: [
      o(
        "TCP: החבילה נשמרת בחוצצים (buffers) | GBN: החבילה נזרקת",
        true,
        "נכון. ב-GBN המקבל זוכר רק את expectedseqnum, זורק כל חבילה שלא לפי הסדר ושולח שוב ACK על החבילה האחרונה שהגיעה לפי הסדר. ב-TCP המקבל שומר אותה ב-buffer ושולח ACK כפול מיד (במימושים בפועל, כי התקן משאיר את זה למממש).",
      ),
      o("TCP: החבילה נזרקת | GBN: החבילה נשמרת בחוצצים", false, "ההפך. ב-GBN אין buffer במקבל (no receiver buffering)."),
      o(
        "TCP: נשמרת בחוצצים אבל רק ל-200msec | GBN: נזרקת",
        false,
        "200ms הוא זמן ההמתנה של Delayed ACK, ולא זמן שמירה של חבילה. המספר מופיע כאן כדי לבלבל.",
      ),
      o("TCP: נשמרת בחוצצים | GBN: נשמרת בחוצצים אבל רק ל-200msec", false, "GBN לא שומר חבילות שהגיעו שלא לפי הסדר בכלל."),
    ],
    explanation:
      "GBN נקרא 'enhanced' ב-TCP: גם ב-TCP ה-ACK מצטבר (cumulative), אבל TCP שומר סגמנטים שהגיעו שלא לפי הסדר ושולח ACK כפול מיד, כדי שהשולח יוכל לבצע Fast Retransmit.",
  },
  {
    id: "ex7",
    topic: "sockets",
    source: "exam2026",
    prompt: "קטע הקוד שלפניכם שייך ל:",
    images: [{ src: "/exam/q7-code.png", alt: "C code: recv then send", caption: "הקוד כפי שהופיע בבוחן" }],
    code: `bytesRecv = recv(Socket, recvBuff, 255, 0);
if (bytesRecv < 0)
{
    char snum[5];
    itoa(bytesRecv, snum, 10);
    DieWithError(snum);
}

printf("Sending: %s\\n", sendBuff);
bytesSent = send(Socket, sendBuff, (int) strlen(sendBuff), 0);
if (bytesSent < 0)
    DieWithError("Error at send()");`,
    options: [
      o("קוד לקוח ב-UDP", false, "ב-UDP משתמשים ב-sendto/recvfrom עם כתובת. כאן יש send/recv בלי כתובת, כלומר סוקט מחובר של TCP."),
      o("קוד לקוח ב-TCP", false, "לקוח קודם שולח בקשה ורק אחר כך מקבל תשובה. כאן הסדר הפוך: קודם recv ואז send."),
      o("קוד שרת ב-UDP", false, "שרת UDP משתמש ב-recvfrom כדי לדעת למי לענות, ואז ב-sendto."),
      o(
        "קוד שרת ב-TCP",
        true,
        "נכון. send/recv בלי כתובת אומר TCP (החיבור כבר קיים). הסדר recv ואז send אומר שרת: מקבל בקשה ושולח תשובה. זה בדיוק המבנה של TCP_BlockingServer מהתרגול.",
      ),
    ],
    explanation:
      "טריק לזיהוי: (1) sendto/recvfrom → UDP, send/recv → TCP. (2) bind/listen/accept או 'מקבל ואז עונה' → שרת; connect או 'שולח ואז מקבל' → לקוח.",
  },
  {
    id: "ex8",
    topic: "transport",
    source: "exam2026",
    prompt:
      "UDP לא אמין ו-connectionless, ו-TCP אמין ו-connection oriented. נדרש לאפיין פרוטוקול חדש בשכבת התעבורה בשם Reliable UDP (RUDP), שמטרתו לאפשר העברת נתונים אמינה בלי בקשת קישור. בהינתן מבנה הכותרת המקורי של UDP (source port, dest port, length, checksum), מה מתאים ביותר לדרישות של RUDP?",
    images: [{ src: "/exam/q8-udp-header.png", alt: "UDP header: source port, destination port, UDP length, checksum, data", caption: "מבנה פרוטוקול UDP המקורי" }],
    options: [
      o("להוסיף שני שדות: מספר קבלה (ack) וגודל חלון קבלה", false, "בלי sequence number המקבל לא יכול לזהות כפילויות או חוסרים, וה-ACK לא מתייחס לשום דבר מוגדר."),
      o("להוסיף שני שדות: sequence number וגודל חלון קבלה", false, "בלי ACK השולח לא יודע מה הגיע ולא יכול להחליט מה לשלוח מחדש."),
      o("להוסיף רק sequence number", false, "מספיק לזיהוי סדר וכפילויות, אבל השולח לא מקבל משוב."),
      o(
        "להוסיף שלושה שדות: sequence number, ack וגודל חלון קבלה",
        false,
        "חלון הקבלה משמש לבקרת זרימה (flow control) ולא לאמינות. הדרישה היא רק אמינות, ולכן זו לא התשובה ה'מתאימה ביותר'.",
      ),
      o("להוסיף רק גודל חלון קבלה", false, "גודל החלון לבדו לא נותן אמינות בכלל."),
      o(
        "להוסיף שני שדות: sequence number ו-ack",
        true,
        "נכון. זה המינימום לאמינות, כמו ב-rdt: מספר סידורי כדי לזהות חבילות וכפילויות, ו-ACK כדי שהשולח יידע מה הגיע (ובעזרת טיימר ישלח מחדש). checksum כבר קיים ב-UDP.",
      ),
      o("להוסיף רק ack", false, "בלי מספר סידורי אי אפשר לדעת על איזו חבילה ה-ACK, ואי אפשר לזהות כפילויות (ה-'fatal flaw' מההרצאה)."),
    ],
    explanation:
      "אמינות = זיהוי שגיאות (checksum, כבר קיים ב-UDP) + משוב (ACK) + מספור (seq#, נגד כפילויות) + טיימר לשידור חוזר. חלון קבלה שייך לבקרת זרימה, ולא היה חלק מהדרישה.",
  },
  {
    id: "ex9",
    topic: "transport",
    source: "exam2026",
    prompt:
      "בתרגיל בית 2 הלקוח שלח את אותה בקשה N פעמים בשני מצבים (חיבור מתמשך ולא מתמשך) והשווה את זמני ה-RTT. אם הייתם מעבירים את התרגיל לעבוד מעל UDP במקום TCP, מה היה משתנה בתשובה לגבי ה-RTT בין המצבים?",
    options: [
      o(
        "לחבילות יהיה RTT זהה בכל המצבים",
        true,
        "נכון. ב-TCP, במצב לא מתמשך פותחים חיבור חדש (three-way handshake) לכל בקשה, וזה מוסיף RTT. ב-UDP אין חיבור ואין handshake, ולכן אין הבדל בין המצבים.",
      ),
      o("לא תהיה אפשרות לחשב את ה-RTT בגלל שזה UDP", false, "RTT נמדד באפליקציה: מודדים זמן לפני sendto ואחרי recvfrom. זה עובד בכל פרוטוקול."),
      o("לחבילות שעוברות בחיבור לא מתמשך יהיה RTT גדול יותר", false, "זה היה נכון ב-TCP בגלל ה-handshake. ב-UDP אין חיבור שצריך לפתוח."),
      o("לחבילות שעוברות בחיבור מתמשך יהיה RTT גדול יותר", false, "גם ב-TCP זה לא נכון, ובוודאי לא ב-UDP."),
    ],
    explanation:
      "ההבדל בין persistent ל-non-persistent נובע רק מעלות פתיחת חיבור TCP (בערך 1 RTT). UDP הוא connectionless, ולכן המושג 'חיבור מתמשך' לא רלוונטי לו.",
  },
  {
    id: "ex10",
    topic: "dns",
    source: "exam2026",
    prompt: "ה-Local Name Server:",
    options: [
      o("מנוהל על ידי ספק האינטרנט (ISP) שמחוברים אליו", true, "נכון. לכל ISP (ביתי, חברה, אוניברסיטה) יש שרת מקומי, שנקרא גם default name server. השאילתה של המחשב נשלחת אליו קודם."),
      o("מנוהל על ידי ארגון האינטרנט העולמי", false, "ארגונים כמו ICANN אחראים על שרתי השורש, לא על השרת המקומי."),
      o("מנוהל על ידי נתבי ה-core באינטרנט", false, "נתבים לא מריצים DNS. DNS הוא אפליקציה שרצה בקצה הרשת (edge)."),
      o("מנוהל על ידי החברה שלגביה הוא יכול לספק תשובות סמכותיות", false, "זו ההגדרה של שרת Authoritative, למשל השרת של amazon.com על amazon.com."),
      o("מנוהל על ידי ה-Core DNS Servers", false, "אין דבר כזה. ההיררכיה היא Root, TLD, Authoritative, והשרת המקומי בכלל לא שייך לה (does not strictly belong to hierarchy)."),
    ],
    explanation:
      "4 סוגי שרתים: Root (13 שמות לוגיים, anycast), TLD (com/org/il), Authoritative (הרשומות של הארגון), Local (של ה-ISP, עם מטמון, משמש כ-proxy לשאילתות).",
  },
  {
    id: "ex11",
    topic: "delays",
    source: "exam2026",
    prompt:
      "חבילה עוברת בין שני מחשבים המחוברים בלינק ישיר באורך 4000 km. גודל החבילה 1024B ורוחב הפס 80 Mbps. Propagation delay factor = 10 μsec/km, Protocol processing time = 60 μsec. ניתן להזניח השהיות בתורים. כמה זמן לוקח לביט אחד להגיע ממחשב A למחשב B?",
    options: [
      o("40,000 μsec", true, "נכון. ביט אחד → רק propagation: 10 μsec/km × 4000 km = 40,000 μsec."),
      o("102.4 μsec", false, "זה זמן השידור (transmission) של כל החבילה: 1024×8 / 80M. לביט בודד זה לא רלוונטי."),
      o("10 μsec", false, "זה הפקטור לקילומטר אחד, ושכחו להכפיל במרחק."),
      o("40,060 μsec", false, "הוסיפו processing. השאלה היא כמה זמן הביט נמצא על הלינק, כלומר propagation בלבד."),
    ],
    explainDiagram: {
      kind: "delay",
      procA: "proc 60μs",
      trans: "L/R 102.4μs",
      prop: "prop 40,000μs",
      procB: "proc 60μs",
      caption: "'ביט אחד' = הקו המקווקו: זמן ההתפשטות בלבד",
    },
    explanation: "'ביט אחד' = propagation בלבד = מרחק × delay factor. 'כל החבילה על הלינק' = L/R.",
  },
  {
    id: "ex12",
    topic: "transport",
    source: "exam2026",
    prompt:
      "כמה לקוחות TCP, שכבר מחוברים לשרת, שולחים סגמנטים לאותו מספר פורט באותו שרת. האם הסגמנטים האלו תמיד יגיעו לאותו מקום (סוקט) אצל השרת?",
    options: [
      o(
        "לא נכון",
        true,
        "נכון. סוקט TCP מזוהה לפי 4-tuple (src IP, src port, dst IP, dst port). לכל לקוח מחובר יש סוקט נפרד (מה ש-accept() מחזיר), ולכן הסגמנטים מגיעים לסוקטים שונים.",
      ),
      o("נכון", false, "זה נכון ב-UDP, שבו הסוקט מזוהה רק לפי dst IP ו-dst port. ב-TCP לא."),
      o("נכון רק אם מריצים אותם באותו מחשב", false, "גם באותו מחשב, ללקוחות שונים יהיו פורטי מקור שונים, ולכן 4-tuple שונה וסוקט שונה."),
      o("נכון רק אם נמצאים תחת אותה תת-רשת", false, "תת-רשת לא קשורה ל-demultiplexing."),
    ],
    explanation:
      "UDP: הסוקט מזוהה לפי (dst IP, dst port), ולכן כל הלקוחות מגיעים לאותו סוקט. TCP: הסוקט מזוהה לפי 4-tuple, ולכן לכל חיבור יש סוקט משלו. שרת Web מחזיק סוקט נפרד לכל לקוח (וב-HTTP לא מתמשך, סוקט לכל בקשה).",
  },
  {
    id: "ex13",
    topic: "delays",
    source: "exam2026",
    prompt:
      "חבילה עוברת בין שני מחשבים המחוברים בלינק ישיר באורך 4000 km. גודל החבילה 1024B, רוחב הפס 80 Mbps, Protocol processing time = 60 μsec, Propagation delay factor = 10 μsec/km. ניתן להזניח השהיות בתורים. מה סה\"כ העיכוב מרגע תחילת הטיפול של מחשב A בחבילה עד שהיא מגיעה כולה למחשב B?",
    options: [
      o("40,162.4 μsec", false, "processing נספר רק פעם אחת. בשיטת ציר הזמן מהתרגול, processing נספר בשני הצדדים."),
      o("40,102.4 μsec", false, "שכחו את ה-processing לגמרי."),
      o(
        "40,222.4 μsec",
        true,
        "נכון. 60 (proc A) + 102.4 (L/R = 8192 bits / 80 Mbps) + 40,000 (prop) + 60 (proc B) = 40,222.4 μsec.",
      ),
      o("162.4 μsec", false, "שכחו את ה-propagation, שהוא כמעט כל העיכוב בלינק ארוך."),
    ],
    explainDiagram: {
      kind: "delay",
      procA: "proc 60",
      trans: "L/R 102.4",
      prop: "prop 40,000",
      procB: "proc 60",
      total: "total = 60 + 102.4 + 40,000 + 60 = 40,222.4 μs",
      caption: "שיטת ציר הזמן מתרגול 1",
    },
    explanation:
      "שיטת ציר הזמן (תרגול 1): d = proc(A) + trans (L/R) + prop (d×factor) + proc(B). המרה: 1024B × 8 = 8192 bits. 8192 / 80 = 102.4 μsec (Mbps = ביטים למיקרו-שנייה).",
  },
  {
    id: "ex14",
    topic: "tcp",
    source: "exam2026",
    prompt: "מצורף חלק משיחה בין לקוח לשרת. בהנחה שחבילה 1007 הלכה לאיבוד וחבילה 1008 התקבלה תקין, מה ה-Ack המתאים בסגמנט של חבילה 1009?",
    images: [{ src: "/exam/q14-capture.png", alt: "Wireshark capture frames 1007-1009", caption: "הלכידה כפי שהופיעה בבוחן (ערכי 1009 מוסתרים)" }],
    explainDiagram: {
      kind: "seq",
      left: "Client 132.74.121.223",
      right: "Server 146.190.62.39",
      steps: [
        { dir: "L", label: "#1007 Seq=19171 Len=1460", lost: true },
        { dir: "L", label: "#1008 Seq=20631 Len=1460" },
        { note: "out of order! still missing byte 19171", side: "L", tone: "bad" },
        { dir: "R", label: "#1009 ACK=19171 (dup ACK)" },
      ],
      caption: "1008 נשמרת ב-buffer, אבל ה-ACK לא יכול 'לקפוץ' מעל החור",
    },
    table: {
      headers: ["No.", "Source", "Destination", "Proto", "Len", "Info"],
      rows: [
        ["1007", "146.190.62.39", "132.74.121.223", "TCP", "1514", "80 → 59160 [ACK] Seq=19171 Ack=1131 Win=64128 Len=1460"],
        ["1008", "146.190.62.39", "132.74.121.223", "TCP", "1514", "80 → 59160 [PSH, ACK] Seq=20631 Ack=1131 Win=64128 Len=1460"],
        ["1009", "132.74.121.223", "146.190.62.39", "TCP", "54", "59160 → 80 [ACK] Seq=■■■ Ack=■■■ Win=65280 Len=0"],
      ],
    },
    options: [
      o("20631", false, "זה היה ה-ACK אם 1007 הייתה מגיעה (19171 + 1460). אבל 1007 אבדה."),
      o("1131", false, "זה ה-Seq של הלקוח בחבילה 1009 (מה שהשרת מצפה לקבל ממנו), ולא ה-ACK."),
      o("22091", false, "20631 + 1460: זה ה-ACK אם שתי החבילות היו מגיעות. ACK ב-TCP הוא מצטבר ולא יכול 'לדלג' על החור."),
      o(
        "19171",
        true,
        "נכון. ה-ACK הוא הבית הבא שמצופה לפי הסדר. 1007 (בתים 19171 עד 20630) לא הגיעה, ולכן גם אחרי ש-1008 מגיעה המקבל שולח duplicate ACK = 19171.",
      ),
    ],
    explanation:
      "Ack = מספר הבית הבא שהמקבל מצפה לו (cumulative). חבילה שהגיעה שלא לפי הסדר → ACK כפול על החור. Seq של הלקוח = ה-Ack שהשרת שלח (1131).",
  },
];
