// Editorial Portrait Generator — SVG illustrations in fashion-magazine style
// Deterministic from persona attributes (id, name, segment, age, role)
// Used by both chat personas (personas.js) and survey personas (survey-personas.js)

window.PortraitGen = (function() {

  // ============================================================
  // PALETTES — editorial magazine illustrative style
  // ============================================================
  const SKIN = ["#f3d5b5", "#e8b89a", "#d5a079", "#b8835a"];

  const HAIR_COLOR = [
    "#1a1718", // black
    "#3d2820", // very dark brown
    "#5a3a2a", // dark brown
    "#8b5a36", // medium brown
    "#a87c4a", // light brown
    "#d9a868", // honey blonde
    "#c84a2e", // auburn red (Y2K dye)
    "#e89cb8", // pink dye
    "#d63384"  // hot pink
  ];

  const LIP = [
    "#c8341a", // editorial red (LA GLACE Ph Blush ref)
    "#a02a3a", // wine
    "#d4566c", // warm pink
    "#e88090", // soft coral
    "#9b3a55"  // berry
  ];

  // ============================================================
  // DETERMINISTIC HASH (sum of char codes) → pick from arrays
  // ============================================================
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function pick(arr, seed) {
    return arr[seed % arr.length];
  }

  // ============================================================
  // HAIR SHAPES — return {back, front} SVG path elements
  // ============================================================
  const HAIR_STYLES = [
    // 0 — long straight
    {
      back: (c) => `<path d="M 50 95 Q 50 70 100 65 Q 150 70 150 95 L 158 175 Q 145 185 100 185 Q 55 185 42 175 Z" fill="${c}"/>`,
      front: (c) => `<path d="M 62 88 Q 80 60 100 62 Q 122 60 138 88 L 134 100 Q 120 85 100 84 Q 80 85 66 100 Z" fill="${c}"/>`
    },
    // 1 — bob
    {
      back: (c) => `<path d="M 56 95 Q 56 68 100 65 Q 144 68 144 95 L 144 140 Q 122 145 100 145 Q 78 145 56 140 Z" fill="${c}"/>`,
      front: (c) => `<path d="M 64 90 Q 82 62 100 64 Q 122 62 136 92 L 132 102 Q 116 90 100 90 Q 84 90 68 102 Z" fill="${c}"/>`
    },
    // 2 — ponytail (high)
    {
      back: (c) => `<path d="M 60 90 Q 60 68 100 65 Q 140 68 140 90 L 138 130 Q 120 140 100 140 Q 80 140 62 130 Z M 100 50 Q 115 45 118 60 Q 115 78 100 75 Q 85 78 82 60 Q 85 45 100 50 Z" fill="${c}"/>`,
      front: (c) => `<path d="M 68 92 Q 84 70 100 70 Q 116 70 132 92 L 128 100 Q 114 88 100 88 Q 86 88 72 100 Z" fill="${c}"/>`
    },
    // 3 — short pixie
    {
      back: (c) => `<path d="M 62 92 Q 62 70 100 67 Q 138 70 138 92 L 138 122 Q 120 125 100 125 Q 80 125 62 122 Z" fill="${c}"/>`,
      front: (c) => `<path d="M 66 86 Q 86 62 100 66 Q 118 62 134 90 L 128 98 Q 114 86 100 86 Q 84 86 72 98 Z" fill="${c}"/>`
    },
    // 4 — top bun
    {
      back: (c) => `<path d="M 60 95 Q 60 70 100 67 Q 140 70 140 95 L 138 138 Q 120 145 100 145 Q 80 145 62 138 Z" fill="${c}"/>`,
      front: (c) => `<circle cx="100" cy="50" r="14" fill="${c}"/><path d="M 70 92 Q 86 68 100 70 Q 116 68 130 92 L 126 100 Q 112 88 100 88 Q 88 88 74 100 Z" fill="${c}"/>`
    },
    // 5 — curly bob with bangs
    {
      back: (c) => `<path d="M 54 95 Q 54 68 100 65 Q 146 68 146 95 L 144 145 Q 122 152 100 152 Q 78 152 56 145 Z" fill="${c}"/>`,
      front: (c) => `<path d="M 64 90 Q 78 64 100 62 Q 122 64 136 90 L 132 100 Q 118 80 100 82 Q 82 80 68 100 Z" fill="${c}"/><circle cx="62" cy="105" r="10" fill="${c}"/><circle cx="138" cy="105" r="10" fill="${c}"/>`
    },
    // 6 — center part long
    {
      back: (c) => `<path d="M 50 92 Q 50 68 100 65 Q 150 68 150 92 L 158 178 Q 130 186 100 186 Q 70 186 42 178 Z" fill="${c}"/>`,
      front: (c) => `<path d="M 60 88 Q 76 60 100 62 L 100 88 Q 86 88 68 100 Z M 140 88 Q 124 60 100 62 L 100 88 Q 114 88 132 100 Z" fill="${c}"/>`
    }
  ];

  // ============================================================
  // ACCESSORIES
  // ============================================================
  function sunglasses(color = "#1a1718") {
    return `<g><rect x="74" y="100" width="22" height="11" rx="2" fill="${color}"/><rect x="104" y="100" width="22" height="11" rx="2" fill="${color}"/><line x1="96" y1="106" x2="104" y2="106" stroke="${color}" stroke-width="2"/></g>`;
  }

  function eyes(color = "#1a1718") {
    return `<g>
      <line x1="78" y1="95" x2="90" y2="93" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="110" y1="93" x2="122" y2="95" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="86" cy="106" rx="2.4" ry="3.2" fill="${color}"/>
      <ellipse cx="114" cy="106" rx="2.4" ry="3.2" fill="${color}"/>
    </g>`;
  }

  function earring(color = "#b08d57") {
    return `<circle cx="60" cy="128" r="3" fill="${color}"/>`;
  }

  function blush(color) {
    return `<ellipse cx="76" cy="124" rx="6" ry="4" fill="${color}" opacity="0.5"/><ellipse cx="124" cy="124" rx="6" ry="4" fill="${color}" opacity="0.5"/>`;
  }

  // ============================================================
  // PORTRAIT GENERATOR
  // ============================================================
  function generate(persona, opts = {}) {
    const size = opts.size || 120;
    const seed = hash(persona.id + (persona.name || persona.codename || ""));

    // Skin: derive from seed (no real-world mapping, just visual variety)
    const skin = SKIN[seed % SKIN.length];

    // Hair style + color
    const hairStyle = HAIR_STYLES[(seed >> 3) % HAIR_STYLES.length];
    const hairColor = HAIR_COLOR[(seed >> 5) % HAIR_COLOR.length];

    // Lip
    const lipColor = LIP[(seed >> 7) % LIP.length];

    // Background — use segment color, persona-specific color, or default ink
    let bg = opts.bg;
    if (!bg) {
      if (persona.segment_id && window.LA_GLACE_SURVEY) {
        const seg = window.LA_GLACE_SURVEY.getSegment(persona.segment_id);
        bg = seg ? seg.color : "#1a1718";
      } else if (persona.avatar_color) {
        bg = persona.avatar_color;
      } else {
        bg = "#1a1718";
      }
    }

    // Accessory — based on role/age/segment
    const isInfluencer = persona.segment_id === "influencer_entrepreneur"
      || /creator|influencer|reseller|live/i.test(persona.role || "");
    const isPro = persona.segment_id === "strategic_pro"
      || persona.segment_id === "balanced_lifestyle";
    const wearSunglasses = (seed >> 9) % 5 === 0 || (isInfluencer && (seed >> 11) % 3 === 0);
    const hasEarring = (seed >> 11) % 2 === 0;

    // Compose SVG
    const svg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" style="display:block;">
      <defs>
        <clipPath id="clip-${persona.id}">
          <rect width="200" height="200"/>
        </clipPath>
      </defs>
      <g clip-path="url(#clip-${persona.id})">
        <rect width="200" height="200" fill="${bg}"/>

        <!-- subtle paper texture -->
        <rect width="200" height="200" fill="url(#noise)" opacity="0.04"/>

        <!-- shoulder/torso silhouette -->
        <path d="M 30 200 Q 30 165 100 158 Q 170 165 170 200 Z" fill="rgba(255,255,255,0.12)"/>

        <!-- neck -->
        <rect x="90" y="148" width="20" height="20" fill="${skin}"/>

        <!-- hair back -->
        ${hairStyle.back(hairColor)}

        <!-- face -->
        <ellipse cx="100" cy="110" rx="38" ry="46" fill="${skin}"/>

        <!-- hair front -->
        ${hairStyle.front(hairColor)}

        ${blush(lipColor)}

        ${wearSunglasses ? sunglasses() : eyes()}

        <!-- nose hint -->
        <path d="M 99 115 Q 97 122 99 126 Q 101 127 102 124" fill="none" stroke="${skin}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>

        <!-- lips -->
        <path d="M 92 134 Q 100 138 108 134 Q 100 142 92 134 Z" fill="${lipColor}"/>

        ${hasEarring ? earring() : ""}

      </g>
    </svg>`;

    return svg;
  }

  // ============================================================
  // HELPERS — render to <img>-equivalent inline SVG, get colors
  // ============================================================
  function dataUri(persona, opts) {
    const svg = generate(persona, opts);
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function getSegmentBg(personaOrSegId) {
    if (!window.LA_GLACE_SURVEY) return "#1a1718";
    const segId = typeof personaOrSegId === "string"
      ? personaOrSegId
      : personaOrSegId.segment_id;
    const seg = window.LA_GLACE_SURVEY.getSegment(segId);
    return seg ? seg.color : "#1a1718";
  }

  return { generate, dataUri, getSegmentBg };
})();
