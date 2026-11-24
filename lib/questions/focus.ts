/**
 * What to mark in each question prompt.
 * - ask:  what the question requires (the quantity, the item, true vs. false)
 * - cond: the conditions that change the answer
 * Every phrase must appear verbatim in the prompt.
 */
export type Focus = { ask: string[]; cond?: string[] };

export const FOCUS: Record<string, Focus> = {
  // sample quiz
  ex1: { ask: ["מה עשוי להסביר"], cond: ["לא עברה אף חבילת DNS"] },
  ex2: { ask: ["תוצאת הפקודה"] },
  ex3: { ask: ["נכונות"], cond: ["If-Modified-Since"] },
  ex4: { ask: ["מאפיין את ה-Multiplexing"] },
  ex5: { ask: ["ממה נובעת המגבלה"], cond: ["והלקוח מעכב את ה-ACK"] },
  ex6: { ask: ["הצירוף הנכון"], cond: ["שלא לפי הסדר"] },
  ex7: { ask: ["שייך ל"] },
  ex8: { ask: ["מה מתאים ביותר"], cond: ["אמינה בלי בקשת קישור"] },
  ex9: { ask: ["מה היה משתנה"], cond: ["מעל UDP במקום TCP"] },
  ex11: { ask: ["לביט אחד"], cond: ["ניתן להזניח השהיות בתורים"] },
  ex12: { ask: ["תמיד יגיעו לאותו מקום"], cond: ["שכבר מחוברים"] },
  ex13: { ask: ['סה"כ העיכוב'], cond: ["מרגע תחילת הטיפול של מחשב A", "עד שהיא מגיעה כולה"] },
  ex14: { ask: ["ה-Ack המתאים"], cond: ["1007 הלכה לאיבוד", "1008 התקבלה תקין", "בסגמנט של חבילה 1009"] },

  // delays
  d1: { ask: ['סה"כ העיכוב'], cond: ["מטופלת במלואה"] },
  d2: { ask: ["לדחוף חבילה"] },
  d3: { ask: ["נכונות"] },
  d4: { ask: ["כמה זמן עובר"], cond: ["עד שכל השיירה עומדת בעמדה השנייה"] },
  d5: { ask: ["הזמן המינימלי"], cond: ["100 MB"] },
  d6: { ask: ["הרכיב הדומיננטי"] },

  // application layer
  a1: { ask: ["Client-Server"], cond: ["בניגוד ל-P2P"] },
  a2: { ask: ["שם יחידת הנתונים"], cond: ["לפי הסדר"] },
  a3: { ask: ["הכי חשובה"] },
  a4: { ask: ["שני נתונים"] },

  // HTTP
  h1: { ask: ["כמה זמן לוקחת טעינת הדף"], cond: ["HTTP 1.0", "ללא חיבורים מקבילים"] },
  h2: { ask: ["כמה חיבורי TCP"], cond: ["HTTP 1.0"] },
  h3: { ask: ["קוד מצב"], cond: ["בלי הרשאה"] },
  h4: { ask: ["stateless"], cond: ["שלא משתמשים ב-cookies"] },
  h5: { ask: ["נכונות"] },
  h6: { ask: ["איזו גרסת HTTP"], cond: ["מעל UDP"] },
  h7: { ask: ["פורט 3372"] },
  h8: { ask: ["מה תראו"], cond: ["HTTPS"] },
  h9: { ask: ["נכונות"], cond: ["304 Not Modified"] },
  w1: { ask: ["נכונות"], cond: ["על סמך מה שרואים בצילום"] },
  w2: { ask: ["איזה ACK ישלח הלקוח"], cond: ["תקין ולפי הסדר"] },
  w3: { ask: ["למה הזמן הזה שווה"], cond: ["התשובה השנייה על החיבור"] },

  // cookies and caching
  c1: { ask: ["ה-cookie עצמו"] },
  c2: { ask: ["לקוח או שרת"] },
  c3: { ask: ["יגיעו לשרתי המקור"], cond: ["hit rate של 30%"] },
  c4: { ask: ["ההבדל"] },

  // DNS
  n1: { ask: ["נכונות"] },
  n2: { ask: ["מה יחזיר שרת ה-TLD"] },
  n3: { ask: ["סוג רשומה"] },
  n4: { ask: ["סדר השרתים"], cond: ["איטרטיבית", "המטמון ריק"] },
  n5: { ask: ["מה קובע"], cond: ["יום אחרי"] },
  n6: { ask: ["לא מרוכז"] },
  n7: { ask: ["מתי DNS משתמש ב-TCP"], cond: ["עדיין בפורט 53"] },
  n8: { ask: ["ההבדל"] },
  n9: { ask: ["Non-authoritative answer"] },
  n10: { ask: ["שמות לוגיים"] },

  // transport
  t1: { ask: ["נכונות"] },
  t2: { ask: ["סוקט TCP"] },
  t3: { ask: ["סוקט UDP"] },
  t4: { ask: ["Internet checksum"] },
  t5: { ask: ["מה יקרה בשרת"], cond: ["עם IP שונה", "פורט מקור 9157"] },
  t6: { ask: ["לאן יגיעו"], cond: ["IP ופורט מקור שונים"] },
  t7: { ask: ["נכונות"] },
  t8: { ask: ["פרוטוקול התעבורה"] },

  // reliable data transfer
  r1: { ask: ["ה-utilization של השולח"], cond: ["בקירוב"] },
  r2: { ask: ["מספר סידורי"] },
  r3: { ask: ["אילו חבילות ישודרו מחדש"], cond: ["Go-Back-N"] },
  r4: { ask: ["אילו ACKs ישלח המקבל"], cond: ["לפי הסדר"] },

  // TCP
  p1: { ask: ["מה ה-Ack"], cond: ["מיד אחרי קבלת 503"] },
  p2: { ask: ["ה-Seq וה-Ack"], cond: ["בסגמנט השלישי"] },
  p3: { ask: ["three-way handshake ולא ב-two-way"] },
  p4: { ask: ["EstimatedRTT החדש"] },
  p5: { ask: ["ה-TimeoutInterval"] },
  p6: { ask: ["מה הוא יעשה"], cond: ["כבר אושרו"] },
  p7: { ask: ["מה יקרה"] },
  p8: { ask: ["נכונות"] },
  p9: { ask: ["ה-Seq וה-ACK בתשובה של B"] },
  p10: { ask: ["ה-RcvWindow שהמקבל יפרסם"] },
  p11: { ask: ["מה הפתרון"], cond: ["בצד המקבל"] },
  p12: { ask: ["איזה אחוז מהחבילה הוא תקורה"] },
  p13: { ask: ["מה קורה"], cond: ["RcvWindow = 0"] },
  p14: { ask: ["איזה צד"] },

  // congestion control
  g1: { ask: ["הערכים החדשים"], cond: ["3 Duplicate ACKs"] },
  g2: { ask: ["הערכים החדשים"], cond: ["timeout"] },
  g3: { ask: ["ה-CongWin אחרי 3 RTTs"], cond: ["שאין אובדן"] },
  g4: { ask: ["כמה בתים לכל היותר"], cond: ["בלי ACK"] },
  g5: { ask: ["ה-throughput הממוצע"], cond: ["בלי slow start"] },
  g6: { ask: ["ה-throughput שהיא תקבל"], cond: ["11 חיבורי TCP"] },
  g7: { ask: ["נכונות"] },
  g8: { ask: ["נכונות"] },
  g9: { ask: ["ערך ה-ssthresh בסבב 13"] },

  // sockets
  s1: { ask: ["שייך ל"] },
  s2: { ask: ["מחזירה"] },
  s3: { ask: ["הסדר הנכון"], cond: ["בשרת TCP"] },
  s4: { ask: ["נכונות"] },
  s5: { ask: ["לא משתמש ב-accept()"] },
  s6: { ask: ["למה"], cond: ["על אותו מחשב"] },
};
