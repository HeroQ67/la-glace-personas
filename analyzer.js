// Rule-based persona response analyzer
// ไม่ต้องใช้ API — วิเคราะห์ข้อความผู้ใช้แล้วสร้างคำตอบเชิงสถิติตาม persona profile
window.PersonaAnalyzer = (function() {

  // คะแนนพื้นฐานของแต่ละ persona ต่อมิติต่างๆ (0-100)
  const PROFILES = {
    P001: { // ไอซ์ - มัธยม
      price_sensitivity: 92,
      brand_loyalty: 55,
      trend_following: 88,
      research_depth: 35,
      ingredient_awareness: 25,
      impulse_buy: 78,
      social_influence: 90,
      content_creation: 30,
      sustainability_concern: 20,
      tiktok_trust: 95,
      pantip_trust: 30,
      reddit_trust: 10,
      friend_trust: 85,
      influencer_trust: 75,
      celeb_trust: 25,
      avg_spend: 300,
      max_acceptable_price: 400,
      monthly_budget: 800,
      decision_speed_days: 1,
      reaction_excitement: 95,
      analytical_score: 30
    },
    P002: { // มิ้น - มหาลัย
      price_sensitivity: 60,
      brand_loyalty: 80,
      trend_following: 45,
      research_depth: 78,
      ingredient_awareness: 70,
      impulse_buy: 35,
      social_influence: 60,
      content_creation: 65,
      sustainability_concern: 75,
      tiktok_trust: 65,
      pantip_trust: 70,
      reddit_trust: 80,
      friend_trust: 70,
      influencer_trust: 55,
      celeb_trust: 20,
      avg_spend: 650,
      max_acceptable_price: 900,
      monthly_budget: 1500,
      decision_speed_days: 5,
      reaction_excitement: 65,
      analytical_score: 82
    },
    P003: { // ฝ้าย - วัยทำงาน
      price_sensitivity: 55,
      brand_loyalty: 92,
      trend_following: 25,
      research_depth: 85,
      ingredient_awareness: 80,
      impulse_buy: 15,
      social_influence: 40,
      content_creation: 10,
      sustainability_concern: 60,
      tiktok_trust: 50,
      pantip_trust: 85,
      reddit_trust: 40,
      friend_trust: 80,
      influencer_trust: 45,
      celeb_trust: 15,
      avg_spend: 900,
      max_acceptable_price: 1200,
      monthly_budget: 2500,
      decision_speed_days: 10,
      reaction_excitement: 35,
      analytical_score: 88
    },
    P004: { // เจน - creator
      price_sensitivity: 25,
      brand_loyalty: 75,
      trend_following: 92,
      research_depth: 70,
      ingredient_awareness: 65,
      impulse_buy: 60,
      social_influence: 95,
      content_creation: 98,
      sustainability_concern: 70,
      tiktok_trust: 70,
      pantip_trust: 50,
      reddit_trust: 65,
      friend_trust: 60,
      influencer_trust: 80,
      celeb_trust: 35,
      avg_spend: 1200,
      max_acceptable_price: 2000,
      monthly_budget: 4000,
      decision_speed_days: 2,
      reaction_excitement: 82,
      analytical_score: 70
    }
  };

  // Keyword -> intent
  const INTENTS = [
    { name: 'greeting', keywords: ['สวัสดี', 'ทักทาย', 'แนะนำตัว', 'hello', 'hi', 'หวัดดี'] },
    { name: 'price', keywords: ['ราคา', 'แพง', 'ถูก', 'บาท', 'คุ้ม', 'price', 'งบ', 'เงิน'] },
    { name: 'buy_intent', keywords: ['ซื้อ', 'จะซื้อ', 'อยากได้', 'จ่าย', 'สั่ง', 'order'] },
    { name: 'product_blush', keywords: ['บลัช', 'blush', 'แก้ม', 'บลัชดำ', 'black magic'] },
    { name: 'product_concealer', keywords: ['คอนซีล', 'concealer', 'ปิดสิว', 'ปิดรอย', 'airy'] },
    { name: 'product_toner', keywords: ['toner', 'ทอนเนอร์', 'แพด', 'pad', 'รูขุมขน'] },
    { name: 'product_glitter', keywords: ['glitter', 'กลิตเตอร์', 'อายแชโดว์', 'ตา', 'dazzling'] },
    { name: 'new_product', keywords: ['ออกใหม่', 'สินค้าใหม่', 'launch', 'collection', 'อยากให้ออก'] },
    { name: 'comparison', keywords: ['เทียบ', 'เปรียบ', 'vs', 'ดีกว่า', 'แบรนด์อื่น', 'mistine', 'romand', 'cathy', 'essence'] },
    { name: 'ingredient', keywords: ['ส่วนผสม', 'ingredient', 'BHA', 'AHA', 'niacinamide', 'retinol', 'แพ้', 'cruelty'] },
    { name: 'sustainability', keywords: ['recycle', 'sustainable', 'eco', 'รีไซเคิล', 'แพ็คเกจ', 'packaging'] },
    { name: 'shopping_channel', keywords: ['shopee', 'lazada', 'tiktok shop', 'watson', 'konvy', 'เซ็นทรัล', 'ซื้อที่ไหน', 'ช่องทาง'] },
    { name: 'review_intent', keywords: ['รีวิว', 'review', 'ลอง', 'experience', 'feedback'] },
    { name: 'complaint', keywords: ['ไม่ดี', 'แย่', 'ปัญหา', 'ไม่ชอบ', 'pain', 'ตำหนิ', 'หา stock', 'ของหมด'] },
    { name: 'recommend', keywords: ['แนะนำ', 'แนะ', 'recommend', 'ตัวไหนดี', 'ควรซื้อ'] },
    { name: 'why_brand', keywords: ['ทำไม', 'why', 'เลือก', 'รัก', 'ชอบ', 'loyal'] },
    { name: 'collab', keywords: ['collab', 'คอลแลบ', 'pr', 'sponsor', 'partnership'] }
  ];

  function detectIntents(text) {
    const lower = text.toLowerCase();
    const matched = [];
    INTENTS.forEach(i => {
      const hits = i.keywords.filter(k => lower.includes(k.toLowerCase())).length;
      if (hits > 0) matched.push({ name: i.name, hits });
    });
    return matched.length > 0 ? matched.sort((a,b) => b.hits - a.hits) : [{ name: 'general', hits: 1 }];
  }

  // สร้าง bar chart ASCII จาก %
  function bar(percent, width = 20) {
    const filled = Math.round((percent / 100) * width);
    return '█'.repeat(filled) + '░'.repeat(width - filled);
  }

  function pct(n) { return Math.round(n) + '%'; }

  // Voice templates per persona
  function voiceWrap(personaId, content) {
    const wraps = {
      P001: { prefix: '', suffix: '\n\n— ตอบจากตัวตน "ไอซ์" 🖤' },
      P002: { prefix: '', suffix: '\n\n— วิเคราะห์โดย "มิ้น" ☕' },
      P003: { prefix: '', suffix: '\n\n— ความเห็นจาก "ฝ้าย" 🌸' },
      P004: { prefix: '', suffix: '\n\n— honest analysis by "เจน" ✨' }
    };
    const w = wraps[personaId];
    return w.prefix + content + w.suffix;
  }

  function reactionTone(personaId, sentiment) {
    // sentiment: 'positive' | 'neutral' | 'negative'
    const tones = {
      P001: { positive: 'โอ้โห ปังมาก! 😭🖤', neutral: 'อืม...คือ 🤔', negative: 'เอ๊ะ ไม่ค่อยชอบเท่าไหร่นะ 😅' },
      P002: { positive: 'คือมันโอเคมากจริงๆ', neutral: 'มีหลายมุมต้องคิดนะ', negative: 'จะบอกตรงๆ ว่าไม่ค่อยใช่' },
      P003: { positive: 'ดีค่ะ คุ้มค่าจริงๆ', neutral: 'คงต้องดูรายละเอียดก่อนนะคะ', negative: 'ส่วนตัวยังไม่มั่นใจค่ะ' },
      P004: { positive: 'iconic จริงๆ slay 💯', neutral: 'ต้องวิเคราะห์ลึกหน่อย', negative: 'red flag นิดนึง honest review' }
    };
    return tones[personaId][sentiment];
  }

  // ========== INTENT HANDLERS ==========

  function handleGreeting(p, profile, text) {
    const intros = {
      P001: `หวัดดีค่ะ! ไอซ์เองนะ 🖤 อายุ 17 ม.5 อยู่ฝั่งธนฯ ติด TikTok หนักมาก เพิ่งติดบลัชดำของ LA GLACE ค่ะ ปังมากกก 😭

**ตัวตนคร่าวๆ**
- ค่าขนม: ฿4,500/เดือน · งบ beauty: ฿800
- ใช้ TikTok: ${bar(75, 15)} 4.5 ชม./วัน
- โอกาสซื้อตามเทรนด์: ${bar(profile.trend_following)} ${pct(profile.trend_following)}
- ความขี้ตกใจกับโปร: ${bar(profile.impulse_buy)} ${pct(profile.impulse_buy)}`,

      P002: `สวัสดีค่า มิ้นเองนะ ☕ ป.3 บริหารฯ part-time ร้านกาแฟ specialty อยู่หอ มีของ LA GLACE 4 ตัว

**Profile snapshot**
- รายได้รวม: ฿14,000/เดือน · งบ beauty: ฿1,500
- ความ analytical ก่อนซื้อ: ${bar(profile.analytical_score)} ${pct(profile.analytical_score)}
- ความสนใจ ingredient: ${bar(profile.ingredient_awareness)} ${pct(profile.ingredient_awareness)}
- Brand loyalty ต่อ LA GLACE: ${bar(profile.brand_loyalty)} ${pct(profile.brand_loyalty)}`,

      P003: `สวัสดีค่ะ ฝ้ายนะคะ 🌸 อายุ 25 HR officer บริษัท SME แถวอโศก ใช้ Toner Pad ของ LA GLACE มา 3 กล่องแล้วค่ะ

**Snapshot**
- เงินเดือน: ฿22,000 · งบความสวย: ฿2,500/เดือน
- ความระมัดระวังก่อนซื้อ: ${bar(profile.research_depth)} ${pct(profile.research_depth)}
- โอกาสซื้อซ้ำของที่ใช้แล้วชอบ: ${bar(profile.brand_loyalty)} ${pct(profile.brand_loyalty)}
- Impulse buy: ${bar(profile.impulse_buy)} ${pct(profile.impulse_buy)} (ต่ำ)`,

      P004: `Hey! เจนนะ ✨ Beauty creator freelance อายุ 23 ทำ TikTok @jen_beauty 15K followers — เคยได้ PR LA GLACE 1 รอบ

**Creator profile**
- รายได้: ฿18k–45k (avg 28k) · beauty budget: ฿4,000
- Content output: ${bar(profile.content_creation)} ${pct(profile.content_creation)} (เกือบทุกวัน)
- Trend sensitivity: ${bar(profile.trend_following)} ${pct(profile.trend_following)}
- Influence ต่อ followers: ${bar(profile.social_influence)} ${pct(profile.social_influence)}`
    };
    return intros[p.id];
  }

  function handlePrice(p, profile, text) {
    const reaction = reactionTone(p.id, profile.price_sensitivity > 70 ? 'negative' : (profile.price_sensitivity > 45 ? 'neutral' : 'positive'));
    return `${reaction}

**แนวโน้มของ ${p.codename} ต่อเรื่องราคา**

| ปัจจัย | สัดส่วน |
|---|---|
| ความ sensitive ต่อราคา | ${bar(profile.price_sensitivity)} ${pct(profile.price_sensitivity)} |
| ราคาที่จ่ายเฉลี่ย/ครั้ง | ฿${profile.avg_spend} |
| เพดานราคาที่ยอมจ่าย | ฿${profile.max_acceptable_price} |
| งบ beauty/เดือน | ฿${profile.monthly_budget} |
| โอกาส impulse buy ถ้าโปรลด 30% | ${pct(Math.min(95, profile.impulse_buy + 15))} |

**ความเป็นไปได้ในการซื้อตามช่วงราคา (LA GLACE)**
- ฿200–300: ${pct(Math.min(95, 100 - profile.price_sensitivity * 0.2))}
- ฿300–400: ${pct(Math.max(20, 90 - profile.price_sensitivity * 0.5))}
- ฿400–500: ${pct(Math.max(10, 70 - profile.price_sensitivity * 0.7))}
- ฿500+: ${pct(Math.max(5, 50 - profile.price_sensitivity * 0.6))}`;
  }

  function handleBuyIntent(p, profile, text) {
    const score = Math.round((profile.brand_loyalty + (100 - profile.price_sensitivity) * 0.5 + profile.trend_following * 0.3) / 1.8);
    const sentiment = score > 60 ? 'positive' : score > 40 ? 'neutral' : 'negative';
    return `${reactionTone(p.id, sentiment)}

**ความน่าจะเป็นที่จะซื้อ LA GLACE ในรอบถัดไป: ${pct(score)}**
${bar(score, 30)}

**Breakdown ปัจจัย**
- เห็นโปร flash sale → trigger ${pct(Math.min(98, profile.impulse_buy + 20))}
- เพื่อนสนิทรีวิว → trigger ${pct(profile.friend_trust)}
- เห็นใน TikTok FYP → trigger ${pct(profile.tiktok_trust)}
- มี limited edition → trigger ${pct(Math.min(95, profile.trend_following + 5))}
- ของเดิมหมด → trigger ${pct(Math.min(98, profile.brand_loyalty + 10))}

**ระยะเวลาตัดสินใจเฉลี่ย: ~${profile.decision_speed_days} วัน**`;
  }

  function handleProductBlush(p, profile) {
    const interestScore = Math.round((profile.trend_following * 0.4 + profile.brand_loyalty * 0.3 + (100 - profile.price_sensitivity) * 0.3));
    return `**Black Magic Blush ในมุมของ ${p.codename}**

| มิติ | สัดส่วน |
|---|---|
| ความน่าสนใจ | ${bar(interestScore)} ${pct(interestScore)} |
| โอกาสซื้อภายใน 30 วัน | ${pct(Math.min(95, interestScore + 10))} |
| โอกาสซื้อซ้ำหลังใช้ | ${pct(Math.min(95, profile.brand_loyalty + 5))} |
| โอกาสรีวิวให้คนอื่น | ${pct(profile.content_creation + profile.social_influence * 0.3)} |
| ความสนใจกลไก pH-reactive | ${pct(profile.trend_following * 0.6 + profile.ingredient_awareness * 0.4)} |

**แนวโน้มความเห็น:** ${
  p.id === 'P001' ? '"viral มาก ต้องลอง" — driven by TikTok hype' :
  p.id === 'P002' ? '"gimmick ที่ใช้ได้จริง — respect" — driven by uniqueness' :
  p.id === 'P003' ? '"กังวลเรื่อง pigment ใช้งานทุกวัน" — driven by practicality' :
  '"content gold สำหรับ before/after reel" — driven by visual content potential'
}`;
  }

  function handleProductToner(p, profile) {
    const interestScore = Math.round((profile.ingredient_awareness * 0.4 + profile.brand_loyalty * 0.4 + profile.research_depth * 0.2));
    return `**Toner Pad — แนวโน้มของ ${p.codename}**

- ความน่าสนใจ: ${bar(interestScore)} ${pct(interestScore)}
- โอกาสซื้อครั้งแรก: ${pct(p.id === 'P003' || p.id === 'P004' ? 90 : interestScore - 10)}
- โอกาสซื้อซ้ำ (หากใช้แล้วชอบ): ${pct(Math.min(98, profile.brand_loyalty + 5))}
- ความสนใจส่วนผสม BHA/Niacinamide: ${pct(profile.ingredient_awareness)}
- ความกังวลแพ้: ${pct(Math.max(15, 85 - profile.ingredient_awareness * 0.6))}

**Insight:** Toner Pad เป็นสินค้าที่ ${
  p.id === 'P001' ? 'ไอซ์ยังลังเล — กลัวแพ้ ราคา 320 บาทแพงกว่าบลัช ต้องเห็นรีวิวเยอะกว่านี้ก่อนตัดสินใจ' :
  p.id === 'P002' ? 'มิ้นใช้แล้วและประทับใจ — ซื้อซ้ำแน่นอน เป็น staple skincare' :
  p.id === 'P003' ? 'ฝ้ายซื้อซ้ำ x3 แล้ว — เป็น hero product สำหรับเธอ ผลลัพธ์ระยะยาวชัดเจน' :
  'เจนใช้ทำ skincare routine content ตลอด ROI สูงสำหรับการรีวิว'
}`;
  }

  function handleProductConcealer(p, profile) {
    const interestScore = Math.round((profile.brand_loyalty * 0.4 + (100 - profile.price_sensitivity) * 0.3 + 70 * 0.3));
    return `**Mini Airy Skin Concealer — มุม ${p.codename}**

- โอกาสที่จะซื้อ/ใช้: ${bar(interestScore)} ${pct(interestScore)}
- เหมาะกับ skin type ของ ${p.codename}: ${pct(p.id === 'P001' ? 80 : p.id === 'P002' ? 75 : p.id === 'P003' ? 90 : 85)}
- ความคาดหวัง coverage: ${p.id === 'P003' ? 'medium-high (สำหรับออฟฟิศ)' : p.id === 'P004' ? 'buildable เพื่อทำ content หลายลุค' : 'medium พอครอบสิว'}
- โอกาสใช้ทุกวัน: ${pct(p.id === 'P003' ? 85 : p.id === 'P001' ? 60 : 70)}

**Concern หลัก**
${p.id === 'P001' ? '- กลัวเนื้อหนาทำให้ดูแก่ (ความกังวล 65%)\n- กลัวซื้อแล้วใช้ไม่หมด (40%)' :
  p.id === 'P002' ? '- อยากให้มี shade ที่ undertone เย็นกว่านี้ (60%)\n- ความ longevity ตลอดวัน (50%)' :
  p.id === 'P003' ? '- อยู่ทนตอนใส่หน้ากากไหม (75%)\n- เนื้อแห้งเกาะร่องไหม (60%)' :
  '- finish ในกล้องเป็นยังไง (80%)\n- เหมาะกับ skin tone หลากหลายของ followers ไหม (70%)'}`;
  }

  function handleProductGlitter(p, profile) {
    const interestScore = Math.round((profile.trend_following * 0.5 + profile.content_creation * 0.3 + (100 - profile.price_sensitivity) * 0.2));
    return `**Dazzling Eye Glitter Duo — แนวโน้ม ${p.codename}**

- ความสนใจ: ${bar(interestScore)} ${pct(interestScore)}
- ความน่าจะเป็นที่จะซื้อใน 60 วัน: ${pct(Math.max(15, interestScore - 5))}
- โอกาสใช้ในชีวิตประจำวัน: ${pct(p.id === 'P004' ? 70 : p.id === 'P002' ? 45 : p.id === 'P001' ? 55 : 25)}
- โอกาสใช้สำหรับ event/content: ${pct(p.id === 'P004' ? 95 : 60)}

**Insight:** ${
  p.id === 'P001' ? 'ไอซ์ wishlist อยู่ — รอโปรหรือ payday ค่าขนม โอกาสซื้อภายในไตรมาส 65%' :
  p.id === 'P002' ? 'มิ้นใช้แล้ว — ชอบความ underground แต่ไม่ daily use, ใช้เฉพาะ event' :
  p.id === 'P003' ? 'ฝ้าย — ไม่เหมาะกับ office look, ความน่าจะเป็นที่จะซื้อต่ำ ~25%' :
  'เจน — staple ในกล่อง content เพราะไม่มีแบรนด์ไทยทำ ทำ tutorial ขายดี'
}`;
  }

  function handleNewProduct(p, profile) {
    return `**สินค้าใหม่ที่ ${p.codename} อยากให้ LA GLACE ออก**

| Category | ความน่าสนใจ |
|---|---|
| Lip product (ลิป) | ${bar(p.id === 'P002' || p.id === 'P004' ? 85 : 70)} ${pct(p.id === 'P002' || p.id === 'P004' ? 85 : 70)} |
| Skincare (serum/SPF) | ${bar(p.id === 'P003' ? 95 : profile.ingredient_awareness)} ${pct(p.id === 'P003' ? 95 : profile.ingredient_awareness)} |
| Eyeshadow palette | ${bar(p.id === 'P004' ? 90 : 60)} ${pct(p.id === 'P004' ? 90 : 60)} |
| Setting spray/powder | ${bar(p.id === 'P003' ? 80 : 55)} ${pct(p.id === 'P003' ? 80 : 55)} |
| Brow product | ${bar(50)} ${pct(50)} |
| Foundation | ${bar(p.id === 'P003' ? 75 : 45)} ${pct(p.id === 'P003' ? 75 : 45)} |

**ความน่าจะเป็นที่จะซื้อสินค้าใหม่ภายใน launch month: ${pct(Math.round((profile.brand_loyalty * 0.5 + profile.trend_following * 0.5)))}**

**${p.codename} อยากเห็น:** ${
  p.id === 'P001' ? 'ลิปทินท์สีน่ารัก ราคาต่ำกว่า 300 + บลัชสีใหม่' :
  p.id === 'P002' ? 'ลิปสีเข้ม dark academia + skincare มี ingredient มี story' :
  p.id === 'P003' ? 'SPF, moisturizer, eye cream — สาย skincare มากกว่า makeup' :
  'eyeshadow palette + limited collab — content potential สูง'
}`;
  }

  function handleComparison(p, profile) {
    return `**${p.codename} เปรียบเทียบ LA GLACE กับแบรนด์อื่น**

| Brand | คะแนน | แนวโน้มเลือก LA GLACE แทน |
|---|---|---|
| Mistine | ${bar(40, 12)} 40/100 | ${pct(85)} (LA GLACE มี vibe กว่า) |
| ZA | ${bar(30, 12)} 30/100 | ${pct(90)} (ZA น่าเบื่อ) |
| Cathy Doll | ${bar(45, 12)} 45/100 | ${pct(75)} (Cathy Doll mass เกิน) |
| Essence (DE) | ${bar(70, 12)} 70/100 | ${pct(p.id === 'P002' ? 65 : 55)} (story LA GLACE ดีกว่า) |
| Romand (KR) | ${bar(82, 12)} 82/100 | ${pct(p.id === 'P003' ? 50 : 35)} (Romand prestige สูงกว่า) |
| 3CE | ${bar(85, 12)} 85/100 | ${pct(p.id === 'P004' ? 40 : 30)} |

**ความน่าจะเป็นที่จะ switch ไปแบรนด์อื่นถาวร: ${pct(100 - profile.brand_loyalty)}**
- เหตุผลที่จะ switch:
  · LA GLACE ขึ้นราคาเกิน 30% → ${pct(Math.round(profile.price_sensitivity * 0.7))}
  · พบสินค้าที่ผลลัพธ์ดีกว่าราคาเท่ากัน → ${pct(70)}
  · แบรนด์มีปัญหา ethics → ${pct(profile.sustainability_concern)}`;
  }

  function handleIngredient(p, profile) {
    return `**ความสนใจ ingredient ของ ${p.codename}**

- ระดับการอ่าน label: ${bar(profile.ingredient_awareness)} ${pct(profile.ingredient_awareness)}
- โอกาสค้นคว้า ingredient ก่อนซื้อ: ${pct(profile.research_depth)}
- ให้ความสำคัญ cruelty-free: ${pct(profile.sustainability_concern)}
- ให้ความสำคัญ clean beauty: ${pct(Math.round(profile.ingredient_awareness * 0.8))}

**Concern หลัก**
${p.id === 'P001' ? '- ไม่ค่อยอ่าน label มากนัก (25%) — เน้นรีวิวมากกว่า\n- กังวลแพ้แค่ตอนเห็นเพื่อนแพ้' :
  p.id === 'P002' ? '- ตรวจสอบ INCI list ก่อนซื้อ (70%)\n- หลีกเลี่ยง paraben, alcohol แรง\n- ต้องการ source ที่ ethical' :
  p.id === 'P003' ? '- ใส่ใจ active ingredient (BHA, retinol, niacinamide)\n- ต้องการ % ที่ชัดเจน\n- เลี่ยง fragrance, essential oil ในสกินแคร์' :
  '- รู้จัก ingredient หลักๆ\n- pitch แบรนด์มักเน้น USP ของส่วนผสม\n- อยากให้แบรนด์ transparent มากกว่านี้'}

**ถ้า LA GLACE เปิดเผย full ingredient list → ความ trust เพิ่ม ${pct(Math.round(profile.ingredient_awareness * 0.5))}**`;
  }

  function handleSustainability(p, profile) {
    return `**${p.codename} กับ sustainability**

- ระดับความสนใจ: ${bar(profile.sustainability_concern)} ${pct(profile.sustainability_concern)}
- ยอมจ่ายเพิ่มเพื่อ eco packaging: ${pct(Math.round(profile.sustainability_concern * 0.6))}
- โอกาสบอยคอตแบรนด์ที่มีปัญหา ethics: ${pct(Math.round(profile.sustainability_concern * 0.7))}

**สิ่งที่อยากเห็นจาก LA GLACE**
${p.id === 'P001' ? '- ไม่ใช่ priority หลัก — แต่ถ้ามีก็ดี\n- สนใจถ้า influencer พูดเรื่องนี้' :
  p.id === 'P002' ? '- packaging recycle ได้ (สำคัญ 75%)\n- refill program (60%)\n- transparent supply chain (70%)' :
  p.id === 'P003' ? '- packaging ที่ใช้ซ้ำได้\n- refill option ประหยัดในระยะยาว' :
  '- transparent ingredient sourcing\n- collaboration กับ eco-creator\n- content opportunity ถ้าทำ campaign'}`;
  }

  function handleShoppingChannel(p, profile) {
    const channels = {
      P001: { Shopee: 70, 'TikTok Shop': 20, Watson: 5, Lazada: 3, Konvy: 1, Website: 1 },
      P002: { Shopee: 50, 'TikTok Shop': 30, Konvy: 10, Watson: 5, Website: 5, Lazada: 0 },
      P003: { Shopee: 60, Watson: 25, Konvy: 8, 'TikTok Shop': 5, Lazada: 2, Website: 0 },
      P004: { Website: 40, 'TikTok Shop': 35, Shopee: 15, Konvy: 5, Watson: 3, Lazada: 2 }
    };
    const ch = channels[p.id];
    let table = `**ช่องทางซื้อของ ${p.codename}**\n\n`;
    Object.entries(ch).sort((a,b) => b[1] - a[1]).forEach(([k, v]) => {
      table += `- ${k}: ${bar(v, 15)} ${pct(v)}\n`;
    });
    table += `\n**เหตุผลหลัก**\n`;
    table += p.id === 'P001' ? '- Shopee flash sale + voucher นักศึกษา\n- TikTok Shop ตอนดู live' :
             p.id === 'P002' ? '- Shopee เก็บ coin\n- TikTok Shop ตอนเห็น live ของ creator ที่ตาม' :
             p.id === 'P003' ? '- Shopee ซื้อตามรอบ + ของกลับมาจัดส่งเร็ว\n- Watson ถ้าของหมดด่วน' :
             '- ซื้อตรงเว็บ (ได้ของก่อน + support brand)\n- TikTok Shop เพื่อทำ affiliate';
    return table;
  }

  function handleReview(p, profile) {
    return `**แนวโน้มการรีวิวของ ${p.codename}**

- โอกาสรีวิวหลังซื้อ: ${bar(p.id === 'P004' ? 95 : profile.content_creation + profile.social_influence * 0.3)} ${pct(Math.round(p.id === 'P004' ? 95 : profile.content_creation + profile.social_influence * 0.3))}
- ช่องทางรีวิวหลัก: ${
    p.id === 'P001' ? 'TikTok 70%, Story IG 25%, ปากต่อปาก 5%' :
    p.id === 'P002' ? 'IG aesthetic 50%, TikTok 30%, Pantip 20%' :
    p.id === 'P003' ? 'Shopee review 60%, ปากต่อปาก 30%, Pantip 10%' :
    'TikTok 60%, IG 25%, YouTube 10%, Reels 5%'
  }
- ความซื่อสัตย์ของรีวิว: ${bar(p.id === 'P004' ? 92 : 80)} ${pct(p.id === 'P004' ? 92 : 80)}
- ระยะเวลาก่อนรีวิว: ${
    p.id === 'P001' ? '1–3 วัน (ตื่นเต้นรีวิวเลย)' :
    p.id === 'P002' ? '2 สัปดาห์ (ใช้แล้วค่อยตัดสิน)' :
    p.id === 'P003' ? '1 เดือน+ (ดูผลลัพธ์ระยะยาว)' :
    '2–7 วัน (PR cycle)'
  }

**โอกาสเป็น brand advocate (loyal + แนะนำต่อ): ${pct(Math.round((profile.brand_loyalty + profile.social_influence) / 2))}**`;
  }

  function handleComplaint(p, profile) {
    return `**Pain points ของ ${p.codename} ต่อ LA GLACE**

| ปัญหา | ระดับความหงุดหงิด |
|---|---|
| หา stock ยากในบางพื้นที่ | ${bar(p.id === 'P003' ? 75 : 50)} ${pct(p.id === 'P003' ? 75 : 50)} |
| Shade ให้เลือกน้อย | ${bar(p.id === 'P004' ? 70 : 55)} ${pct(p.id === 'P004' ? 70 : 55)} |
| Skincare line ยังน้อย | ${bar(p.id === 'P003' ? 85 : p.id === 'P002' ? 70 : 50)} ${pct(p.id === 'P003' ? 85 : p.id === 'P002' ? 70 : 50)} |
| Packaging ดูคล้ายกัน | ${bar(p.id === 'P002' ? 60 : 35)} ${pct(p.id === 'P002' ? 60 : 35)} |
| ราคา (ถ้าขึ้นในอนาคต) | ${bar(profile.price_sensitivity * 0.8)} ${pct(Math.round(profile.price_sensitivity * 0.8))} |

**ความน่าจะเป็นที่ pain point เหล่านี้จะทำให้ ${p.codename} เลิกซื้อ: ${pct(Math.round((100 - profile.brand_loyalty) * 0.6))}**

**สิ่งที่อยากให้แบรนด์แก้ก่อน:** ${
  p.id === 'P001' ? 'มี mini size ราคา ฿150–200 สำหรับน.ร.' :
  p.id === 'P002' ? 'transparency เรื่อง ingredient + sustainability' :
  p.id === 'P003' ? 'ขยาย skincare + วางขาย Watson ทุกสาขา' :
  'PR program สำหรับ micro-creator + early access'
}`;
  }

  function handleRecommend(p, profile) {
    const products = [
      { name: 'Black Magic Blush', score: { P001: 95, P002: 88, P003: 75, P004: 92 } },
      { name: 'Mini Airy Concealer', score: { P001: 85, P002: 80, P003: 90, P004: 85 } },
      { name: 'Toner Pad', score: { P001: 60, P002: 92, P003: 95, P004: 88 } },
      { name: 'Dazzling Glitter Duo', score: { P001: 70, P002: 65, P003: 35, P004: 90 } }
    ];
    let table = `**${p.codename} จะแนะนำสินค้าตัวไหนก่อน?**\n\n`;
    products.sort((a, b) => b.score[p.id] - a.score[p.id]).forEach((prod, i) => {
      table += `${i + 1}. ${prod.name}: ${bar(prod.score[p.id])} ${pct(prod.score[p.id])}\n`;
    });
    table += `\n**Top pick: ${products[0].name}**\n`;
    table += `เหตุผล: ${
      p.id === 'P001' ? 'ราคาเข้าถึงได้ + viral + เริ่มหัดแต่งหน้าง่ายที่สุด' :
      p.id === 'P002' ? 'ใช้ได้ทุกวัน ไม่ใช่ trend อย่างเดียว — value สูง' :
      p.id === 'P003' ? 'สร้าง routine skincare ระยะยาว เห็นผลจริง' :
      'content potential สูงสุด — pH-reactive ทำ before/after slay'
    }`;
    return table;
  }

  function handleWhyBrand(p, profile) {
    return `**ทำไม ${p.codename} ถึงเลือก LA GLACE**

| เหตุผล | น้ำหนัก |
|---|---|
| ราคาเข้าถึงได้ คุ้ม | ${bar(p.id === 'P001' ? 95 : 75)} ${pct(p.id === 'P001' ? 95 : 75)} |
| Aesthetic ไม่แมส มีเอกลักษณ์ | ${bar(p.id === 'P002' || p.id === 'P004' ? 90 : 60)} ${pct(p.id === 'P002' || p.id === 'P004' ? 90 : 60)} |
| แบรนด์ไทย ภูมิใจสนับสนุน | ${bar(70)} ${pct(70)} |
| Founder story เด็ก Gen Z inspire | ${bar(p.id === 'P002' ? 88 : 55)} ${pct(p.id === 'P002' ? 88 : 55)} |
| Viral บน TikTok ดูดีในรูป | ${bar(p.id === 'P001' || p.id === 'P004' ? 92 : 65)} ${pct(p.id === 'P001' || p.id === 'P004' ? 92 : 65)} |
| ผลลัพธ์ใช้แล้วดีจริง | ${bar(profile.brand_loyalty)} ${pct(profile.brand_loyalty)} |

**สรุปตัวตน "${p.codename}" ในฐานะลูกค้า LA GLACE**
- Loyalty score: ${bar(profile.brand_loyalty)} ${pct(profile.brand_loyalty)}
- Lifetime value (12 เดือน): ฿${profile.avg_spend * Math.round(profile.monthly_budget / profile.avg_spend) * 12 / 100 * 12}/ปี (ประมาณการ)
- โอกาสแนะนำเพื่อน: ${pct(Math.round((profile.brand_loyalty + profile.social_influence) / 2))}`;
  }

  function handleCollab(p, profile) {
    if (p.id !== 'P004') {
      return `**${p.codename} กับเรื่อง brand collab**

- ความสนใจ: ${bar(40)} ${pct(40)}
- ${p.codename} ไม่ใช่ creator แต่สนใจในฐานะผู้ติดตาม

**ถ้า LA GLACE collab ${p.codename} อยากเห็น:**
${p.id === 'P001' ? '- collab กับ TikToker ที่ตามอยู่ (ความน่าจะซื้อ +35%)\n- limited Y2K collection' :
  p.id === 'P002' ? '- collab กับศิลปิน underground / Korean indie\n- editorial photography campaign' :
  '- collab กับ professional makeup artist หรือแพทย์ผิวหนัง\n- focus practical, not gimmick'}`;
    }
    return `**Creator collab — มุมของเจน**

- ความสนใจที่จะ pitch: ${bar(95)} ${pct(95)}
- ความน่าจะรับ collab จาก LA GLACE: ${pct(98)}
- expected deliverables: TikTok 3-5 คลิป + IG carousel + Reels

**Negotiation power**
- Reach 15K — เข้าข่าย micro-influencer
- Engagement rate ~5–8% (สูงกว่า macro)
- ราคา PR-only: yes / paid post: ฿8,000–15,000/post (estimate)
- exclusivity: 30 วัน acceptable

**สิ่งที่เจนอยากให้แบรนด์ทำเพิ่ม**
- PR list ที่โปร่งใส มี criteria ชัดเจน
- early access สินค้าใหม่ก่อน launch 2 สัปดาห์
- creator community group สำหรับ feedback`;
  }

  function handleGeneral(p, profile, text) {
    return `**${p.codename} ตอบ:** ${reactionTone(p.id, 'neutral')}

จากข้อความที่ถามมา ระบบประมวลผลได้ดังนี้:

**ความน่าจะเป็นที่ ${p.codename} สนใจหัวข้อนี้: ${pct(Math.round((profile.research_depth + profile.brand_loyalty) / 2))}**

**Profile snapshot ที่เกี่ยวข้อง**
- ความ analytical: ${bar(profile.analytical_score)} ${pct(profile.analytical_score)}
- ความ trust ในข้อมูล: ${pct(profile.research_depth)}
- ความขี้สงสัย: ${pct(100 - profile.brand_loyalty)}

**ลองถามเฉพาะเจาะจงกว่านี้ดูได้** เช่น:
- "ราคา ${p.codename} ยอมจ่ายแค่ไหน?"
- "${p.codename} แนะนำสินค้าอะไรของ LA GLACE?"
- "${p.codename} เปรียบ LA GLACE กับ Romand ยังไง?"
- "${p.codename} อยากให้ออกอะไรใหม่?"
- "Pain point ของ ${p.codename} กับแบรนด์?"
`;
  }

  // ========== MAIN GENERATE ==========
  function generateResponse(persona, userText) {
    const profile = PROFILES[persona.id];
    const intents = detectIntents(userText);
    const top = intents[0].name;

    let body;
    switch (top) {
      case 'greeting': body = handleGreeting(persona, profile, userText); break;
      case 'price': body = handlePrice(persona, profile, userText); break;
      case 'buy_intent': body = handleBuyIntent(persona, profile, userText); break;
      case 'product_blush': body = handleProductBlush(persona, profile); break;
      case 'product_concealer': body = handleProductConcealer(persona, profile); break;
      case 'product_toner': body = handleProductToner(persona, profile); break;
      case 'product_glitter': body = handleProductGlitter(persona, profile); break;
      case 'new_product': body = handleNewProduct(persona, profile); break;
      case 'comparison': body = handleComparison(persona, profile); break;
      case 'ingredient': body = handleIngredient(persona, profile); break;
      case 'sustainability': body = handleSustainability(persona, profile); break;
      case 'shopping_channel': body = handleShoppingChannel(persona, profile); break;
      case 'review_intent': body = handleReview(persona, profile); break;
      case 'complaint': body = handleComplaint(persona, profile); break;
      case 'recommend': body = handleRecommend(persona, profile); break;
      case 'why_brand': body = handleWhyBrand(persona, profile); break;
      case 'collab': body = handleCollab(persona, profile); break;
      default: body = handleGeneral(persona, profile, userText);
    }

    return voiceWrap(persona.id, body);
  }

  return { generateResponse, detectIntents, PROFILES };
})();
