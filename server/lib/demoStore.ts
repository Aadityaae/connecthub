// server/lib/demoStore.ts
// A simple in-memory store to allow the app to work in "Demo Mode" without MongoDB

// Helper to simulate MongoDB-like IDs
export const generateId = () => Math.random().toString(36).substring(2, 15);

// Initial suggested users
const genres = ["Tech", "Photography", "Travel", "Food", "Art"];
const usernames = ["tech_guru", "lens_master", "wanderer", "foodie_delight", "art_gallery"];
const initialSuggested = genres.map((genre, i) => ({
  _id: `suggested_${i}`,
  username: usernames[i],
  email: `${genre.toLowerCase()}@example.com`,
  password: "password",
  profilePicture: [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
  ][i],
  bio: `The best of ${genre} content! ✨`,
  genre: genre,
  followers: [],
  following: [],
  isSuggested: true,
  createdAt: new Date()
}));

const celebrities = [
  {
    _id: "celeb_1",
    username: "leomessi",
    email: "messi@example.com",
    password: "password",
    profilePicture: "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=200&auto=format&fit=crop",
    bio: "Leo Messi. Welcome to my official ConnectHub account. ⚽️🏆",
    followers: [],
    following: [],
    isSuggested: true,
    createdAt: new Date()
  },
  {
    _id: "celeb_2",
    username: "cristiano",
    email: "ronaldo@example.com",
    password: "password",
    profilePicture: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=200&auto=format&fit=crop",
    bio: "Cristiano Ronaldo. SIUUUU! ⚽️🔥",
    followers: [],
    following: [],
    isSuggested: true,
    createdAt: new Date()
  },
  {
    _id: "celeb_3",
    username: "selenagomez",
    email: "selena@example.com",
    password: "password",
    profilePicture: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop",
    bio: "Selena Gomez. Rare Beauty. ✨💖",
    followers: [],
    following: [],
    isSuggested: true,
    createdAt: new Date()
  },
  {
    _id: "celeb_4",
    username: "therock",
    email: "therock@example.com",
    password: "password",
    profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    bio: "Dwayne Johnson. Mana. Gratitude. Tequila. 🥃💪",
    followers: [],
    following: [],
    isSuggested: true,
    createdAt: new Date()
  }
];

export const demoUsers: any[] = [...initialSuggested, ...celebrities];

// Helper to generate large numbers of mock IDs for likes
const generateLikes = (count: number) => Array.from({ length: count }, () => `user_${Math.floor(Math.random() * 100000)}`);

// Mock comments for variety
const mockCommentPool = [
  "This is absolutely stunning! 😍",
  "Wow, I need to know how you did this!",
  "The GOAT doing GOAT things 🐐",
  "Absolute fire! 🔥🔥🔥",
  "Can't wait for your next update!",
  "This is why I follow you.",
  "Incredible work as always.",
  "Settings/Lens specs please? 🙏",
  "This place looks like a dream.",
  "Pure motivation right here. 💪",
  "Nature is so beautiful.",
  "A masterpiece! 🎨",
  "Love the energy here ✨",
  "Great shot! Which camera?",
  "This is high key amazing."
];

const generateComments = (count: number) => {
  return Array.from({ length: count }, () => {
    const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    return {
      _id: generateId(),
      author: {
        _id: randomUser._id,
        username: randomUser.username,
        profilePicture: randomUser.profilePicture
      },
      content: mockCommentPool[Math.floor(Math.random() * mockCommentPool.length)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000))
    };
  });
};

