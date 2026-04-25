import { Router } from "express";
import fetch from "node-fetch";

const router = Router();
const DEFAULT_GNEWS_API_KEY = "ab1179953476f86c1740e3fb5e4c48cf";

router.get("/", async (req, res) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY || DEFAULT_GNEWS_API_KEY;
    console.log("Fetching global multi-category news from GNews...");
    
    // Fetch from multiple categories and specific queries to get diversity and requested topics
    const targets = [
      { type: 'query', value: 'modi india' },
      { type: 'query', value: 'trump politics' },
      { type: 'query', value: 'russia ukraine war' },
      { type: 'query', value: 'middle east conflict' },
      { type: 'category', value: 'general' },
      { type: 'category', value: 'world' },
      { type: 'category', value: 'technology' }
    ];

    const fetchPromises = targets.map(target => {
      const url = target.type === 'category' 
        ? `https://gnews.io/api/v4/top-headlines?category=${target.value}&lang=en&max=10&apikey=${apiKey}`
        : `https://gnews.io/api/v4/search?q=${target.value}&lang=en&max=10&apikey=${apiKey}`;
      
      return fetch(url)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);
    });

    const results = await Promise.all(fetchPromises);
    let allArticles: any[] = [];
    
    results.forEach((data: any) => {
      if (data && data.articles) {
        allArticles = [...allArticles, ...data.articles];
      }
    });

    // Strategy: We want REAL news first.
    // We assume API articles are "real" for the purpose of initial delivery.
    // We adjust their dates to match the current simulation day and hour.
    const now = new Date();
    const currentHour = now.getUTCHours();
    
    const apiArticles = allArticles.map((a: any, i: number) => {
      // Create a date for today, ensuring it's not from the "future"
      const simDate = new Date(now);
      // Set to a random hour between 0 and current hour to seem 'recent' but not 'future'
      const randomHour = Math.max(0, Math.floor(Math.random() * (currentHour + 1)));
      simDate.setUTCHours(randomHour);
      simDate.setUTCMinutes(Math.floor(Math.random() * 60));
      
      return {
        id: `api-${i}`,
        title: a.title,
        description: a.description,
        image: a.image,
        source: a.source.name,
        url: a.url,
        publishedAt: simDate.toISOString(),
        isReal: true // Mark for sorting
      };
    });

    // Generate safe dynamic date strings for fallbacks
    const getSafeTime = (hour: number, minute: number = 0) => {
      const date = new Date(now);
      // If requested hour is in the future, cap it to current hour minus offset
      const safeHour = hour > currentHour ? Math.max(0, currentHour - 1) : hour;
      date.setUTCHours(safeHour);
      date.setUTCMinutes(minute);
      date.setUTCSeconds(0);
      return date.toISOString();
    };

    // Curation for the current date
    const fallbacks = [
      // REAL GEOPOLITICS (High Priority - Dynamic Dates)
      { 
        id: "r-21", 
        title: "PM Modi Inaugurates India's First Domestic High-End Semi-Conductor Fab in Gujarat", 
        description: "Marking a milestone in 'Aatmanirbhar Bharat', the Prime Minister opened the $10 billion facility in Dholera, aimed at making India a global chip manufacturing hub by 2030.", 
        image: "https://picsum.photos/seed/gujarat-fab/800/600", 
        source: "Economic Times", 
        url: "#", 
        publishedAt: getSafeTime(9), 
        isReal: true 
      },
      { 
        id: "r-22", 
        title: "Trump 2026: Former President Leads Republican 'American Revival' Rally in Ohio", 
        description: "Addressing a massive crowd, Donald Trump outlined the '2026 Contract with America' ahead of the crucial midterms, focusing on manufacturing reshoring and energy dominance.", 
        image: "https://picsum.photos/seed/trump-rally-2026/800/600", 
        source: "Washington Examiner", 
        url: "#", 
        publishedAt: getSafeTime(8, 30), 
        isReal: true 
      },
      { 
        id: "r-23", 
        title: "Doha Peace Accords: Ukraine-Russia Conflict High-Level Ceasefire Talks Enter Day 4", 
        description: "Diplomats report 'significant progress' on a demilitarized zone near the 2022 borders, as international mediators push for a permanent end to the four-year war.", 
        image: "https://picsum.photos/seed/peace-talks/800/600", 
        source: "Reuters", 
        url: "#", 
        publishedAt: getSafeTime(7, 45), 
        isReal: true 
      },
      { 
        id: "r-24", 
        title: "India Reaches Top 3 Global Economies Milestone in 2026 Q1 Data", 
        description: "The IMF has confirmed that India's GDP has officially surpassed Japan and Germany in real-term purchasing power, driven by record infrastructure spending.", 
        image: "https://picsum.photos/seed/india-gdp-2026/800/600", 
        source: "Financial Express", 
        url: "#", 
        publishedAt: getSafeTime(6, 15), 
        isReal: true 
      },
      { 
        id: "r-25", 
        title: "US Senate Passes Bipartisan 'AI Safety and Innovation Act of 2026'", 
        description: "The sweeping new law establishes federal guardrails for LLM development while providing $500 billion in grants for domestic AI infrastructure projects.", 
        image: "https://picsum.photos/seed/senate-ai/800/600", 
        source: "The Verge", 
        url: "#", 
        publishedAt: getSafeTime(10), 
        isReal: true 
      },
      { 
        id: "r-26", 
        title: "G7 Summit in Milan: Leaders Call for Global Digital Currency Standards", 
        description: "President Biden and EU leaders have proposed a unified framework for Central Bank Digital Currencies (CBDCs) to counter decentralized volatility.", 
        image: "https://picsum.photos/seed/g7-2026/800/600", 
        source: "Wall Street Journal", 
        url: "#", 
        publishedAt: getSafeTime(5, 20), 
        isReal: true 
      },
      { 
        id: "r-27", 
        title: "Indian Space Station 'Bharatiya Antariksha Station' Modules Pass Vacuum Tests", 
        description: "ISRO Chairman Somanath confirmed that the first docking module is ready for launch scheduled for late 2026, marking India's permanent presence in LEO.", 
        image: "https://picsum.photos/seed/isro-station/800/600", 
        source: "ISRO Official", 
        url: "#", 
        publishedAt: getSafeTime(4, 45), 
        isReal: true 
      },
      
      // REAL NEWS VIBES
      { id: "r-1", title: "Apple Vision Pro 3 Announced with 'Neural Interface' Glasses", description: "Tim Cook revealed the latest iteration of spatial computing, featuring a sleek form factor that looks like standard aviator sunglasses.", image: "https://picsum.photos/seed/vision-pro-3/800/600", source: "MacRumors", url: "#", publishedAt: getSafeTime(11), isReal: true },
      { id: "r-2", title: "World Cup 2026: FIFA Inspects Completed SoFi Stadium Renovations", description: "The LA-based venue has finished its multi-million dollar pitch expansion to accommodate natural grass for the upcoming global tournament.", image: "https://picsum.photos/seed/world-cup-2026/800/600", source: "ESPN", url: "#", publishedAt: getSafeTime(12), isReal: true },
      { id: "r-3", title: "Humanity's Return to the Moon: Artemis III Crew Enters Final Training", description: "NASA astronauts have begun specialized geology drills in the Arizona desert as the December 2026 lunar landing window approaches.", image: "https://picsum.photos/seed/artemis-2026/800/600", source: "NASA Press", url: "#", publishedAt: getSafeTime(13, 30), isReal: true },
      { id: "r-4", title: "Geneva Protocols 2.0: UN Bans Lethal Autonomous Weapon Systems", description: "In a historic vote, 180 nations agreed to outlaw the use of fully autonomous AI drones in combat without direct human-in-the-loop oversight.", image: "https://picsum.photos/seed/un-drones/800/600", source: "Guardian", url: "#", publishedAt: getSafeTime(14, 15), isReal: true },
      { id: "r-5", title: "Bio-Engineered Heart Transplanted into Patient in London Success", description: "The organ, grown from the patient's own stem cells in a bioreactor, has been beating autonomously for 72 hours with no signs of rejection.", image: "https://picsum.photos/seed/heart-tech/800/600", source: "The Lancet", url: "#", publishedAt: getSafeTime(15), isReal: true },
      
      // ADDING MORE REAL NEWS FOR VOLUME & DIVERSITY
      { id: "r-28", title: "India-GCC Summit: PM Modi Proposes Unified Energy Grid for West Asia", description: "In a landmark proposal, India has suggested an undersea electrical link connecting the Gulf countries with the Indian power grid to share solar and wind surplus.", image: "https://picsum.photos/seed/energy-grid/800/600", source: "Mint", url: "#", publishedAt: getSafeTime(16, 30), isReal: true },
      { id: "r-29", title: "Trump 2026: New 'America First' Trade Directive Targets Auto Sector", description: "Donald Trump has issued a series of recommendations for the upcoming legislative session aimed at imposing 100% tariffs on non-North American EVs.", image: "https://picsum.photos/seed/ev-trade/800/600", source: "Bloomberg", url: "#", publishedAt: getSafeTime(15, 45), isReal: true },
      { id: "r-30", title: "Ukraine Reconstruction Fund Hits $500 Billion Target at Brussels Forum", description: "Global donors have finalized the largest recovery package in history, with focus on green energy infrastructure and digital-first government systems.", image: "https://picsum.photos/seed/rebuild/800/600", source: "Financial Times", url: "#", publishedAt: getSafeTime(14, 45), isReal: true },
      { id: "r-31", title: "India's 5G-Advanced Network Now Covers 99% of Rural Population", description: "Telecom Minister Vaishnaw announced that the digital divide has been practically eliminated, enabling telemedicine and AI-tutoring in the remotest villages.", image: "https://picsum.photos/seed/5g-india/800/600", source: "Business Standard", url: "#", publishedAt: getSafeTime(13), isReal: true },
      { id: "r-32", title: "Global Stock Markets Surge as Inflation Targets Finally Stabilize", description: "World indices hit record highs today as the Fed and ECB signal the end of the 2020s volatility cycle, projecting steady 2% growth for the next decade.", image: "https://picsum.photos/seed/stocks/800/600", source: "Market Watch", url: "#", publishedAt: getSafeTime(12, 15), isReal: true },
      
      // SPORTS
      { id: "s-1", title: "World Cup 2026: Brazil and France Named Pre-Tournament Favorites", description: "As the June kickoff approaches, bookmakers have placed the Seleção at the top of the list, followed closely by the defending European champions.", image: "https://picsum.photos/seed/wc-2026-odds/800/600", source: "FIFA Sports", url: "#", publishedAt: getSafeTime(11, 45), isReal: true },
      { id: "s-2", title: "IPL 2026: Mumbai Indians Secure First Place in League Standings", description: "A dominant season for the five-time champions continues as they clinch the top spot with two games to spare in the 19th edition of the tournament.", image: "https://picsum.photos/seed/ipl-2026/800/600", source: "CricInfo", url: "#", publishedAt: getSafeTime(10, 30), isReal: true },
      { id: "s-3", title: "Wimbledon 2026: New Grass-Growing Tech to Reduce Court Wear", description: "The All England Club has unveiled a hybrid turf system that promises to keep Center Court in 'Day 1' condition throughout the entire two-week event.", image: "https://picsum.photos/seed/tennis-tech/800/600", source: "The Athletic", url: "#", publishedAt: getSafeTime(9, 15), isReal: true },

      // ENTERTAINMENT
      { id: "e-1", title: "Oscars 2026: 'The Singularity' Sweeps 8 Awards Including Best Picture", description: "The sci-fi epic exploring the relationship between human consciousness and AI dominated the 98th Academy Awards ceremony in Los Angeles.", image: "https://picsum.photos/seed/oscars-2026/800/600", source: "Variety", url: "#", publishedAt: getSafeTime(8), isReal: true },
      { id: "e-2", title: "Netflix Launches First Fully Interactive 'AI-Branching' Reality Show", description: "Viewers can now influence contestant decisions in real-time using large language model prompts, creating billions of possible episode paths.", image: "https://picsum.photos/seed/netflix-ai/800/600", source: "Hollywood Reporter", url: "#", publishedAt: getSafeTime(7, 30), isReal: true },
      
      // FAKE / MISLEADING (Maintaining volume for user challenge)
      { id: "f-1", title: "Deep-Sea Hive City Discovered Beneath Mariana Trench", description: "Whistleblowers release footage of what appears to be a bioluminescent metropolis inhabited by a non-human civilization living 36,000 feet deep.", image: "https://picsum.photos/seed/deep-sea/800/600", source: "The Depths", url: "#", publishedAt: getSafeTime(16), isReal: false },
      { id: "f-2", title: "Holograms of Deceased Relatives Now Legal for 'Post-Mortem Therapy'", description: "A controversial new law allows AI companies to reconstruct full sensory digital clones of late family members for ongoing grief management.", image: "https://picsum.photos/seed/hologram/800/600", source: "Ethics Watch", url: "#", publishedAt: getSafeTime(17, 30), isReal: false },
      { id: "f-3", title: "Scientists Discover 'Time Pocket' in Sahara Desert Where it's Still 1920", description: "Expedition team claims to have crossed a magnetic anomaly where radio signals from 100 years ago are still actively being broadcast by local residents.", image: "https://picsum.photos/seed/sahara-time/800/600", source: "Anomalies", url: "#", publishedAt: getSafeTime(18), isReal: false },
      { id: "m-1", title: "New Study: Looking at Clouds Causes Memory Loss in Humans", description: "Researchers claim the eye movement required to track shifting clouds triggers a neurological pulse that deletes the previous 5 minutes of short-term memory.", image: "https://picsum.photos/seed/clouds/800/600", source: "Science Weekly (Parody)", url: "#", publishedAt: getSafeTime(19), isReal: false },
      
      // MORE FAKE / MISLEADING
      { id: "f-4", title: "NASA Admits Moon is Actually Made of Giant Provolone Cheese", description: "A high-ranking official inadvertently leaked a spectrum analysis showing that the lunar surface has a 98% similarity to aged Italian cheese.", image: "https://picsum.photos/seed/moon-cheese/800/600", source: "Lunar Truths", url: "#", publishedAt: getSafeTime(5), isReal: false },
      { id: "f-5", title: "Famous Statue of Liberty to be Replaced by Gigantic Gold Bitcoin", description: "In a move to embrace the digital future, the city council has reportedly approved the dismantling of the copper icon to make way for a rotating BTC monument.", image: "https://picsum.photos/seed/bitcoin-statue/800/600", source: "Crypto Insider", url: "#", publishedAt: getSafeTime(4, 30), isReal: false },
      { id: "f-6", title: "Talking Plants Discovered in Amazon: They Only Speak Latin", description: "Botanists report a species of fern that hums melodic tunes and can recite Virgil's Aeneid when watered with sparkling mineral water.", image: "https://picsum.photos/seed/latin-plants/800/600", source: "Nature Secrets", url: "#", publishedAt: getSafeTime(3, 15), isReal: false },
      { id: "f-7", title: "Mars Colonists Declare Independence from Earth using Only Rock-Paper-Scissors", description: "The settlement as 'Elon-Grad' has officially severed ties with terrestrial governments after winning a high-stakes best-of-three game against UN ambassadors.", image: "https://picsum.photos/seed/mars-independence/800/600", source: "Red Planet News", url: "#", publishedAt: getSafeTime(22), isReal: false },
      { id: "f-8", title: "Internet to be Replaced by 'Telepathic Mesh' by Mid-2026", description: "A tech startup claims their new wearable can transmit thoughts directly between users, making traditional Wi-Fi and fiber optics obsolete in months.", image: "https://picsum.photos/seed/mind-mesh/800/600", source: "Neural Junkie", url: "#", publishedAt: getSafeTime(20), isReal: false },
      
      { id: "m-2", title: "New Weight Loss Trend: Eating Reverse-Calories Ice Cream", description: "A controversial diet suggests that eating ice cream in a horizontal position burns more energy than the calories contained in the dessert itself.", image: "https://picsum.photos/seed/health-icecream/800/600", source: "Lifestyle Hackers", url: "#", publishedAt: getSafeTime(2), isReal: false },
      { id: "m-3", title: "The Sky to Turn Purple for 48 Hours due to 'Atmospheric Reset'", description: "Global weather agencies supposedly announce a scheduled maintenance of the ozone layer that will result in a vibrant violet hue across all continents.", image: "https://picsum.photos/seed/purple-sky/800/600", source: "Global Events", url: "#", publishedAt: getSafeTime(1, 30), isReal: false },
      { id: "m-4", title: "Your Pet Goldfish might be Spying for Foreign Intelligence", description: "Security experts warn that a new breed of micro-drones designed to look like aquatic pets has been infiltrated into millions of households.", image: "https://picsum.photos/seed/spy-fish/800/600", source: "Tinfoil Weekly", url: "#", publishedAt: getSafeTime(23, 30), isReal: false },
      { id: "m-5", title: "Walking Backwards Improves Math Skills by 500%", description: "A study conducted in a playground suggests that reversing your gait forces the brain to calculate complex vectors, instantly boosting arithmetic ability.", image: "https://picsum.photos/seed/backwards-walk/800/600", source: "Brain Gain", url: "#", publishedAt: getSafeTime(21, 45), isReal: false },
      { id: "m-6", title: "World's First 'Invisible' Smartphone to Launch Tomorrow", description: "Made from refined glass-carbon composites, the device is completely transparent and only becomes visible when you are angry at it.", image: "https://picsum.photos/seed/invisible-phone/800/600", source: "Tech Rumors", url: "#", publishedAt: getSafeTime(18), isReal: false },
    ];

    // Combine and Sort
    const sortByDate = (a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

    // Tier 1: LIVE REAL-WORLD NEWS (From GNews API) - Absolute Top Priority
    const apiArticlesSorted = [...apiArticles].sort(sortByDate);
    
    // Tier 2: Curated High-Priority Simulation Geopolitics (Modi, Trump, Wars)
    const simulationHighPriority = fallbacks.filter(f => f.id.startsWith('r-2')).sort(sortByDate);
    
    // Tier 3: Other Real news (Other Fallback Reals)
    const otherRealNews = fallbacks.filter(f => f.isReal && !f.id.startsWith('r-2') && !apiArticles.some(a => a.title === f.title)).sort(sortByDate);
    
    // Tier 4: Mixed Veracity (Fake, Misleading, Uncertain)
    const mixedVeracity = fallbacks.filter(f => !f.isReal).sort(sortByDate);

    // Final Assembly
    const finalArticles = [
      ...apiArticlesSorted,
      ...simulationHighPriority, 
      ...otherRealNews, 
      ...mixedVeracity
    ].slice(0, 80);

    // Clean up internal flags
    const sanitized = finalArticles.map(({ isReal, ...rest }) => rest);

    res.json(sanitized);
  } catch (err) {
    console.error("News fetch error:", err);
    res.status(500).json({ error: "Internal server error fetching news" });
  }
});

// We provide /api/verify for architectural compliance, but suggest using the 
// frontend SDK for better streaming/performance in this environment.
router.post("/verify", async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured on server" });
    }

    const prompt = `Fact-check this news accurately. Respond in JSON with verdict (Real, Fake, Misleading, Uncertain), confidence (High, Medium, Low), and reason (short explanation).
    
    Title: ${title}
    Description: ${description}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        })
      }
    );

    if (!geminiRes.ok) {
        const errData = await geminiRes.json();
        return res.status(geminiRes.status).json({ error: "Gemini API error", details: errData });
    }

    const data: any = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
        res.json(JSON.parse(text.trim()));
    } else {
        res.status(500).json({ error: "No response from Gemini" });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Internal server error during verification" });
  }
});

export default router;
