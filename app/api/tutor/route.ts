import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ALL_QUESTIONS } from "@/lib/bank";
import { Question, TOPICS } from "@/lib/types";
import { COURSE_NOTES } from "@/lib/courseNotes";
import { readdir } from "node:fs/promises";
import { EXAM_2026 } from "@/lib/bank";

// Full text of the lectures, tirgulim, homework, code and the sample quiz (extracted from "Lectures and Practices/").
let knowledgeCache: string | null = null;
async function courseKnowledge(): Promise<string> {
  if (knowledgeCache) return knowledgeCache;
  const dir = path.join(process.cwd(), "knowledge");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".txt")).sort();
  const docs = await Promise.all(
    files.map(async (f) => `<document name="${f.replace(/\.txt$/, "")}">\n${(await readFile(path.join(dir, f), "utf8")).trim()}\n</document>`),
  );
  const key = EXAM_2026.map(
    (q, i) =>
      `שאלה ${i + 1}: ${q.prompt}\nתשובה נכונה: ${q.options.filter((o) => o.correct).map((o) => o.text).join(" | ")}\nהסבר: ${q.explanation}`,
  ).join("\n\n");
  knowledgeCache = `${docs.join("\n\n")}\n\n<document name="פתרון הבוחן לדוגמה (נבדק מול חומר הקורס)">\n${key}\n</document>`;
  return knowledgeCache;
}

export const runtime = "nodejs";
export const maxDuration = 60;

// light per-IP limit so a shared deployment can't drain the API budget (per server instance)
const hits = new Map<string, number[]>();
const LIMIT = Number(process.env.TUTOR_RATE_PER_HOUR || 40);
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

type ChatTurn = { role: "user" | "assistant"; content: string };
type Body = { questionId?: string; messages: ChatTurn[]; answerVisible?: boolean; picked?: number[] };

/**
 * The answer is revealed only when the student explicitly asks for it in the chat
 * ("תגלה לי את התשובה", "מה התשובה הנכונה?", "איזו אופציה נכונה?", "give me the answer").
 * Until then the model never receives the answer key, so it cannot leak it.
 */
