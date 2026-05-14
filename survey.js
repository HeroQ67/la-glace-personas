// Survey Engine — simulate persona panel responses + aggregate distribution
// ใช้ Claude API + (optional) web_search tool เพื่อให้ persona ตอบตามเทรนด์ปัจจุบัน
//
// Storage keys:
//   la_glace_api_key       — Claude API key
//   la_glace_current_trends — User-input current beauty trends
//   la_glace_survey_history — past surveys (for re-load)

window.SurveyEngine = (function() {

  const STORAGE = {
    apiKey: "la_glace_api_key",
    trends: "la_glace_current_trends",
    trendsUpdatedAt: "la_glace_trends_updated_at",
    history: "la_glace_survey_history"
  };

  const DEFAULT_TRENDS = `- TikTok Shop ครองตลาด beauty Thailand (>80% market share for young women)
- Hybrid Beauty (skincare-infused makeup) กำลังมาแรง — โดยเฉพาะ blurring tint, glow concealer
- Latte Makeup / Mocha Mousse tone — Pantone 2025 ยังขายดี
- Underground / "indie sleaze" aesthetic ยังครองใจ Gen Z
- K-Beauty premiumization (Romand, rom&nd, peripera) ตั้งราคาสูงขึ้น
- PM 2.5 / heat ไทย ทำให้ long-wear + breathable formula สำคัญมาก
- Affiliate Marketing บน TikTok = revenue driver หลักของแบรนด์ Thai indie
- Sustainability / Refill packaging เริ่มถูกพูดถึงมากขึ้น
- AI-generated content / virtual influencers เริ่มเข้ามา`;

  // ==============================================================
  // CONFIG GETTERS / SETTERS
  // ==============================================================
  function getApiKey() {
    return localStorage.getItem(STORAGE.apiKey) || "";
  }

  function setApiKey(key) {
    if (key) localStorage.setItem(STORAGE.apiKey, key);
    else localStorage.removeItem(STORAGE.apiKey);
  }

  function getCurrentTrends() {
    return localStorage.getItem(STORAGE.trends) || DEFAULT_TRENDS;
  }

  function setCurrentTrends(text) {
    localStorage.setItem(STORAGE.trends, text);
    localStorage.setItem(STORAGE.trendsUpdatedAt, String(Date.now()));
  }

  function getTrendsUpdatedAt() {
    const ts = parseInt(localStorage.getItem(STORAGE.trendsUpdatedAt) || "0", 10);
    return ts || null;
  }

  function getTrendsAgeDays() {
    const ts = getTrendsUpdatedAt();
    if (!ts) return null;
    return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
  }

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE.history)) || []; }
    catch { return []; }
  }

  function saveHistory(list) {
    localStorage.setItem(STORAGE.history, JSON.stringify(list.slice(0, 30)));
  }

  // ==============================================================
  // PROMPT BUILDER
  // ==============================================================
  function buildSystemPrompt(opts) {
    const S = window.LA_GLACE_SURVEY;
    const trends = opts.currentTrends || getCurrentTrends();

    const trendsAge = getTrendsAgeDays();
    const trendsAgeNote = trendsAge != null
      ? `(อัพเดทล่าสุด ${trendsAge} วันที่แล้ว)`
      : "(ยังไม่มีการอัพเดท — ใช้ default)";

    return `คุณคือ AI ที่ทำหน้าที่จำลอง "Market Research Panel" สำหรับแบรนด์ LA GLACE (เครื่องสำอางไทย Underground Beauty)

# บทบาทของคุณ
จำลองคำตอบของกลุ่มลูกค้าจริง ${S.personas.length} คน (panel) เพื่อคาดการณ์พฤติกรรม / ความพึงพอใจ / การตอบสนองต่อแคมเปญ
คำตอบของคุณต้องสะท้อน "สัดส่วนความน่าจะเป็น" ของแต่ละ option — ไม่ใช่คำตอบเดียว

# Brand Context
${JSON.stringify(S.brand_context, null, 2)}

# 🔥 CURRENT PURCHASE-DECISION DRIVERS ${trendsAgeNote}
ข้อมูลด้านล่างคือเทรนด์/ปัจจัยที่กำลังขับเคลื่อน/ขัดขวางการซื้อในตลาดเครื่องสำอางไทย ณ สัปดาห์นี้:

${trends}

## วิธีใช้ trends กับการคาดการณ์ (สำคัญมาก)
แต่ละ persona ต้อง weight ข้อมูล trend ด้านบนเป็น **ปัจจัยหลัก** ในการตัดสินใจซื้อ:
- ปัจจัย [PUSH] → เพิ่มแนวโน้มซื้อ (โดยเฉพาะใน segment ที่ตรงกับ trigger)
- ปัจจัย [BLOCK] → ลดแนวโน้มซื้อ / เลื่อน / เปลี่ยนแบรนด์
- ปัจจัย [VIRAL] → เพิ่ม FOMO ในกลุ่ม Status Seeker + Influencer; กลุ่ม Strategic Pro อาจสงสัย
- ปัจจัย [SEASONAL] → เลือก SKU ที่ตรงสภาพอากาศ/เทศกาล
แต่ละ persona ตอบจาก lens ของ "ฉันเป็นใคร × trend นี้กระทบฉันยังไง × ตอนนี้ฉันมีงบ/อารมณ์แบบไหน"

# Panel Segments (4 กลุ่ม)
${S.buildSegmentSummary()}

# Full Persona Panel (${S.personas.length} คน)
${S.buildPanelSummary()}

# Research-Calibrated Priors (จากผลวิจัยจริง — ใช้ ground คำตอบให้สมจริง)
${JSON.stringify(S.research_priors, null, 2)}

# วิธีคิด
1. อ่านคำถาม + option (ถ้ามี)
2. สำหรับแต่ละ persona — คาดการณ์ว่าจะตอบยังไง โดยอิงกับ:
   - traits + emotion + segment ของเขา
   - Beauty trends ปัจจุบัน
   - Research priors (ถ้าคำถามใกล้เคียงกับข้อที่มี prior)
3. รวมผลเป็น distribution
4. สรุป insight + key reasons เป็น actionable insight

# Output Format — ตอบเป็น JSON เท่านั้น (ไม่มี text นอก JSON)
{
  "question_type": "multiple_choice | rating_1_5 | open_ended | yes_no | compound",
  "overall_distribution": {
    "option_label_1": 45,
    "option_label_2": 32,
    "...": "..."
  },
  "by_segment": {
    "strategic_pro":           { "option_label_1": 60, "option_label_2": 25 },
    "influencer_entrepreneur": { "option_label_1": 40, "option_label_2": 35 },
    "status_seeker":           { "option_label_1": 30, "option_label_2": 45 },
    "balanced_lifestyle":      { "option_label_1": 55, "option_label_2": 30 }
  },
  "secondary_analyses": [
    {
      "title": "ตัวอย่าง: Basket Composition (สำหรับยอด 690 บาท)",
      "subtitle": "อะไรที่ persona จะใส่ตะกร้าเพื่อให้ครบยอดโปร",
      "distribution": {
        "Ph Blush + Toner Pad + 1 Sachet (~698)": 35,
        "Toner Pad + Concealer + 1 Sachet (~708)": 22,
        "2× Toner Pad + 1 Sachet (~739)": 15,
        "Ph Blush + Lip ไอติม + 1 Sachet (~706)": 12,
        "อื่นๆ": 16
      },
      "by_segment": {
        "strategic_pro": { "...": 50 },
        "influencer_entrepreneur": { "...": 40 },
        "status_seeker": { "...": 30 },
        "balanced_lifestyle": { "...": 60 }
      }
    }
  ],
  "top_themes": [
    { "theme": "...", "weight_pct": 35, "segments": ["strategic_pro"], "sample_quote": "..." }
  ],
  "predicted_satisfaction_score": 3.8,
  "confidence": "high | medium | low",
  "key_insight": "1-2 ประโยคสรุปสิ่งที่แบรนด์ควรทำต่อ",
  "risks": ["ข้อกังวลที่อาจเกิดถ้าทำ campaign นี้จริง"],
  "opportunities": ["จุดที่ campaign นี้เปิดโอกาสให้แบรนด์"]
}

# กฎสำคัญ
- ทุก distribution ต้องรวมเป็น ~100 (อนุญาต ±2 จาก rounding)
- "predicted_satisfaction_score" ใช้กับคำถามเกี่ยวกับสินค้า/โปรโมชั่น (1-5); ถ้าคำถามไม่เข้าข่ายให้ return null
- sample_quote เป็นภาษาไทย — สะท้อนน้ำเสียงของ persona ในกลุ่มนั้น
- ถ้าคำถามเป็น "open_ended" ให้ใช้ themes แทน option labels ใน distribution
- **ถ้าคำถามมีหลายมิติ** (เช่น "จะซื้อไหม + ซื้ออะไร" / "พอใจไหม + ทำไม" / "เลือกอันไหน + ราคา OK ไหม") ให้ใส่ใน secondary_analyses (array) แต่ละ object เป็น 1 มิติเพิ่มเติม. **ห้ามละเลย dimension ใดๆ ในคำถาม**
- ถ้าคำถามเกี่ยวกับ basket / what to buy / จัด combo ใช้ product_catalog ใน brand_context จัด basket จริง พร้อมราคารวม
- ทุก response ต้อง valid JSON parsable — ไม่ใช้ comment, ไม่มี trailing comma, ไม่ใส่ markdown fence`;
  }

  function buildUserPrompt(question, options, questionType, context) {
    let prompt = `# คำถาม\n${question}\n\n`;
    prompt += `# Question Type\n${questionType}\n\n`;
    if (options && options.length) {
      prompt += `# Options (ถ้าเป็น multiple_choice)\n${options.map(o => `- ${o}`).join("\n")}\n\n`;
    }
    if (context) {
      prompt += `# Additional Context จากผู้ใช้\n${context}\n\n`;
    }
    prompt += `จำลอง panel และตอบเป็น JSON ตาม format ที่กำหนด`;
    return prompt;
  }

  // ==============================================================
  // CLAUDE API CALL
  // ==============================================================
  async function callClaude(opts) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("กรุณาตั้งค่า Claude API Key ก่อน (คลิก ⚙️ ที่ sidebar)");

    const systemPrompt = buildSystemPrompt(opts);
    const userPrompt = buildUserPrompt(opts.question, opts.options, opts.questionType, opts.context);

    const body = {
      model: opts.model || "claude-sonnet-4-6",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    };

    if (opts.useWebSearch) {
      body.tools = [{
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 3
      }];
    }

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`API ${resp.status}: ${errText}`);
    }

    const data = await resp.json();
    // Collect text blocks (web_search may return tool_use too — we only need text output)
    const textBlocks = (data.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");

    return { raw: textBlocks, usage: data.usage };
  }

  // ==============================================================
  // JSON EXTRACTION (handles markdown fences, prose, trailing commas)
  // ==============================================================
  function extractJson(text) {
    // 1) Try fenced block (```json or ```)
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try { return JSON.parse(fenceMatch[1]); } catch (e) {
        try { return JSON.parse(cleanJson(fenceMatch[1])); } catch (e2) { /* keep going */ }
      }
    }
    // 2) Try first balanced {…} block (handles JSON embedded in prose)
    const candidate = extractBalancedBraces(text);
    if (candidate) {
      try { return JSON.parse(candidate); } catch (e) {
        try { return JSON.parse(cleanJson(candidate)); } catch (e2) { /* keep going */ }
      }
    }
    // 3) Raw + cleaned
    try { return JSON.parse(text); } catch (e) {}
    try { return JSON.parse(cleanJson(text)); } catch (e) {}
    throw new Error("Could not parse JSON from response");
  }

  function cleanJson(s) {
    return s
      .replace(/,(\s*[}\]])/g, "$1")   // trailing commas
      .replace(/\bNaN\b/g, "null")
      .replace(/\bundefined\b/g, "null")
      .replace(/\/\/[^\n]*/g, "")       // // comments
      .replace(/\/\*[\s\S]*?\*\//g, ""); // /* */ comments
  }

  function extractBalancedBraces(text) {
    const first = text.indexOf("{");
    if (first < 0) return null;
    let depth = 0, inStr = false, esc = false;
    for (let i = first; i < text.length; i++) {
      const c = text[i];
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (c === "\\") { esc = true; continue; }
        if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') { inStr = true; continue; }
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) return text.slice(first, i + 1);
      }
    }
    return null;
  }

  // ==============================================================
  // RUN SURVEY
  // ==============================================================
  async function runSurvey({ question, options = [], questionType = "open_ended", context = "", useWebSearch = false, model = "claude-sonnet-4-6" }) {
    const start = Date.now();
    const apiResp = await callClaude({ question, options, questionType, context, useWebSearch, model });
    let parsed;
    try {
      parsed = extractJson(apiResp.raw);
    } catch (err) {
      throw new Error("ไม่สามารถ parse JSON ได้: " + err.message + "\n\nRaw output:\n" + apiResp.raw.slice(0, 500));
    }

    const result = {
      timestamp: Date.now(),
      duration_ms: Date.now() - start,
      question,
      options,
      questionType,
      context,
      useWebSearch,
      model,
      usage: apiResp.usage,
      ...parsed
    };

    // Persist to history
    const history = getHistory();
    history.unshift(result);
    saveHistory(history);

    return result;
  }

  // ==============================================================
  // FALLBACK MODE (rule-based) — ใช้เมื่อยังไม่มี API key
  // จำลอง distribution จาก persona traits + research priors
  // ==============================================================
  function runSurveyFallback({ question, options = [], questionType = "open_ended" }) {
    const S = window.LA_GLACE_SURVEY;
    const q = question.toLowerCase();

    // detect if question maps to a known prior
    const priorKey = findMatchingPrior(q);
    let overall = {};
    let bySegment = {};

    if (priorKey && options.length === 0) {
      overall = { ...S.research_priors[priorKey] };
    } else if (options.length) {
      // distribute by persona traits — simple heuristic
      options.forEach((opt, i) => {
        overall[opt] = 0;
      });
      S.personas.forEach(p => {
        const seg = S.getSegment(p.segment_id);
        // weighted random choice influenced by traits
        const scores = options.map((opt, i) => {
          let score = 1;
          const optLower = opt.toLowerCase();
          if (/storytelling|story|founder|จริงใจ/.test(optLower)) score += seg.core_traits.storytelling_response / 50;
          if (/double|2\.2|3\.3|4\.4|โปร|โปรโมชั่น/.test(optLower)) score += seg.core_traits.double_day_response / 50;
          if (/tiktok/.test(optLower)) score += seg.core_traits.tiktok_trust / 50;
          if (/รีวิว|review/.test(optLower)) score += (100 - seg.core_traits.review_skepticism) / 50;
          if (/ของหมด|stock|out/.test(optLower)) score += 1.2;
          if (/ph|blush|บลัช/.test(optLower)) score += 1.5;
          return score;
        });
        const total = scores.reduce((a, b) => a + b, 0);
        const rand = Math.random() * total;
        let acc = 0;
        for (let i = 0; i < options.length; i++) {
          acc += scores[i];
          if (rand <= acc) {
            overall[options[i]] = (overall[options[i]] || 0) + 1;
            // segment-level
            bySegment[seg.id] = bySegment[seg.id] || {};
            bySegment[seg.id][options[i]] = (bySegment[seg.id][options[i]] || 0) + 1;
            break;
          }
        }
      });
      // normalize to %
      const total = Object.values(overall).reduce((a, b) => a + b, 0) || 1;
      Object.keys(overall).forEach(k => overall[k] = Math.round(overall[k] / total * 100));
      Object.keys(bySegment).forEach(segId => {
        const segTotal = Object.values(bySegment[segId]).reduce((a, b) => a + b, 0) || 1;
        Object.keys(bySegment[segId]).forEach(k => {
          bySegment[segId][k] = Math.round(bySegment[segId][k] / segTotal * 100);
        });
      });
    } else {
      overall = { "(ต้องใช้ API mode สำหรับคำถามปลายเปิด)": 100 };
    }

    return {
      timestamp: Date.now(),
      question,
      options,
      questionType,
      mode: "fallback_rule_based",
      overall_distribution: overall,
      by_segment: bySegment,
      top_themes: [],
      predicted_satisfaction_score: null,
      confidence: "low",
      key_insight: "นี่คือ rule-based simulation จากข้อมูลวิจัย — แนะนำให้ตั้งค่า API key เพื่อผลที่แม่นยำขึ้น",
      risks: [],
      opportunities: []
    };
  }

  function findMatchingPrior(q) {
    const map = [
      [/ช่องทาง|ซื้อ.*ที่ไหน|platform|channel/, "purchase_channel"],
      [/อายุ.*แรก|first.*purchase/, "first_purchase_age"],
      [/ตอนไหน|ช่วงเวลา|timing/, "purchase_timing"],
      [/คอนเทนต์|content/, "content_drive"],
      [/ลังเล|หยุดใช้|hesitat/, "hesitation"],
      [/hero|สินค้า.*ดีที่สุด/, "hero_product"],
      [/พกพา|portable/, "portable_hero"],
      [/จุดอ่อน|weakness|สู้.*ไม่/, "weakness_vs_competitors"],
      [/สำเร็จ|success/, "success_metric"]
    ];
    for (const [re, key] of map) if (re.test(q)) return key;
    return null;
  }

  // ==============================================================
  // REFRESH TRENDS — auto-fetch current purchase-decision drivers
  // via Claude API + WebSearch tool
  // ==============================================================
  async function refreshTrends({ model = "claude-sonnet-4-6" } = {}) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("กรุณาตั้งค่า Claude API Key ก่อน");

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });

    const systemPrompt = `You are a Thai beauty market research analyst. Your job: extract CURRENT purchase-decision drivers for young Thai women (Gen Z + Millennials) buying cosmetics/makeup, focused on the LA GLACE customer segment (underground/masstige Thai brands, K-beauty competitors, TikTok-driven).

Output STRICTLY as a Thai-language bulleted list (10-16 bullets) — each bullet is one driver. Format:

- [PUSH] / [BLOCK] / [VIRAL] / [SEASONAL] {factor}: short explanation of how it affects buy decisions

Cover these categories:
1. Viral products/ingredients on TikTok Thailand right now
2. K-beauty / J-beauty / C-beauty crossover trends
3. Economic factors affecting buying (รายได้, ค่าครองชีพ, ปรับขึ้น VAT, etc.)
4. Seasonal/weather factors (PM2.5, heat, rainy season → product needs)
5. Competitor activity (Romand new launches, Cathy Doll campaigns, 3CE, Mistine, etc.)
6. Promo cycle drivers (11.11, 12.12, Double Day, Mid-year sales, festival sales)
7. Cultural moments (concert tour, drama release, festival → makeup demand spike)
8. Sustainability / wellness signals affecting purchases
9. Pricing psychology / Masstige positioning shifts
10. Channel/platform shifts (TikTok Shop policy, live commerce, marketplace)

Be SPECIFIC: name actual brands, product lines, events, viral hashtags, prices.
No preamble, no conclusion — ONLY the bullets.`;

    const userPrompt = `Today is ${today}. Research and output the current week's purchase-decision drivers for Thai Gen Z + Millennial beauty consumers (LA GLACE target segment).

Use web_search for: "TikTok beauty Thailand viral [current month/year]", "เครื่องสำอางขายดี TikTok [year]", "Thai beauty trends [current month]", "Korean beauty Thailand 2026", "Romand Thailand new launch", "LA GLACE viral".

Output the bulleted list only.`;

    const body = {
      model,
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }]
    };

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      throw new Error(`API ${resp.status}: ${await resp.text()}`);
    }

    const data = await resp.json();
    const text = (data.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n")
      .trim();

    if (!text) throw new Error("API returned empty trends");

    setCurrentTrends(text);
    return { text, updatedAt: getTrendsUpdatedAt(), usage: data.usage };
  }

  return {
    getApiKey, setApiKey,
    getCurrentTrends, setCurrentTrends, getTrendsUpdatedAt, getTrendsAgeDays,
    getHistory, saveHistory,
    runSurvey, runSurveyFallback, refreshTrends,
    DEFAULT_TRENDS
  };
})();
