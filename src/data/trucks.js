const littlePinkHeroImage = new URL("../../1.jpg", import.meta.url).href;
const jianbingHeroImage = new URL("../../8.jpg", import.meta.url).href;
const redGrillHeroImage = new URL("../../3.jpg", import.meta.url).href;
const flameHeroImage = new URL("../../11.jpg", import.meta.url).href;
const whiteChineseHeroImage = new URL("../../4.jpg", import.meta.url).href;
const blueTruckHeroImage = new URL("../../5.jpg", import.meta.url).href;

const littlePinkCurryImage = new URL(
  "../../Little_Pink_Truck_List/JapaneseCurryChickenRice.jpg",
  import.meta.url
).href;

const littlePinkBeefImage = new URL(
  "../../Little_Pink_Truck_List/BraisedBeefBrisketRice.jpg",
  import.meta.url
).href;

export const trucks = [
  {
    id: "luchi-pink",
    name: "UT Little Pink Truck",
    cuisine: "Chinese Snacks",
    rating: 4.7,
    reviewCount: 286,
    waitTimeMin: 8,
    walkTimeMin: 3,
    status: "open",
    trustNote: "Updated 2 min ago",
    badge: "Shortest Wait",
    image: "Luchi",
    imageSrc: littlePinkHeroImage,
    searchFoods: ["curry chicken rice", "beef brisket rice", "rice bowl", "lunch combo"],
    intentTags: ["quick", "cheap lunch", "open now", "comfort food"],
    location: "King's College Cir, University of Toronto",
    navigationAddress: "King's College Circle, Toronto, ON M5S 3K1",
    menu: [
      {
        id: "japanese-curry-chicken-rice",
        name: "Japanese Curry Chicken Rice",
        priceCad: 15.59,
        priceRmb: 78.29,
        description: "Japanese curry, chicken, and rice.",
        imageSrc: littlePinkCurryImage
      },
      {
        id: "braised-beef-brisket-rice",
        name: "Braised Beef Brisket Rice",
        priceCad: 16.79,
        priceRmb: 84.32,
        description: "Braised beef brisket served over rice.",
        imageSrc: littlePinkBeefImage
      }
    ],
    mapX: 54,
    mapY: 61
  },
  {
    id: "jianbing-grain",
    name: "Jianbing Crepe Truck",
    cuisine: "Jianbing Crepe",
    rating: 4.7,
    reviewCount: 233,
    waitTimeMin: 12,
    walkTimeMin: 5,
    status: "open",
    trustNote: "Based on recent orders",
    badge: "Open Now",
    image: "Jianbing",
    imageSrc: jianbingHeroImage,
    searchFoods: ["jianbing", "crepe", "bubble tea", "soy milk"],
    intentTags: ["vegetarian", "quick", "cheap", "snack"],
    location: "Harbord St & St George St, University of Toronto",
    navigationAddress: "Harbord St & St George St, Toronto, ON",
    mapX: 40,
    mapY: 40
  },
  {
    id: "rb-red",
    name: "Red Grill Truck",
    cuisine: "Street Grill",
    rating: 4.5,
    reviewCount: 198,
    waitTimeMin: 19,
    walkTimeMin: 4,
    status: "moderate",
    trustNote: "Updated 4 min ago",
    badge: "Busy",
    image: "RB",
    imageSrc: redGrillHeroImage,
    searchFoods: ["fried chicken", "hot dog", "grill platter"],
    intentTags: ["halal", "protein", "late lunch"],
    location: "Sidney Smith Hall, University of Toronto",
    navigationAddress: "100 St George St, Toronto, ON M5S 3G3",
    mapX: 59,
    mapY: 69
  },
  {
    id: "middle-east-flame",
    name: "Flame Shawarma Truck",
    cuisine: "Shawarma and Kebab",
    rating: 4.8,
    reviewCount: 367,
    waitTimeMin: 14,
    walkTimeMin: 6,
    status: "open",
    trustNote: "Based on recent orders",
    badge: "Top Rated",
    image: "Flame",
    imageSrc: flameHeroImage,
    searchFoods: ["shawarma", "kebab", "falafel wrap"],
    intentTags: ["halal", "quick", "open now"],
    location: "Hart House Circle, University of Toronto",
    navigationAddress: "7 Hart House Cir, Toronto, ON M5S 3H3",
    mapX: 46,
    mapY: 50
  },
  {
    id: "white-chinese",
    name: "White Chinese Food Truck",
    cuisine: "Northern Chinese",
    rating: 4.4,
    reviewCount: 163,
    waitTimeMin: 22,
    walkTimeMin: 2,
    status: "busy",
    trustNote: "Updated 1 min ago",
    badge: "Closest",
    image: "White",
    imageSrc: whiteChineseHeroImage,
    searchFoods: ["dumplings", "noodles", "rice plate"],
    intentTags: ["cheap lunch", "family portions", "open now"],
    location: "Galbraith Rd, University of Toronto",
    navigationAddress: "Galbraith Rd, Toronto, ON M5S 1A1",
    mapX: 57,
    mapY: 66
  },
  {
    id: "blue-truck",
    name: "Blue Truck",
    cuisine: "Burgers and Fries",
    rating: 4.6,
    reviewCount: 214,
    waitTimeMin: 10,
    walkTimeMin: 7,
    status: "open",
    trustNote: "Updated 3 min ago",
    badge: "Open Now",
    image: "Blue",
    imageSrc: blueTruckHeroImage,
    searchFoods: ["burger", "fries", "fried chicken sandwich"],
    intentTags: ["quick", "cheap", "grab and go"],
    location: "Front Campus, University of Toronto",
    navigationAddress: "93 St George St, Toronto, ON M5S 2E5",
    mapX: 52,
    mapY: 58
  }
];