const ASKS_FOR_ANSWER = [
  /(תגלה|גלה|תגיד|תגידי|תן|תני|תכתוב|תראה|אמור|תאמר|תחשוף)\s+(לי\s+)?(את\s+)?ה?(תשובה|פתרון)/,
  /מה\s+(ה)?(תשובה|פתרון)/,
  /(איזו|איזה|מה)\s+(תשובה|אופציה|אפשרות|סעיף|מספר)\s+(ה)?נכונ/,
  /(איזו|איזה)\s+(מהן|מהם|מהאופציות|מהתשובות)\s+(ה)?נכונ/,
  /(give|tell|show)\s+me\s+the\s+(answer|solution)|what('?s| is)\s+the\s+(correct\s+)?answer|reveal/i,
];
const asksForAnswer = (text: string) => ASKS_FOR_ANSWER.some((re) => re.test(text));

const MODEL = process.env.TUTOR_MODEL || "claude-opus-5-5";

const BASE_RULES = `אתה מתרגל בקורס "תקשורת נתונים" (אוניברסיטת חיפה, ספר Kurose & Ross, מהדורה 7). סטודנט מתכונן לבוחן ומתרגל שאלה אמריקאית, ושואל אותך עליה.

עקרונות הקורס שחשוב לשמור עליהם:
- עיכוב כולל = proc(A) + L/R + prop + proc(B) (שיטת ציר הזמן מתרגול 1, עיבוד בשני הצדדים).
- HTTP 1.0 לא מתמשך = 2 RTT לכל אובייקט. HTTP 1.1 מתמשך = 2 RTT ל-HTML ו-RTT אחד לכל אובייקט נוסף.
- Delayed ACK עד 200ms. 3 ACK כפולים: ssthresh=cwnd/2, cwnd=ssthresh. Timeout: ssthresh=cwnd/2, cwnd=1 MSS.
- ב-GBN המקבל זורק חבילות שלא לפי הסדר. ACK ב-TCP הוא מצטבר: מספר הבית הבא שמצופה.

אל תשתמש באימוג'י בכלל.
סגנון: ענה בעברית, קצר וברור (עד כ-150 מילים אלא אם ביקשו יותר). מונחים טכניים אפשר להשאיר באנגלית. אפשר להשתמש ב-markdown פשוט (מודגש, רשימות, \`קוד\`).`;

const ASSISTANT_RULES = `אתה עוזר הלימוד של הקורס "תקשורת נתונים" (214.2900, אוניברסיטת חיפה). הסטודנט מתכונן לבוחן 1 ויכול לשאול אותך כל שאלה על הקורס: הסבר מושגים, פתרון תרגילים, השוואות, טיפים לבוחן, ניסוח דף עזר, או שאלות תרגול שתכתוב לו.

יש לך את הטקסט המלא של חומרי הקורס: ההרצאות, התרגולים (Tirgul), תרגיל בית 1, מצגת SWS, קבצי הקוד מהתרגול, הסילבוס, ובוחן לדוגמה עם הפתרון. תמיד קרא לו "הבוחן לדוגמה". אל תציין שנה או מועד שבו נערך, ואל תכתוב שהוא בוחן משנה קודמת. כשעונים על שאלה, הסתמך עליהם וציין את המקור, למשל "לפי תרגול 3" או "בהרצאת שכבת התעבורה". הטקסט הוצא אוטומטית מקבצי PDF, ולכן חלקים מהשקפים יכולים להיות חסרים או משובשים. אם אתה לא בטוח, תגיד את זה.
השתמש גם בסיכום הקורס שבהמשך. לגבי מוסכמות של הקורס (למשל חישוב השהיה) הסיכום קובע. אם משהו לא בחומר של בוחן 1, תגיד את זה. אם נשאלת על פרט מנהלי שלא מופיע בסיכום, אל תמציא.
כשהסטודנט מבקש שאלת תרגול, כתוב אותה בסגנון הבוחן (עברית, אופציות ממוספרות) ואל תגלה את התשובה עד שהוא עונה או מבקש.
אל תשתמש באימוג'י בכלל.
סגנון: עברית, ברור ותמציתי. מונחים טכניים באנגלית. markdown פשוט (מודגש, רשימות, \`קוד\`, בלוקי קוד).

<course_notes>
${COURSE_NOTES}
</course_notes>`;


const VISUALS = `
## טבלאות ושרטוטים (הממשק מצייר אותם באמת)
- **טבלה:** כתוב טבלת markdown רגילה עם שורת כותרת ושורת מפריד (| a | b |, ואז |---|---|). היא מוצגת כטבלה אמיתית. השתמש בה להשוואות ולנתונים.
- **תרשים רשת:** כתוב בלוק \`\`\`diagram עם JSON תקין בלבד (בלי הערות), באחד מארבעת הסוגים. הטקסט בתוך התרשים באנגלית, קצר (עד כ-28 תווים לתווית):
  1. תרשים זמנים בין שני צדדים:
     {"kind":"seq","left":"client","right":"server","steps":[{"dir":"R","label":"SYN Seq=100"},{"dir":"L","label":"SYN,ACK Seq=300 Ack=101"},{"dir":"R","label":"pkt2","lost":true},{"note":"timeout → retransmit","side":"L","tone":"bad"}],"caption":"כיתוב בעברית"}
     dir: R = משמאל לימין, L = מימין לשמאל. lost: true מצייר ✗. dim: true לחץ אפור. note עם side L/R/C ו-tone bad/good/muted.
  2. עץ (היררכיית DNS וכו'): {"kind":"tree","nodes":[{"id":"root","label":"Root","x":210,"y":30},{"id":"com","label":"com TLD","x":110,"y":110,"tone":"accent"}],"edges":[["root","com"]]}. x בין 40 ל-400, y במרווחים של 80, tone: accent/good/muted.
  3. ציר השהיה (proc, L/R, prop, proc): {"kind":"delay","procA":"proc 50","trans":"L/R 120","prop":"prop 15,000","procB":"proc 50","total":"total = 15,220 μs"}
  4. גרף cwnd לפי סבבים: {"kind":"cwnd","values":[1,2,4,8,16,17,18,9,10],"thresholds":[{"from":1,"to":7,"value":16}]}
- **שרטוט חופשי:** לכל דבר אחר (כותרת של חבילה עם שדות, טופולוגיה, encapsulation, חלון הזזה) כתוב בלוק \`\`\`svg עם SVG שלם ותקין: viewBox, רוחב עד 600, צבעים מפורשים (רקע לבן, קווים #0e1a2b, הדגשה #0b63ce, שגיאה #c2362b), font-family="sans-serif", וטקסט באנגלית או בעברית עם direction="rtl".
- כשמשהו נראה טוב יותר כשרטוט או כטבלה, תשרטט. אל תצייר תרשימים ב-ASCII.
`;

const NO_ANSWER_RULES = `
חוק חשוב ביותר: אסור לך לחשוף את התשובה הנכונה.
- אל תגיד איזו אופציה נכונה או שגויה, אל תפסול אופציות, ואל תאשר או תכחיש ניחוש של הסטודנט ("האם זה 3?").
- אל תחשב את התוצאה הסופית של שאלת חישוב. אפשר להסביר את הנוסחה ואת השלבים ולתת לסטודנט לחשב בעצמו.
- מה כן מותר: להסביר מה השאלה שואלת, להסביר את המושגים, להפנות לנתון החשוב בשאלה או בצילום, לתת רמז או שאלה מכוונת, ולתת דוגמה דומה עם מספרים אחרים.
- אם הסטודנט רוצה את התשובה, הוא יכול פשוט לבקש אותה במפורש בצ'אט (למשל "תגלה לי את התשובה"). אל תציע את זה בכל הודעה, רק אם הוא נראה תקוע או שואל איך מקבלים את התשובה.
אין לך מפתח תשובות, ואל תנסה לנחש אותו בשבילו.`;

const REVEAL_RULES = `
הסטודנט ביקש במפורש לראות את התשובה, ולכן מותר לחשוף אותה. מפתח התשובות מצורף. הסבר למה התשובה הנכונה נכונה, ולמה כל אחת מהאחרות שגויה, בקצרה. אם הסטודנט סימן תשובה, התייחס לטעות הספציפית שלו.`;

function describeQuestion(q: Question, withKey: boolean, picked?: number[]): string {
  const parts: string[] = [];
  parts.push(`נושא: ${TOPICS[q.topic]}${q.source === "exam2026" ? " (שאלה מהבוחן לדוגמה)" : ""}`);
  parts.push(`סוג: ${q.multi ? "רב-ברירה (אפשר כמה תשובות נכונות, סימון שגוי מוריד ניקוד)" : "בחירה יחידה"}`);
  parts.push(`השאלה:\n${q.prompt}`);
  if (q.pre) parts.push(`נתונים/צילום (תמליל):\n${q.pre}`);
  if (q.code) parts.push(`קוד:\n${q.code}`);
  if (q.table) parts.push(`לכידת Wireshark:\n${[q.table.headers.join(" | "), ...q.table.rows.map((r) => r.join(" | "))].join("\n")}`);
  if (q.diagram) parts.push(`תרשים שמוצג לסטודנט (JSON):\n${JSON.stringify(q.diagram)}`);
  parts.push(`האופציות:\n${q.options.map((op, i) => `${i + 1}. ${op.text}`).join("\n")}`);
  if (picked?.length) parts.push(`הסטודנט סימן כרגע: ${picked.map((i) => i + 1).join(", ")}`);
  if (withKey) {
    parts.push(
      `מפתח תשובות:\n${q.options.map((op, i) => `${i + 1}. ${op.correct ? "נכון" : "שגוי"}: ${op.why}`).join("\n")}\nעיקרון: ${q.explanation}`,
    );
  }
  return parts.join("\n\n");
}

async function imageBlocks(q: Question): Promise<Anthropic.ImageBlockParam[]> {
  const out: Anthropic.ImageBlockParam[] = [];
  for (const img of q.images ?? []) {
    try {
      const data = await readFile(path.join(process.cwd(), "public", img.src));
      out.push({ type: "image", source: { type: "base64", media_type: "image/png", data: data.toString("base64") } });
    } catch {
      /* image missing: the text transcript still covers it */
    }
  }
  return out;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "חסר מפתח API. הוסיפו ANTHROPIC_API_KEY לקובץ ‎.env.local והפעילו מחדש את השרת." }, { status: 500 });
  }
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (rateLimited(ip)) {
    return Response.json({ error: "הגעת למכסת השאלות לשעה הקרובה. נסו שוב מאוחר יותר." }, { status: 429 });
  }
  const body = (await req.json()) as Body;
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }
  const client = new Anthropic();

  // ── general course assistant (no question attached) ──
  if (!body.questionId) {
    const stream = client.beta.messages.stream({
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      model: MODEL,
      max_tokens: 8000,
      // course notes are identical on every call → cached
      // rules + full course materials are identical on every call → cached prefix
      system: [
        { type: "text", text: ASSISTANT_RULES + VISUALS },
        { type: "text", text: `<course_materials>\n${await courseKnowledge()}\n</course_materials>`, cache_control: { type: "ephemeral", ttl: "1h" } },
      ],
      output_config: { effort: "medium" },
      messages: body.messages.slice(-30).map((m) => ({ role: m.role, content: m.content })),
    });
    return streamText(stream);
  }

  const q = ALL_QUESTIONS.find((x) => x.id === body.questionId);
  if (!q) return Response.json({ error: "שאלה לא נמצאה" }, { status: 400 });
  const reveal = !!body.answerVisible || body.messages.some((m) => m.role === "user" && asksForAnswer(m.content));

  // Question context goes in a first user turn (with the screenshots), then the chat.
  const context: Anthropic.MessageParam = {
    role: "user",
    content: [
      ...(await imageBlocks(q)),
      { type: "text", text: `זו השאלה שהסטודנט עובד עליה:\n\n${describeQuestion(q, reveal, body.picked)}` },
    ],
  };
  const history: Anthropic.MessageParam[] = body.messages.slice(-20).map((m) => ({ role: m.role, content: m.content }));
  // first chat turn is the student's; merge context into it so roles alternate
  const first = history[0];
  const messages: Anthropic.MessageParam[] =
    first?.role === "user"
      ? [{ role: "user", content: [...(context.content as Anthropic.ContentBlockParam[]), { type: "text", text: `\n\nהסטודנט: ${first.content}` }] }, ...history.slice(1)]
      : [context, ...history];

  // server-side fallback: if the model declines (safety classifier), the API re-runs on a fallback model
  const stream = client.beta.messages.stream({
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    model: MODEL,
    max_tokens: 4000,
    system: BASE_RULES + VISUALS + (reveal ? REVEAL_RULES : NO_ANSWER_RULES) + `\n\n<course_notes>\n${COURSE_NOTES}\n</course_notes>`,
    output_config: { effort: "medium" },
    messages,
  });

  return streamText(stream);
}

type TutorStream = ReturnType<Anthropic["beta"]["messages"]["stream"]>;

function streamText(stream: TutorStream): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode("\n\n(המודל סירב לענות על הבקשה הזו.)"));
        if (final.stop_reason === "max_tokens") controller.enqueue(encoder.encode("\n\n(התשובה נקטעה.)"));
      } catch (err) {
        let msg = "שגיאה בחיבור ל-Claude.";
        if (err instanceof Anthropic.AuthenticationError) msg = "מפתח ה-API לא תקין. בדקו את ANTHROPIC_API_KEY בקובץ ‎.env.local.";
        else if (err instanceof Anthropic.RateLimitError) msg = "יותר מדי בקשות. נסו שוב בעוד רגע.";
        else if (err instanceof Anthropic.APIError) msg = `שגיאת API (${err.status}): ${err.message}`;
        controller.enqueue(encoder.encode(`\n\nשגיאה: ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