// Generate many more random posts to simulate "infinite" content in demo mode
export const generateInfinitePosts = (page: number, limit: number) => {
  const contentLibrary = [
    {
      topic: "nature",
      captions: [
        "Lost in the serenity of the wild. 🌲✨ There's no better place to recharge than under the open sky. #nature #wilderness #peace #adventure",
        "The mountains are calling, and I must go. 🏔️ Every hike brings a new perspective. #hiking #outdoors #mountainlife #explore",
        "Crystal clear waters and golden sand. 🌊 Living for these beach days. #oceanlife #summer #beachvibes #travel",
        "Woke up to the sound of local birds and the smell of fresh pine. 🍃 Pure bliss. #morning #naturegram #recharging"
      ],
      keywords: ["forest", "mountain", "beach", "lake", "waterfall", "sunset"]
    },
    {
      topic: "architecture",
      captions: [
        "The lines and curves of modern architecture never cease to amaze me. 📐 A true testament to human creativity. #architecture #design #modern #urban",
        "Walking through history. 🏛️ The detail in these old cathedrals is mind-blowing. #history #heritage #classic #europe",
        "City lights and skyscraper nights. 🏙️ The urban landscape is its own kind of beautiful. #cityscape #skyline #metropolis #night",
        "Minimalism in structure. 🏢 Finding beauty in simplicity and function. #minimalism #urbanart #building"
      ],
      keywords: ["building", "skyscraper", "interiors", "city", "structure"]
    },
    {
      topic: "fashion",
      captions: [
        "Style is a way to say who you are without having to speak. 👗 Today's mood: Bold and Minimal. #fashion #style #ootd #outfit",
        "Confidence is the best accessory. 👠 Rocking this new look for the weekend! #fashionblogger #lifestyle #glam #trend",
        "Monochrome magic. 🖤 Sometimes keeping it simple is the most powerful statement. #minimalstyle #blackandwhite #chic",
        "Street style vibes. 👟 Comfort meets cool in the city. #streetwear #urbanstyle #dailylook"
      ],
      keywords: ["fashion", "model", "outfit", "accessory", "clothing"]
    },
    {
      topic: "tech",
      captions: [
        "Finally upgraded my workstation! 💻 The productivity boost is real. What's your setup like? #tech #setup #gaming #developer",
        "The future is AI, and we're just getting started. 🤖 Exploring new frontiers in deep learning today. #ai #machinelearning #innovate",
        "Clean circuits and high performance. ⚡ There's something beautiful about well-engineered hardware. #coding #hardware #engineering",
        "New gadget day! 📱 Can't wait to test out the camera specs on this one. #unboxing #gadget #mobile"
      ],
      keywords: ["computer", "code", "gadget", "setup", "technology"]
    },
    {
      topic: "cars",
      captions: [
        "Nothing beats the thrill of the open road. 🏎️ Speed and elegance in perfect harmony. #supercar #luxury #drive #fastcar",
        "Classic beauty. 🚘 They just don't make them like they used to. Absolute vintage perfection. #classiccars #vintage #restoration",
        "Shift into high gear. 🏁 Today's ride is feeling incredibly responsive. #racing #trackday #automotive",
        "Sunset drives are a different kind of therapy. 🌆 The engine purr and the city view. #nightdrive #cars #lifestyle"
      ],
      keywords: ["car", "sports-car", "classic-car", "driving", "engine"]
    }
  ];

  const extraPosts = Array.from({ length: limit }, (_, i) => {
    const randomTopic = contentLibrary[Math.floor(Math.random() * contentLibrary.length)];
    const caption = randomTopic.captions[Math.floor(Math.random() * randomTopic.captions.length)];
    const keyword = randomTopic.keywords[Math.floor(Math.random() * randomTopic.keywords.length)];
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const id = `infinite_${page}_${i}_${Math.floor(Math.random()*1000)}`;
    const lock = Math.floor(Math.random() * 1000000);
    
    return {
      _id: id,
      author: {
        _id: `user_${Math.floor(Math.random() * 1000)}`,
        username: username,
        profilePicture: `https://i.pravatar.cc/150?u=${username}`
      },
      content: caption,
      image: `https://loremflickr.com/1000/1000/${keyword}?lock=${lock}`,
      likes: generateLikes(Math.floor(Math.random() * 5000)),
      comments: generateComments(Math.floor(Math.random() * 15)),
      createdAt: new Date(Date.now() - (page * 3600000) - (i * 600000))
    };
  });
  return extraPosts;
};

export const demoPosts: any[] = [
  ...celebrities.map((celeb, i) => {
    const celebCaptions = [
      "Campeones del mundo!!! 🇦🇷🏆 Still can't believe it. Thank you for all the support. #messi #worldcup #argentina",
      "Hard work pays off. ⚽️🔥 Never stop dreaming. #ronaldo #siuuu #football #motivation",
      "Rare Beauty launch day! ✨ So excited to share this with you all. #selena #beauty #launch",
      "Late night gym session. 🏋️‍♂️ The iron never lies. Stay hungry, stay humble. #therock #gym #motivation #hardwork"
    ];
    const celebImages = [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"
    ];
    return {
      _id: `celeb_post_${i}`,
      author: {
        _id: celeb._id,
        username: celeb.username,
        profilePicture: celeb.profilePicture
      },
      content: celebCaptions[i % celebCaptions.length],
      image: celebImages[i % celebImages.length],
      likes: generateLikes(50000 + Math.floor(Math.random() * 20000)),
      comments: generateComments(20 + Math.floor(Math.random() * 30)),
      createdAt: new Date(Date.now() - (i * 3600000))
    };
  }),
  ...generateInfinitePosts(0, 60)
];

