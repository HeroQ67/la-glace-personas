// LA GLACE Survey Panel — virtual persona pool for behavior/satisfaction prediction
// อ้างอิงจากผลวิจัย "LA GLACE - beauty product consumer" (Summary Result)
//   - Age: 19-22 (49%), 23-25 (42%), 26-30 (4%), 30+ (4%)
//   - First purchase age: 19-22 (67%), 23-25 (33%)
//   - 4 main behavior segments
//   - Hesitation factors: reviews not convincing 23%, out-of-stock 22%,
//     other brands 17%, packaging 16%, etc.
//   - Purchase channel: TikTok Shop 82%, Shopee 16%, Lazada 2%
//   - Content that drives purchase: Storytelling 100%
//   - Hero product: Ph Blush 100%, Concealer Sachet 91%
//   - Best timing: Double Day campaigns 100%
//   - Comparison weakness: Quality 73%, Variety 27%
//   - Repeat purchase = success metric 78%

window.LA_GLACE_SURVEY = {

  // ====================================================================
  // SEGMENTS — 4 groups; weights sum to 100
  // ====================================================================
  segments: [
    {
      id: "strategic_pro",
      name: "Strategic Professionals",
      name_th: "นักกลยุทธ์มืออาชีพ",
      weight: 25,
      color: "#4a5568",
      icon: "📊",
      description: "Beauty Tech / Digital Marketing pros, founders, มอง LA GLACE เป็น Case Study",
      core_traits: {
        emotion_baseline: ["distressed", "frequently_stressed", "neutral"],
        experience: "has_experience",
        analytical: 88,
        impulse: 20,
        price_sensitivity: 45,
        trend_following: 55,
        social_currency_value: 70,
        loyalty_floor: 70,
        tiktok_trust: 60,
        review_skepticism: 80,
        repeat_purchase_tendency: 75,
        storytelling_response: 90,
        double_day_response: 95
      }
    },
    {
      id: "influencer_entrepreneur",
      name: "Ambitious Influencers",
      name_th: "อินฟลู / ผู้ประกอบการรุ่นใหม่",
      weight: 25,
      color: "#9b5de5",
      icon: "✨",
      description: "Content creators, side-hustle entrepreneurs, ใช้สินค้าเป็นเครื่องมือสร้างตัวตน",
      core_traits: {
        emotion_baseline: ["mixed", "energetic_positive", "frequently_stressed"],
        experience: "some_experience",
        analytical: 65,
        impulse: 65,
        price_sensitivity: 50,
        trend_following: 92,
        social_currency_value: 95,
        loyalty_floor: 55,
        tiktok_trust: 90,
        review_skepticism: 60,
        repeat_purchase_tendency: 70,
        storytelling_response: 95,
        double_day_response: 100
      }
    },
    {
      id: "status_seeker",
      name: "Emotional Status Seekers",
      name_th: "Gen Z สาย FOMO / Status",
      weight: 30,
      color: "#ff6b9d",
      icon: "💗",
      description: "นักศึกษา/พนักงานเริ่มต้น, FOMO-driven, ใช้สินค้าเป็น healing + social proof",
      core_traits: {
        emotion_baseline: ["frequently_stressed", "distressed", "mixed"],
        experience: "no_experience",
        analytical: 35,
        impulse: 85,
        price_sensitivity: 88,
        trend_following: 95,
        social_currency_value: 92,
        loyalty_floor: 50,
        tiktok_trust: 95,
        review_skepticism: 55,
        repeat_purchase_tendency: 60,
        storytelling_response: 92,
        double_day_response: 100
      }
    },
    {
      id: "balanced_lifestyle",
      name: "Balanced Lifestyle",
      name_th: "วัยทำงาน Pragmatic",
      weight: 20,
      color: "#2dd4bf",
      icon: "🌿",
      description: "วัยทำงานที่ balanced, ให้ความสำคัญกับ functionality + cost-effective",
      core_traits: {
        emotion_baseline: ["balanced", "neutral", "mixed"],
        experience: "some_experience",
        analytical: 75,
        impulse: 30,
        price_sensitivity: 65,
        trend_following: 40,
        social_currency_value: 55,
        loyalty_floor: 80,
        tiktok_trust: 50,
        review_skepticism: 75,
        repeat_purchase_tendency: 88,
        storytelling_response: 88,
        double_day_response: 90
      }
    }
  ],

  // ====================================================================
  // PERSONA POOL — 32 personas weighted to match research demographics
  // ====================================================================
  // age distribution target: 19-22 (49%), 23-25 (42%), 26-30 (5%), 30+ (4%)
  personas: [
    // ========== STRATEGIC PRO (8 personas, ~25%) ==========
    {
      id: "SP01", segment_id: "strategic_pro", weight: 1.0,
      name: "พลอย", age: 28, role: "Beauty Tech PM",
      emotion: "frequently_stressed", income_k: 65,
      key_traits: "ดู Brand เป็น Case Study, วิเคราะห์ algorithm + ROI ก่อนซื้อ",
      laglace_view: "ชื่นชม viral mechanics แต่กังวล supply chain"
    },
    {
      id: "SP02", segment_id: "strategic_pro", weight: 1.0,
      name: "เจมส์", age: 26, role: "Digital Marketing Lead",
      emotion: "neutral", income_k: 55,
      key_traits: "Data-driven, ซื้อตอน Double Day, รอเทียบ ingredient",
      laglace_view: "ชอบ storytelling, อยาก Hybrid Beauty product line"
    },
    {
      id: "SP03", segment_id: "strategic_pro", weight: 0.9,
      name: "เก่ง", age: 30, role: "Co-Founder Beauty Startup",
      emotion: "mixed", income_k: 80,
      key_traits: "วิเคราะห์ Niche-to-Mass strategy, ใช้เป็นบทเรียน",
      laglace_view: "เคารพ DNA แต่ติงเรื่อง stock management"
    },
    {
      id: "SP04", segment_id: "strategic_pro", weight: 1.0,
      name: "นิว", age: 25, role: "Senior Affiliate Manager",
      emotion: "frequently_stressed", income_k: 45,
      key_traits: "เน้น ROI, รู้กลไก Hunger Marketing ไม่หลงกระแส",
      laglace_view: "ใช้ Ph Blush, รอ R&D เสริมก่อนซื้อใหม่"
    },
    {
      id: "SP05", segment_id: "strategic_pro", weight: 1.0,
      name: "แอน", age: 24, role: "Product Manager (FMCG)",
      emotion: "balanced", income_k: 50,
      key_traits: "ชอบ Masstige pricing, ยอมจ่ายถ้า ingredient ดี",
      laglace_view: "อยากเห็น Skincare-infused tint"
    },
    {
      id: "SP06", segment_id: "strategic_pro", weight: 0.8,
      name: "พีร์", age: 32, role: "Brand Strategist",
      emotion: "neutral", income_k: 90,
      key_traits: "ยอม Premium ถ้า positioning ชัด, ไม่ตามกระแส",
      laglace_view: "เห็น potential สู่ตลาดหลักทรัพย์ ถ้าแก้ operations"
    },
    {
      id: "SP07", segment_id: "strategic_pro", weight: 1.0,
      name: "ตา", age: 27, role: "E-commerce Operations",
      emotion: "distressed", income_k: 42,
      key_traits: "รู้ดี pain ของ Out-of-Stock, repeat-buyer",
      laglace_view: "ภักดีต่อ Toner Pad, อยาก Quick Commerce"
    },
    {
      id: "SP08", segment_id: "strategic_pro", weight: 0.9,
      name: "ฟ้า", age: 23, role: "Junior Beauty Buyer",
      emotion: "mixed", income_k: 32,
      key_traits: "เริ่มมีอำนาจตัดสินใจซื้อในงาน, รู้ trend สากล",
      laglace_view: "ชอบ aesthetic แต่อยากเห็นความหลากหลายสีผิว"
    },

    // ========== INFLUENCER / ENTREPRENEUR (8 personas, ~25%) ==========
    {
      id: "IE01", segment_id: "influencer_entrepreneur", weight: 1.2,
      name: "บี", age: 22, role: "TikTok Creator 80K",
      emotion: "energetic_positive", income_k: 38,
      key_traits: "Trend-setter, ทำ Affiliate รายได้หลัก, ซื้อก่อน launch",
      laglace_view: "เป็นพาร์ทเนอร์ Affiliate, ภูมิใจในแบรนด์ไทย"
    },
    {
      id: "IE02", segment_id: "influencer_entrepreneur", weight: 1.0,
      name: "แอม", age: 25, role: "Beauty Reseller / Live Seller",
      emotion: "frequently_stressed", income_k: 50,
      key_traits: "ไลฟ์ขายเก่ง, รู้ pain คนซื้อ, รักษา community",
      laglace_view: "ใช้ Concealer Sachet ทุกวัน, อยากเห็น merchandise"
    },
    {
      id: "IE03", segment_id: "influencer_entrepreneur", weight: 1.1,
      name: "เก๋", age: 24, role: "Freelance Makeup Artist",
      emotion: "mixed", income_k: 35,
      key_traits: "เน้น aesthetic + portfolio content, สาย Underground",
      laglace_view: "ใช้ Ph Blush ในงาน, อยากเห็น Hybrid + Mocha tone"
    },
    {
      id: "IE04", segment_id: "influencer_entrepreneur", weight: 0.9,
      name: "วิว", age: 26, role: "Content Creator (Lifestyle)",
      emotion: "energetic_positive", income_k: 45,
      key_traits: "ถ่ายสวยเพื่อ IG, ชอบ packaging แบบ Y2K",
      laglace_view: "ตัดสินใจซื้อจาก viral gimmick + storytelling"
    },
    {
      id: "IE05", segment_id: "influencer_entrepreneur", weight: 1.0,
      name: "แพรว", age: 23, role: "Side-Hustle Owner (Skincare Reseller)",
      emotion: "mixed", income_k: 30,
      key_traits: "บริหารงบเดือนชน, รอ Double Day ตุน stock",
      laglace_view: "ใช้ Toner Pad รักษาผิว, อยากเห็น sustainability"
    },
    {
      id: "IE06", segment_id: "influencer_entrepreneur", weight: 1.1,
      name: "นัท", age: 27, role: "Aspiring Beauty Founder",
      emotion: "frequently_stressed", income_k: 40,
      key_traits: "ศึกษากลยุทธ์เพื่อตั้งแบรนด์, ลงทุนเรียนรู้จาก LA GLACE",
      laglace_view: "เป็นแรงบันดาลใจ + benchmark"
    },
    {
      id: "IE07", segment_id: "influencer_entrepreneur", weight: 1.0,
      name: "ออม", age: 21, role: "Nano Influencer 12K",
      emotion: "mixed", income_k: 18,
      key_traits: "เพิ่งเริ่มสร้างฐาน, ใช้สินค้าเพื่อทำคอนเทนต์",
      laglace_view: "อยากให้แบรนด์ส่ง PR, สนับสนุน founder story"
    },
    {
      id: "IE08", segment_id: "influencer_entrepreneur", weight: 0.9,
      name: "ปั้น", age: 24, role: "Digital Agency Account Executive",
      emotion: "frequently_stressed", income_k: 38,
      key_traits: "เห็น campaign แล้วถอดบทเรียนได้, ตัดสินใจซื้อทันที",
      laglace_view: "เน้น viral mechanics, ชอบ Mini ลาก่อน"
    },

    // ========== STATUS SEEKER (10 personas, ~30%) ==========
    {
      id: "SS01", segment_id: "status_seeker", weight: 1.3,
      name: "ใบเฟิร์น", age: 20, role: "นักศึกษาปี 2 มหาวิทยาลัย",
      emotion: "frequently_stressed", income_k: 8,
      key_traits: "FOMO หนัก, ตามทุกเทรนด์ TikTok, ค่าขนมจำกัด",
      laglace_view: "ต้องมี Ph Blush ไม่งั้นเชย, รอ Double Day"
    },
    {
      id: "SS02", segment_id: "status_seeker", weight: 1.2,
      name: "เปรม", age: 19, role: "นักศึกษาปี 1",
      emotion: "distressed", income_k: 6,
      key_traits: "เพิ่งเริ่มแต่งหน้า, ลอกเทรนด์ TikTok แบบเป๊ะ",
      laglace_view: "เริ่มซื้อจาก Concealer Sachet ราคาเข้าถึงได้"
    },
    {
      id: "SS03", segment_id: "status_seeker", weight: 1.0,
      name: "แพร", age: 22, role: "นักศึกษาปี 4 + part-time",
      emotion: "mixed", income_k: 12,
      key_traits: "เน้น Instagrammable, สะสมตามเทรนด์",
      laglace_view: "ใช้ Underground aesthetic เป็นจุดยืน"
    },
    {
      id: "SS04", segment_id: "status_seeker", weight: 1.1,
      name: "ตาล", age: 21, role: "นักศึกษาปี 3 + Live ขาย",
      emotion: "frequently_stressed", income_k: 15,
      key_traits: "ผสมระหว่าง student + side-hustle, ขายเก่ง",
      laglace_view: "ภักดี + แนะนำเพื่อน, ใช้ Toner Pad"
    },
    {
      id: "SS05", segment_id: "status_seeker", weight: 1.2,
      name: "ก้อย", age: 20, role: "นักศึกษาปี 2 สายแฟชั่น",
      emotion: "mixed", income_k: 10,
      key_traits: "ตามเทรนด์ K-beauty + J-beauty, สาย Y2K",
      laglace_view: "เปรียบเทียบกับ Romand ตลอด, ราคาคุ้มกว่า"
    },
    {
      id: "SS06", segment_id: "status_seeker", weight: 1.0,
      name: "พิ้งค์", age: 23, role: "เริ่มทำงานปีแรก HR",
      emotion: "frequently_stressed", income_k: 22,
      key_traits: "รักษาภาพมืออาชีพในออฟฟิศ + ทันสมัย",
      laglace_view: "ใช้ Concealer Sachet ทุกวัน, รอโปร"
    },
    {
      id: "SS07", segment_id: "status_seeker", weight: 1.1,
      name: "ฝนแก้ว", age: 19, role: "นักศึกษาปี 1 ต่างจังหวัด → กทม.",
      emotion: "distressed", income_k: 7,
      key_traits: "เพิ่งย้ายเมือง, รู้สึกตามไม่ทัน, ใช้แบรนด์เพื่อ fit in",
      laglace_view: "อยากได้แต่กลัวเปลือง, รอ payday/promo"
    },
    {
      id: "SS08", segment_id: "status_seeker", weight: 1.0,
      name: "แตม", age: 22, role: "Graphic Design Junior",
      emotion: "mixed", income_k: 20,
      key_traits: "สาย Underground + Art Toy fan",
      laglace_view: "ฝันถึง collab ที่แสดงตัวตน"
    },
    {
      id: "SS09", segment_id: "status_seeker", weight: 1.1,
      name: "พลอยใส", age: 21, role: "นักศึกษาปี 3 + content creator น้อยๆ",
      emotion: "frequently_stressed", income_k: 11,
      key_traits: "อยากเป็น influencer แต่ยังเล็ก, ทดลองทุกแบรนด์",
      laglace_view: "ติดตามแบรนด์ใกล้ชิด, ภักดี แต่เปรียบเทียบเก่ง"
    },
    {
      id: "SS10", segment_id: "status_seeker", weight: 1.0,
      name: "นน", age: 24, role: "Junior Sales (เริ่มงาน)",
      emotion: "mixed", income_k: 25,
      key_traits: "ภาพลักษณ์สำคัญในงาน Sales, ทันสมัย",
      laglace_view: "ใช้แบรนด์เพื่อสร้าง confidence ในการ pitch"
    },

    // ========== BALANCED LIFESTYLE (6 personas, ~20%) ==========
    {
      id: "BL01", segment_id: "balanced_lifestyle", weight: 1.0,
      name: "ใหม่", age: 26, role: "Office Worker (Bank)",
      emotion: "balanced", income_k: 40,
      key_traits: "ใช้เครื่องสำอางเฉพาะ funcitonal + ทนทาน",
      laglace_view: "ภักดี Toner Pad, ไม่ตามกระแส"
    },
    {
      id: "BL02", segment_id: "balanced_lifestyle", weight: 1.1,
      name: "หนิง", age: 28, role: "Software Engineer (Female)",
      emotion: "neutral", income_k: 60,
      key_traits: "ไม่สนกระแส, ซื้อเมื่อขาด, value functionality สูง",
      laglace_view: "ใช้ Concealer Sachet พกพา"
    },
    {
      id: "BL03", segment_id: "balanced_lifestyle", weight: 1.0,
      name: "อิม", age: 25, role: "Teacher Junior",
      emotion: "mixed", income_k: 28,
      key_traits: "งบจำกัด, ใช้เท่าที่ต้อง",
      laglace_view: "ใช้ Mini ขนาดเล็กเพราะคุ้ม"
    },
    {
      id: "BL04", segment_id: "balanced_lifestyle", weight: 0.9,
      name: "นิ", age: 27, role: "Nurse",
      emotion: "balanced", income_k: 32,
      key_traits: "งานเสียเหงื่อ ต้องการสินค้าทน, ไม่มีเวลาตามเทรนด์",
      laglace_view: "อยากให้แบรนด์มี long-wear formula"
    },
    {
      id: "BL05", segment_id: "balanced_lifestyle", weight: 1.0,
      name: "โอม", age: 30, role: "Senior Accountant",
      emotion: "neutral", income_k: 55,
      key_traits: "Premium-conscious แต่ value-driven, ไม่ impulse",
      laglace_view: "เปรียบเทียบกับ Counter brand, อยาก premium variant"
    },
    {
      id: "BL06", segment_id: "balanced_lifestyle", weight: 0.9,
      name: "บัว", age: 24, role: "Graduate Student",
      emotion: "balanced", income_k: 15,
      key_traits: "Skincare-focused, makeup เป็นรอง, ใช้น้อยแต่ดี",
      laglace_view: "อยากเห็น skincare line ใหม่, ราคาเข้าถึง"
    }
  ],

  // ====================================================================
  // SHARED BRAND/MARKET CONTEXT (injected into every survey prompt)
  // ====================================================================
  brand_context: {
    name: "LA GLACE (ลากลาส)",
    positioning: "Underground Beauty — Masstige Thai brand, niche-to-mass",
    founded: 2017,
    revenue_2024_thb: 420000000,
    hero_products: [
      "Ph Blush (บลัชเปลี่ยนสีตาม pH ผิว) — 289 THB — Iconic viral product",
      "Mini Airy Concealer Sachet — 99 THB ขนาดพกพา — เข้าถึง mass + ขายใน 7-Eleven",
      "Toner Pad — 320 THB — repeat purchase สูงสุด",
      "Ph Blush Cream / Lip Tint / Eyeliner / Dazzling Glitter"
    ],
    price_range: "199–399 THB (Masstige)",
    main_channels: "TikTok Shop (~82%), Shopee (~16%), 7-Eleven, Watson, Konvy",
    known_pain_points: [
      "Packaging แตก/รั่วบ่อย",
      "Stock ขาดบ่อย (โดยเฉพาะ Hero Product หลัง viral)",
      "ความหลากหลายสีผิว/shade ยังน้อย",
      "ติดทน/กันเหงื่อยังไม่สู้สภาพอากาศไทย",
      "ค่าจัดส่ง / ไลฟ์รอนาน"
    ],
    competitors: {
      "Romand": "Korean prestige — premium, packaging สวย",
      "Essence (DE)": "ราคาใกล้กัน, formula stable แต่ไม่มี story",
      "Mistine / Cathy Doll": "Thai mass — ถูกกว่า แต่ขาด vibe / cool factor",
      "ZA / Skinfood": "Counter mass — น่าเบื่อ",
      "3CE": "Korean — packaging premium, ราคาแพงขึ้น"
    }
  },

  // ====================================================================
  // RESEARCH-CALIBRATED PROBABILITIES (from PDF survey)
  // ใช้ ground คำตอบให้อยู่ใกล้สัดส่วนจริงในการ simulate
  // ====================================================================
  research_priors: {
    purchase_channel: { "TikTok Shop": 82, "Shopee": 16, "Lazada": 2 },
    first_purchase_age: { "19-22": 67, "23-25": 33 },
    purchase_timing: { "Double Day campaign": 100 },
    content_drive: { "Storytelling": 100, "Real review": 0 },
    hesitation: {
      "รีวิวไม่น่าซื้อ": 23, "ของหมดบ่อย": 22, "แบรนด์อื่นน่าสนใจ": 17,
      "แพ็คเกจไม่สวย": 16, "แบรนด์อื่นตัดหน้า": 13, "รอเงินเดือนออก": 8,
      "ราคาสูง": 2, "ไม่ชอบ texture/สี": 2
    },
    hero_product: { "Ph Blush": 100 },
    portable_hero: { "Concealer Sachet": 91, "Eyeliner": 7, "Concealer (full)": 2 },
    weakness_vs_competitors: { "คุณภาพ": 73, "ความหลากหลาย": 27 },
    success_metric: { "ซื้อซ้ำ": 78, "คนพูดถึงเยอะ": 22 }
  }
};

// ====================================================================
// PUBLIC API — utilities for survey.js
// ====================================================================

window.LA_GLACE_SURVEY.getSegment = function(id) {
  return this.segments.find(s => s.id === id);
};

window.LA_GLACE_SURVEY.getPersonasBySegment = function(segmentId) {
  return this.personas.filter(p => p.segment_id === segmentId);
};

window.LA_GLACE_SURVEY.buildPanelSummary = function(filterSegmentIds = null) {
  const pool = filterSegmentIds
    ? this.personas.filter(p => filterSegmentIds.includes(p.segment_id))
    : this.personas;

  return pool.map(p => {
    const seg = this.getSegment(p.segment_id);
    return `${p.id} [${seg.name}] ${p.name} (${p.age}, ${p.role}, ${p.emotion}, รายได้~${p.income_k}k/เดือน): ${p.key_traits} | LA GLACE: ${p.laglace_view}`;
  }).join("\n");
};

window.LA_GLACE_SURVEY.buildSegmentSummary = function() {
  return this.segments.map(s => {
    const count = this.personas.filter(p => p.segment_id === s.id).length;
    return `- ${s.name} (${s.id}) [weight ${s.weight}%, n=${count}]: ${s.description}`;
  }).join("\n");
};
