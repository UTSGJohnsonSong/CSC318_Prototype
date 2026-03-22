const littlePinkHeroImage = new URL("../../1.jpg", import.meta.url).href;
const jianbingHeroImage = new URL("../../8.jpg", import.meta.url).href;
const redGrillHeroImage = new URL("../../3.jpg", import.meta.url).href;
const flameHeroImage = new URL("../../4.jpg", import.meta.url).href;
const whiteChineseHeroImage = new URL("../../5.jpg", import.meta.url).href;
const blueTruckHeroImage = new URL("../../6.jpg", import.meta.url).href;

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
    mapX: 69,
    mapY: 78
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
    mapX: 43,
    mapY: 35
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
    mapX: 51,
    mapY: 48
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
    mapX: 56,
    mapY: 57
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
    mapX: 65,
    mapY: 73
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
    mapX: 39,
    mapY: 29
  }
];