export const demoMessages: any[] = [];
export const demoComments: any[] = [];
export const demoReels: any[] = [
  {
    _id: "reel_1",
    author: { _id: "celeb_1", username: "leomessi", profilePicture: "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=200&auto=format&fit=crop" },
    videoUrl: "https://v1.pinimg.com/videos/mc/720p/f6/3d/76/f63d767597304446356a69eb1a8bc651.mp4",
    caption: "Training day! ⚽️🔥 #messi #football #training",
    likes: ["user_1", "user_2"],
    category: "Sports",
    createdAt: new Date()
  },
  {
    _id: "reel_2",
    author: { _id: "celeb_2", username: "cristiano", profilePicture: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=200&auto=format&fit=crop" },
    videoUrl: "https://v1.pinimg.com/videos/mc/720p/81/25/89/81258957416309871630987163098716.mp4",
    caption: "No days off. 💪🔥 #ronaldo #fitness #motivation",
    likes: ["user_3"],
    category: "Fitness",
    createdAt: new Date()
  },
  {
    _id: "reel_3",
    author: { _id: "suggested_2", username: "wanderer", profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
    videoUrl: "https://v1.pinimg.com/videos/mc/720p/22/9d/22/229d2204321043210432104321043210.mp4",
    caption: "Sunset vibes in paradise. 🌊🌅 #travel #beach #sunset",
    likes: [],
    category: "Travel",
    createdAt: new Date()
  },
  {
    _id: "reel_4",
    author: { _id: "suggested_0", username: "tech_guru", profilePicture: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
    videoUrl: "https://v1.pinimg.com/videos/mc/720p/11/22/33/11223344556677889900aabbccddeeff.mp4",
    caption: "Clean setup for maximum focus. 💻✨ #tech #setup #productivity",
    likes: [],
    category: "Tech",
    createdAt: new Date()
  },
  {
    _id: "reel_5",
    author: { _id: "celeb_4", username: "therock", profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" },
    videoUrl: "https://v1.pinimg.com/videos/mc/720p/aa/bb/cc/aabbccddeeff00112233445566778899.mp4",
    caption: "Stay hungry. Stay humble. 💪🥃 #therock #gym #motivation",
    likes: [],
    category: "Fitness",
    createdAt: new Date()
  },
  {
    _id: "reel_6",
    author: { _id: "movie_1", username: "dhurandhar_films", profilePicture: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=200&auto=format&fit=crop" },
    videoUrl: "https://v1.pinimg.com/videos/mc/720p/ff/ee/dd/ffeeddccbbaa00998877665544332211.mp4",
    caption: "Dhurandhar Action! 🎬🔥 #dhurandhar #movie #action",
    likes: ["user_1"],
    category: "Movies",
    createdAt: new Date()
  },
  {
    _id: "reel_7",
    author: { _id: "movie_2", username: "interstellar_fan", profilePicture: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=200&auto=format&fit=crop" },
    videoUrl: "https://v1.pinimg.com/videos/mc/720p/99/88/77/99887766554433221100aabbccddeeff.mp4",
    caption: "Do not go gentle into that good night. ✨🚀 #interstellar #space #movie",
    likes: ["user_2"],
    category: "Movies",
    createdAt: new Date()
  },
  {
    _id: "reel_8",
    author: { _id: "suggested_1", username: "lens_master", profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
    videoUrl: "https://v1.pinimg.com/videos/mc/720p/55/44/33/554433221100aabbccddeeff99887766.mp4",
    caption: "Street photography vibes. 📸🏙️ #photography #streetstyle #city",
    likes: [],
    category: "Photography",
    createdAt: new Date()
  },
  {
    _id: "reel_9",
    author: { _id: "suggested_3", username: "foodie_delight", profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
    videoUrl: "https://v1.pinimg.com/videos/mc/720p/22/11/00/221100aabbccddeeff99887766554433.mp4",
    caption: "The perfect morning coffee. ☕️✨ #coffee #morning #aesthetic",
    likes: [],
    category: "Food",
    createdAt: new Date()
  }
];

console.log("ℹ️ Demo Store initialized for in-memory fallback.");
