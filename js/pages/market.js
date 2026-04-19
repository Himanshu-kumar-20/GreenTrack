// js/pages/market.js
import { showToast, showModal, hideModal, flyPoints } from '../components.js';
import { formatCurrency, sleep } from '../utils.js';
import { firebaseDB, currentUser, addEcoPoints } from '../firebase.js';
import CONFIG from '../config.js';
let cart = [];

const products = [
  {
    "id": "1",
    "name": "Bamboo toothbrush",
    "category": "Eco",
    "price": 343,
    "farmer": "Ancient Grains",
    "rating": "4.2",
    "img": "https://picsum.photos/seed/mkt_1/400/300"
  },
  {
    "id": "2",
    "name": "Reusable shopping bags",
    "category": "Eco",
    "price": 88,
    "farmer": "Eco Basics",
    "rating": "4.0",
    "img": "https://picsum.photos/seed/mkt_2/400/300"
  },
  {
    "id": "3",
    "name": "Solar-powered charger",
    "category": "Eco",
    "price": 494,
    "farmer": "Earth Threads",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_3/400/300"
  },
  {
    "id": "4",
    "name": "Compost bin",
    "category": "Eco",
    "price": 71,
    "farmer": "Natures Best",
    "rating": "4.8",
    "img": "https://picsum.photos/seed/mkt_4/400/300"
  },
  {
    "id": "5",
    "name": "Beeswax food wraps",
    "category": "Eco",
    "price": 71,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.7",
    "img": "https://picsum.photos/seed/mkt_5/400/300"
  },
  {
    "id": "6",
    "name": "Reusable water bottle",
    "category": "Eco",
    "price": 419,
    "farmer": "Nandi Farms",
    "rating": "4.9",
    "img": "https://picsum.photos/seed/mkt_6/400/300"
  },
  {
    "id": "7",
    "name": "LED light bulbs",
    "category": "Eco",
    "price": 193,
    "farmer": "Earth Threads",
    "rating": "3.6",
    "img": "https://picsum.photos/seed/mkt_7/400/300"
  },
  {
    "id": "8",
    "name": "Eco-friendly cleaning products",
    "category": "Eco",
    "price": 453,
    "farmer": "Nandi Farms",
    "rating": "4.6",
    "img": "https://picsum.photos/seed/mkt_8/400/300"
  },
  {
    "id": "9",
    "name": "Cloth napkins",
    "category": "Eco",
    "price": 321,
    "farmer": "Ancient Grains",
    "rating": "3.5",
    "img": "https://picsum.photos/seed/mkt_9/400/300"
  },
  {
    "id": "10",
    "name": "Recycled paper notebooks",
    "category": "Eco",
    "price": 156,
    "farmer": "Eco Basics",
    "rating": "3.6",
    "img": "https://picsum.photos/seed/mkt_10/400/300"
  },
  {
    "id": "11",
    "name": "Metal straws",
    "category": "Eco",
    "price": 65,
    "farmer": "Organic Roots",
    "rating": "5.0",
    "img": "https://picsum.photos/seed/mkt_11/400/300"
  },
  {
    "id": "12",
    "name": "Biodegradable trash bags",
    "category": "Eco",
    "price": 356,
    "farmer": "Nandi Farms",
    "rating": "4.4",
    "img": "https://picsum.photos/seed/mkt_12/400/300"
  },
  {
    "id": "13",
    "name": "Rainwater harvesting system",
    "category": "Eco",
    "price": 152,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_13/400/300"
  },
  {
    "id": "14",
    "name": "Energy-efficient appliances",
    "category": "Eco",
    "price": 445,
    "farmer": "Pure Harvest",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_14/400/300"
  },
  {
    "id": "15",
    "name": "Organic fertilizers",
    "category": "Eco",
    "price": 385,
    "farmer": "Organic Roots",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_15/400/300"
  },
  {
    "id": "16",
    "name": "T-shirts",
    "category": "Clothing",
    "price": 642,
    "farmer": "Green Acres",
    "rating": "4.7",
    "img": "https://picsum.photos/seed/mkt_16/400/300"
  },
  {
    "id": "17",
    "name": "Jeans",
    "category": "Clothing",
    "price": 607,
    "farmer": "Sattvic Life",
    "rating": "4.0",
    "img": "https://picsum.photos/seed/mkt_17/400/300"
  },
  {
    "id": "18",
    "name": "Jackets",
    "category": "Clothing",
    "price": 945,
    "farmer": "Sustainable Co.",
    "rating": "4.9",
    "img": "https://picsum.photos/seed/mkt_18/400/300"
  },
  {
    "id": "19",
    "name": "Sweaters",
    "category": "Clothing",
    "price": 904,
    "farmer": "Organic Roots",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_19/400/300"
  },
  {
    "id": "20",
    "name": "Dresses",
    "category": "Clothing",
    "price": 987,
    "farmer": "Sattvic Life",
    "rating": "3.8",
    "img": "https://picsum.photos/seed/mkt_20/400/300"
  },
  {
    "id": "21",
    "name": "Skirts",
    "category": "Clothing",
    "price": 897,
    "farmer": "Eco Basics",
    "rating": "4.9",
    "img": "https://picsum.photos/seed/mkt_21/400/300"
  },
  {
    "id": "22",
    "name": "Shorts",
    "category": "Clothing",
    "price": 1036,
    "farmer": "Organic Roots",
    "rating": "4.9",
    "img": "https://picsum.photos/seed/mkt_22/400/300"
  },
  {
    "id": "23",
    "name": "Hoodies",
    "category": "Clothing",
    "price": 1033,
    "farmer": "Nandi Farms",
    "rating": "5.0",
    "img": "https://picsum.photos/seed/mkt_23/400/300"
  },
  {
    "id": "24",
    "name": "Socks",
    "category": "Clothing",
    "price": 650,
    "farmer": "Valley Organics",
    "rating": "4.7",
    "img": "https://picsum.photos/seed/mkt_24/400/300"
  },
  {
    "id": "25",
    "name": "Underwear",
    "category": "Clothing",
    "price": 790,
    "farmer": "Natures Best",
    "rating": "3.9",
    "img": "https://picsum.photos/seed/mkt_25/400/300"
  },
  {
    "id": "26",
    "name": "Blazers",
    "category": "Clothing",
    "price": 980,
    "farmer": "Natures Best",
    "rating": "4.0",
    "img": "https://picsum.photos/seed/mkt_26/400/300"
  },
  {
    "id": "27",
    "name": "Tracksuits",
    "category": "Clothing",
    "price": 643,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.9",
    "img": "https://picsum.photos/seed/mkt_27/400/300"
  },
  {
    "id": "28",
    "name": "Pajamas",
    "category": "Clothing",
    "price": 625,
    "farmer": "Green Acres",
    "rating": "4.7",
    "img": "https://picsum.photos/seed/mkt_28/400/300"
  },
  {
    "id": "29",
    "name": "Coats",
    "category": "Clothing",
    "price": 692,
    "farmer": "Sustainable Co.",
    "rating": "4.8",
    "img": "https://picsum.photos/seed/mkt_29/400/300"
  },
  {
    "id": "30",
    "name": "Activewear",
    "category": "Clothing",
    "price": 669,
    "farmer": "Pure Harvest",
    "rating": "4.8",
    "img": "https://picsum.photos/seed/mkt_30/400/300"
  },
  {
    "id": "31",
    "name": "Smartphone",
    "category": "Gadgets",
    "price": 29347,
    "farmer": "Sattvic Life",
    "rating": "3.6",
    "img": "https://picsum.photos/seed/mkt_31/400/300"
  },
  {
    "id": "32",
    "name": "Laptop",
    "category": "Gadgets",
    "price": 7973,
    "farmer": "Sustainable Co.",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_32/400/300"
  },
  {
    "id": "33",
    "name": "Tablet",
    "category": "Gadgets",
    "price": 6935,
    "farmer": "Green Acres",
    "rating": "3.6",
    "img": "https://picsum.photos/seed/mkt_33/400/300"
  },
  {
    "id": "34",
    "name": "Smartwatch",
    "category": "Gadgets",
    "price": 5984,
    "farmer": "Natures Best",
    "rating": "3.6",
    "img": "https://picsum.photos/seed/mkt_34/400/300"
  },
  {
    "id": "35",
    "name": "Wireless earbuds",
    "category": "Gadgets",
    "price": 9885,
    "farmer": "Earth Threads",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_35/400/300"
  },
  {
    "id": "36",
    "name": "Bluetooth speaker",
    "category": "Gadgets",
    "price": 13457,
    "farmer": "Organic Roots",
    "rating": "4.4",
    "img": "https://picsum.photos/seed/mkt_36/400/300"
  },
  {
    "id": "37",
    "name": "Power bank",
    "category": "Gadgets",
    "price": 32198,
    "farmer": "Eco Basics",
    "rating": "4.9",
    "img": "https://picsum.photos/seed/mkt_37/400/300"
  },
  {
    "id": "38",
    "name": "Digital camera",
    "category": "Gadgets",
    "price": 20723,
    "farmer": "Sustainable Co.",
    "rating": "4.7",
    "img": "https://picsum.photos/seed/mkt_38/400/300"
  },
  {
    "id": "39",
    "name": "Gaming console",
    "category": "Gadgets",
    "price": 27553,
    "farmer": "Sun-Kissed Farm",
    "rating": "3.9",
    "img": "https://picsum.photos/seed/mkt_39/400/300"
  },
  {
    "id": "40",
    "name": "E-reader",
    "category": "Gadgets",
    "price": 19442,
    "farmer": "Nandi Farms",
    "rating": "4.8",
    "img": "https://picsum.photos/seed/mkt_40/400/300"
  },
  {
    "id": "41",
    "name": "Smart home hub",
    "category": "Gadgets",
    "price": 5995,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.4",
    "img": "https://picsum.photos/seed/mkt_41/400/300"
  },
  {
    "id": "42",
    "name": "Fitness tracker",
    "category": "Gadgets",
    "price": 12597,
    "farmer": "Pure Harvest",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_42/400/300"
  },
  {
    "id": "43",
    "name": "Drone",
    "category": "Gadgets",
    "price": 14714,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.2",
    "img": "https://picsum.photos/seed/mkt_43/400/300"
  },
  {
    "id": "44",
    "name": "VR headset",
    "category": "Gadgets",
    "price": 14226,
    "farmer": "Earth Threads",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_44/400/300"
  },
  {
    "id": "45",
    "name": "Portable hard drive",
    "category": "Gadgets",
    "price": 5479,
    "farmer": "Ancient Grains",
    "rating": "4.3",
    "img": "https://picsum.photos/seed/mkt_45/400/300"
  },
  {
    "id": "46",
    "name": "Watches",
    "category": "Accessories",
    "price": 361,
    "farmer": "Sattvic Life",
    "rating": "4.9",
    "img": "https://picsum.photos/seed/mkt_46/400/300"
  },
  {
    "id": "47",
    "name": "Sunglasses",
    "category": "Accessories",
    "price": 266,
    "farmer": "Nandi Farms",
    "rating": "3.9",
    "img": "https://picsum.photos/seed/mkt_47/400/300"
  },
  {
    "id": "48",
    "name": "Belts",
    "category": "Accessories",
    "price": 219,
    "farmer": "Nandi Farms",
    "rating": "5.0",
    "img": "https://picsum.photos/seed/mkt_48/400/300"
  },
  {
    "id": "49",
    "name": "Hats",
    "category": "Accessories",
    "price": 434,
    "farmer": "Natures Best",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_49/400/300"
  },
  {
    "id": "50",
    "name": "Scarves",
    "category": "Accessories",
    "price": 64,
    "farmer": "Valley Organics",
    "rating": "5.0",
    "img": "https://picsum.photos/seed/mkt_50/400/300"
  },
  {
    "id": "51",
    "name": "Handbags",
    "category": "Accessories",
    "price": 459,
    "farmer": "Eco Basics",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_51/400/300"
  },
  {
    "id": "52",
    "name": "Wallets",
    "category": "Accessories",
    "price": 110,
    "farmer": "Organic Roots",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_52/400/300"
  },
  {
    "id": "53",
    "name": "Jewelry",
    "category": "Accessories",
    "price": 523,
    "farmer": "Organic Roots",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_53/400/300"
  },
  {
    "id": "54",
    "name": "Hair clips",
    "category": "Accessories",
    "price": 225,
    "farmer": "Organic Roots",
    "rating": "4.8",
    "img": "https://picsum.photos/seed/mkt_54/400/300"
  },
  {
    "id": "55",
    "name": "Gloves",
    "category": "Accessories",
    "price": 132,
    "farmer": "Nandi Farms",
    "rating": "4.0",
    "img": "https://picsum.photos/seed/mkt_55/400/300"
  },
  {
    "id": "56",
    "name": "Backpacks",
    "category": "Accessories",
    "price": 131,
    "farmer": "Nandi Farms",
    "rating": "4.6",
    "img": "https://picsum.photos/seed/mkt_56/400/300"
  },
  {
    "id": "57",
    "name": "Keychains",
    "category": "Accessories",
    "price": 105,
    "farmer": "Green Acres",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_57/400/300"
  },
  {
    "id": "58",
    "name": "Ties",
    "category": "Accessories",
    "price": 303,
    "farmer": "Pure Harvest",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_58/400/300"
  },
  {
    "id": "59",
    "name": "Bracelets",
    "category": "Accessories",
    "price": 190,
    "farmer": "Sustainable Co.",
    "rating": "4.6",
    "img": "https://picsum.photos/seed/mkt_59/400/300"
  },
  {
    "id": "60",
    "name": "Rings",
    "category": "Accessories",
    "price": 418,
    "farmer": "Organic Roots",
    "rating": "3.9",
    "img": "https://picsum.photos/seed/mkt_60/400/300"
  },
  {
    "id": "61",
    "name": "Carrot",
    "category": "Vegetables",
    "price": 80,
    "farmer": "Ancient Grains",
    "rating": "3.9",
    "img": "https://picsum.photos/seed/mkt_61/400/300"
  },
  {
    "id": "62",
    "name": "Broccoli",
    "category": "Vegetables",
    "price": 88,
    "farmer": "Valley Organics",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_62/400/300"
  },
  {
    "id": "63",
    "name": "Spinach",
    "category": "Vegetables",
    "price": 145,
    "farmer": "Nandi Farms",
    "rating": "4.7",
    "img": "https://picsum.photos/seed/mkt_63/400/300"
  },
  {
    "id": "64",
    "name": "Potato",
    "category": "Vegetables",
    "price": 106,
    "farmer": "Eco Basics",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_64/400/300"
  },
  {
    "id": "65",
    "name": "Onion",
    "category": "Vegetables",
    "price": 130,
    "farmer": "Eco Basics",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_65/400/300"
  },
  {
    "id": "66",
    "name": "Tomato",
    "category": "Vegetables",
    "price": 160,
    "farmer": "Green Acres",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_66/400/300"
  },
  {
    "id": "67",
    "name": "Cucumber",
    "category": "Vegetables",
    "price": 36,
    "farmer": "Valley Organics",
    "rating": "3.5",
    "img": "https://picsum.photos/seed/mkt_67/400/300"
  },
  {
    "id": "68",
    "name": "Cabbage",
    "category": "Vegetables",
    "price": 93,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_68/400/300"
  },
  {
    "id": "69",
    "name": "Cauliflower",
    "category": "Vegetables",
    "price": 165,
    "farmer": "Ancient Grains",
    "rating": "3.6",
    "img": "https://picsum.photos/seed/mkt_69/400/300"
  },
  {
    "id": "70",
    "name": "Bell pepper",
    "category": "Vegetables",
    "price": 123,
    "farmer": "Organic Roots",
    "rating": "4.6",
    "img": "https://picsum.photos/seed/mkt_70/400/300"
  },
  {
    "id": "71",
    "name": "Eggplant",
    "category": "Vegetables",
    "price": 121,
    "farmer": "Green Acres",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_71/400/300"
  },
  {
    "id": "72",
    "name": "Zucchini",
    "category": "Vegetables",
    "price": 33,
    "farmer": "Earth Threads",
    "rating": "3.6",
    "img": "https://picsum.photos/seed/mkt_72/400/300"
  },
  {
    "id": "73",
    "name": "Lettuce",
    "category": "Vegetables",
    "price": 157,
    "farmer": "Valley Organics",
    "rating": "4.7",
    "img": "https://picsum.photos/seed/mkt_73/400/300"
  },
  {
    "id": "74",
    "name": "Peas",
    "category": "Vegetables",
    "price": 26,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.9",
    "img": "https://picsum.photos/seed/mkt_74/400/300"
  },
  {
    "id": "75",
    "name": "Corn",
    "category": "Vegetables",
    "price": 91,
    "farmer": "Sustainable Co.",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_75/400/300"
  },
  {
    "id": "76",
    "name": "Apple",
    "category": "Fruits",
    "price": 64,
    "farmer": "Nandi Farms",
    "rating": "4.6",
    "img": "https://picsum.photos/seed/mkt_76/400/300"
  },
  {
    "id": "77",
    "name": "Banana",
    "category": "Fruits",
    "price": 101,
    "farmer": "Organic Roots",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_77/400/300"
  },
  {
    "id": "78",
    "name": "Orange",
    "category": "Fruits",
    "price": 34,
    "farmer": "Pure Harvest",
    "rating": "4.6",
    "img": "https://picsum.photos/seed/mkt_78/400/300"
  },
  {
    "id": "79",
    "name": "Mango",
    "category": "Fruits",
    "price": 164,
    "farmer": "Pure Harvest",
    "rating": "4.7",
    "img": "https://picsum.photos/seed/mkt_79/400/300"
  },
  {
    "id": "80",
    "name": "Grapes",
    "category": "Fruits",
    "price": 20,
    "farmer": "Eco Basics",
    "rating": "3.8",
    "img": "https://picsum.photos/seed/mkt_80/400/300"
  },
  {
    "id": "81",
    "name": "Pineapple",
    "category": "Fruits",
    "price": 32,
    "farmer": "Valley Organics",
    "rating": "4.0",
    "img": "https://picsum.photos/seed/mkt_81/400/300"
  },
  {
    "id": "82",
    "name": "Strawberry",
    "category": "Fruits",
    "price": 79,
    "farmer": "Natures Best",
    "rating": "4.6",
    "img": "https://picsum.photos/seed/mkt_82/400/300"
  },
  {
    "id": "83",
    "name": "Watermelon",
    "category": "Fruits",
    "price": 143,
    "farmer": "Sun-Kissed Farm",
    "rating": "3.9",
    "img": "https://picsum.photos/seed/mkt_83/400/300"
  },
  {
    "id": "84",
    "name": "Blueberry",
    "category": "Fruits",
    "price": 122,
    "farmer": "Nandi Farms",
    "rating": "4.4",
    "img": "https://picsum.photos/seed/mkt_84/400/300"
  },
  {
    "id": "85",
    "name": "Peach",
    "category": "Fruits",
    "price": 151,
    "farmer": "Sattvic Life",
    "rating": "4.3",
    "img": "https://picsum.photos/seed/mkt_85/400/300"
  },
  {
    "id": "86",
    "name": "Pear",
    "category": "Fruits",
    "price": 96,
    "farmer": "Sattvic Life",
    "rating": "3.6",
    "img": "https://picsum.photos/seed/mkt_86/400/300"
  },
  {
    "id": "87",
    "name": "Cherry",
    "category": "Fruits",
    "price": 130,
    "farmer": "Organic Roots",
    "rating": "5.0",
    "img": "https://picsum.photos/seed/mkt_87/400/300"
  },
  {
    "id": "88",
    "name": "Kiwi",
    "category": "Fruits",
    "price": 108,
    "farmer": "Pure Harvest",
    "rating": "4.4",
    "img": "https://picsum.photos/seed/mkt_88/400/300"
  },
  {
    "id": "89",
    "name": "Papaya",
    "category": "Fruits",
    "price": 120,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.3",
    "img": "https://picsum.photos/seed/mkt_89/400/300"
  },
  {
    "id": "90",
    "name": "Pomegranate",
    "category": "Fruits",
    "price": 55,
    "farmer": "Earth Threads",
    "rating": "4.8",
    "img": "https://picsum.photos/seed/mkt_90/400/300"
  },
  {
    "id": "91",
    "name": "Dragon Fruit",
    "category": "Fruits",
    "price": 46,
    "farmer": "Valley Organics",
    "rating": "5.0",
    "img": "https://picsum.photos/seed/mkt_91/400/300"
  },
  {
    "id": "92",
    "name": "Guava",
    "category": "Fruits",
    "price": 62,
    "farmer": "Pure Harvest",
    "rating": "4.2",
    "img": "https://picsum.photos/seed/mkt_92/400/300"
  },
  {
    "id": "93",
    "name": "Lychee",
    "category": "Fruits",
    "price": 120,
    "farmer": "Ancient Grains",
    "rating": "4.2",
    "img": "https://picsum.photos/seed/mkt_93/400/300"
  },
  {
    "id": "94",
    "name": "Basil",
    "category": "Herbs",
    "price": 153,
    "farmer": "Natures Best",
    "rating": "4.6",
    "img": "https://picsum.photos/seed/mkt_94/400/300"
  },
  {
    "id": "95",
    "name": "Mint",
    "category": "Herbs",
    "price": 50,
    "farmer": "Pure Harvest",
    "rating": "4.3",
    "img": "https://picsum.photos/seed/mkt_95/400/300"
  },
  {
    "id": "96",
    "name": "Parsley",
    "category": "Herbs",
    "price": 50,
    "farmer": "Valley Organics",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_96/400/300"
  },
  {
    "id": "97",
    "name": "Cilantro",
    "category": "Herbs",
    "price": 124,
    "farmer": "Eco Basics",
    "rating": "4.0",
    "img": "https://picsum.photos/seed/mkt_97/400/300"
  },
  {
    "id": "98",
    "name": "Thyme",
    "category": "Herbs",
    "price": 20,
    "farmer": "Nandi Farms",
    "rating": "4.4",
    "img": "https://picsum.photos/seed/mkt_98/400/300"
  },
  {
    "id": "99",
    "name": "Rosemary",
    "category": "Herbs",
    "price": 132,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.3",
    "img": "https://picsum.photos/seed/mkt_99/400/300"
  },
  {
    "id": "100",
    "name": "Oregano",
    "category": "Herbs",
    "price": 43,
    "farmer": "Organic Roots",
    "rating": "3.8",
    "img": "https://picsum.photos/seed/mkt_100/400/300"
  },
  {
    "id": "101",
    "name": "Sage",
    "category": "Herbs",
    "price": 166,
    "farmer": "Green Acres",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_101/400/300"
  },
  {
    "id": "102",
    "name": "Dill",
    "category": "Herbs",
    "price": 57,
    "farmer": "Ancient Grains",
    "rating": "5.0",
    "img": "https://picsum.photos/seed/mkt_102/400/300"
  },
  {
    "id": "103",
    "name": "Chives",
    "category": "Herbs",
    "price": 25,
    "farmer": "Organic Roots",
    "rating": "4.8",
    "img": "https://picsum.photos/seed/mkt_103/400/300"
  },
  {
    "id": "104",
    "name": "Tarragon",
    "category": "Herbs",
    "price": 93,
    "farmer": "Sustainable Co.",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_104/400/300"
  },
  {
    "id": "105",
    "name": "Lemongrass",
    "category": "Herbs",
    "price": 69,
    "farmer": "Earth Threads",
    "rating": "3.9",
    "img": "https://picsum.photos/seed/mkt_105/400/300"
  },
  {
    "id": "106",
    "name": "Bay leaves",
    "category": "Herbs",
    "price": 131,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.2",
    "img": "https://picsum.photos/seed/mkt_106/400/300"
  },
  {
    "id": "107",
    "name": "Fennel",
    "category": "Herbs",
    "price": 167,
    "farmer": "Nandi Farms",
    "rating": "4.2",
    "img": "https://picsum.photos/seed/mkt_107/400/300"
  },
  {
    "id": "108",
    "name": "Marjoram",
    "category": "Herbs",
    "price": 154,
    "farmer": "Earth Threads",
    "rating": "3.6",
    "img": "https://picsum.photos/seed/mkt_108/400/300"
  },
  {
    "id": "109",
    "name": "Rice",
    "category": "Grains",
    "price": 397,
    "farmer": "Eco Basics",
    "rating": "4.2",
    "img": "https://picsum.photos/seed/mkt_109/400/300"
  },
  {
    "id": "110",
    "name": "Wheat",
    "category": "Grains",
    "price": 119,
    "farmer": "Sattvic Life",
    "rating": "3.8",
    "img": "https://picsum.photos/seed/mkt_110/400/300"
  },
  {
    "id": "111",
    "name": "Oats",
    "category": "Grains",
    "price": 383,
    "farmer": "Earth Threads",
    "rating": "4.8",
    "img": "https://picsum.photos/seed/mkt_111/400/300"
  },
  {
    "id": "112",
    "name": "Barley",
    "category": "Grains",
    "price": 384,
    "farmer": "Pure Harvest",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_112/400/300"
  },
  {
    "id": "113",
    "name": "Cornmeal",
    "category": "Grains",
    "price": 280,
    "farmer": "Eco Basics",
    "rating": "4.3",
    "img": "https://picsum.photos/seed/mkt_113/400/300"
  },
  {
    "id": "114",
    "name": "Quinoa",
    "category": "Grains",
    "price": 253,
    "farmer": "Nandi Farms",
    "rating": "3.6",
    "img": "https://picsum.photos/seed/mkt_114/400/300"
  },
  {
    "id": "115",
    "name": "Millet",
    "category": "Grains",
    "price": 295,
    "farmer": "Green Acres",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_115/400/300"
  },
  {
    "id": "116",
    "name": "Rye",
    "category": "Grains",
    "price": 399,
    "farmer": "Eco Basics",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_116/400/300"
  },
  {
    "id": "117",
    "name": "Sorghum",
    "category": "Grains",
    "price": 397,
    "farmer": "Sun-Kissed Farm",
    "rating": "4.9",
    "img": "https://picsum.photos/seed/mkt_117/400/300"
  },
  {
    "id": "118",
    "name": "Buckwheat",
    "category": "Grains",
    "price": 199,
    "farmer": "Ancient Grains",
    "rating": "3.8",
    "img": "https://picsum.photos/seed/mkt_118/400/300"
  },
  {
    "id": "119",
    "name": "Bulgur",
    "category": "Grains",
    "price": 49,
    "farmer": "Nandi Farms",
    "rating": "4.6",
    "img": "https://picsum.photos/seed/mkt_119/400/300"
  },
  {
    "id": "120",
    "name": "Farro",
    "category": "Grains",
    "price": 269,
    "farmer": "Green Acres",
    "rating": "4.9",
    "img": "https://picsum.photos/seed/mkt_120/400/300"
  },
  {
    "id": "121",
    "name": "Amaranth",
    "category": "Grains",
    "price": 314,
    "farmer": "Earth Threads",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_121/400/300"
  },
  {
    "id": "122",
    "name": "Spelt",
    "category": "Grains",
    "price": 286,
    "farmer": "Sattvic Life",
    "rating": "4.6",
    "img": "https://picsum.photos/seed/mkt_122/400/300"
  },
  {
    "id": "123",
    "name": "Teff",
    "category": "Grains",
    "price": 50,
    "farmer": "Ancient Grains",
    "rating": "4.5",
    "img": "https://picsum.photos/seed/mkt_123/400/300"
  },
  {
    "id": "124",
    "name": "Milk",
    "category": "Dairy",
    "price": 176,
    "farmer": "Earth Threads",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_124/400/300"
  },
  {
    "id": "125",
    "name": "Cheese",
    "category": "Dairy",
    "price": 354,
    "farmer": "Nandi Farms",
    "rating": "4.4",
    "img": "https://picsum.photos/seed/mkt_125/400/300"
  },
  {
    "id": "126",
    "name": "Butter",
    "category": "Dairy",
    "price": 70,
    "farmer": "Nandi Farms",
    "rating": "4.0",
    "img": "https://picsum.photos/seed/mkt_126/400/300"
  },
  {
    "id": "127",
    "name": "Yogurt",
    "category": "Dairy",
    "price": 415,
    "farmer": "Sustainable Co.",
    "rating": "4.7",
    "img": "https://picsum.photos/seed/mkt_127/400/300"
  },
  {
    "id": "128",
    "name": "Cream",
    "category": "Dairy",
    "price": 53,
    "farmer": "Nandi Farms",
    "rating": "4.2",
    "img": "https://picsum.photos/seed/mkt_128/400/300"
  },
  {
    "id": "129",
    "name": "Ice cream",
    "category": "Dairy",
    "price": 340,
    "farmer": "Organic Roots",
    "rating": "4.3",
    "img": "https://picsum.photos/seed/mkt_129/400/300"
  },
  {
    "id": "130",
    "name": "Cottage cheese",
    "category": "Dairy",
    "price": 408,
    "farmer": "Organic Roots",
    "rating": "4.1",
    "img": "https://picsum.photos/seed/mkt_130/400/300"
  },
  {
    "id": "131",
    "name": "Sour cream",
    "category": "Dairy",
    "price": 432,
    "farmer": "Nandi Farms",
    "rating": "4.3",
    "img": "https://picsum.photos/seed/mkt_131/400/300"
  },
  {
    "id": "132",
    "name": "Buttermilk",
    "category": "Dairy",
    "price": 177,
    "farmer": "Organic Roots",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_132/400/300"
  },
  {
    "id": "133",
    "name": "Ghee",
    "category": "Dairy",
    "price": 169,
    "farmer": "Green Acres",
    "rating": "5.0",
    "img": "https://picsum.photos/seed/mkt_133/400/300"
  },
  {
    "id": "134",
    "name": "Cream cheese",
    "category": "Dairy",
    "price": 431,
    "farmer": "Sun-Kissed Farm",
    "rating": "3.8",
    "img": "https://picsum.photos/seed/mkt_134/400/300"
  },
  {
    "id": "135",
    "name": "Condensed milk",
    "category": "Dairy",
    "price": 269,
    "farmer": "Organic Roots",
    "rating": "4.4",
    "img": "https://picsum.photos/seed/mkt_135/400/300"
  },
  {
    "id": "136",
    "name": "Evaporated milk",
    "category": "Dairy",
    "price": 279,
    "farmer": "Sustainable Co.",
    "rating": "4.4",
    "img": "https://picsum.photos/seed/mkt_136/400/300"
  },
  {
    "id": "137",
    "name": "Kefir",
    "category": "Dairy",
    "price": 369,
    "farmer": "Nandi Farms",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_137/400/300"
  },
  {
    "id": "138",
    "name": "Ricotta",
    "category": "Dairy",
    "price": 331,
    "farmer": "Sun-Kissed Farm",
    "rating": "3.7",
    "img": "https://picsum.photos/seed/mkt_138/400/300"
  }
];

// Per-card qty state
const cardQtys = {};
products.forEach(p => cardQtys[p.id] = 1);

export const initMarket = async (container) => {
    cart = []; // Reset cart on init

    const allCategories = [...new Set(products.map(p => p.category))];

    container.innerHTML = `
        <div>
            <header style="margin-bottom: var(--space-xl); display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 class="text-neon">Eco Store</h1>
                    <p class="text-muted">Buy sustainable gear, clothing, gadgets and eco-friendly accessories.</p>
                </div>
                <div style="display: flex; gap: var(--space-md);">
                    <button class="btn btn-outline" id="cart-toggle-btn">
                        <span class="material-symbols-outlined">shopping_cart</span> Cart (<span id="cart-count">0</span>)
                    </button>
                </div>
            </header>

            <div class="filter-bar">
                <input type="text" class="input-field" placeholder="Search products..." id="market-search" style="flex:1; max-width: 300px; margin:0;">
                <select class="input-field" id="market-category" style="width:auto; margin:0;">
                    <option value="all">All Categories</option>
                    ${allCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>

            <div class="product-grid" id="market-grid">
                <!-- Products rendered by JS -->
            </div>
        </div>

        <!-- Cart Sidebar Overlay -->
        <div class="cart-sidebar-overlay" id="cart-sidebar">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-lg); align-items: center;">
                <h2 class="text-neon">Your Cart</h2>
                <button class="btn btn-ghost" id="close-cart"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div id="cart-items" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
                <p class="text-muted">Your cart is empty.</p>
            </div>
            <div class="cart-footer" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--space-md);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                    <span style="font-size: 1.2rem;">Total:</span>
                    <span class="text-neon" id="cart-total" style="font-size: 1.5rem; font-weight: 700;">₹0.00</span>
                </div>
                <button class="btn btn-primary" id="checkout-btn" style="width: 100%;" disabled>Proceed to Checkout</button>
            </div>
        </div>
    `;

    const grid = document.getElementById('market-grid');

    const renderProducts = (list) => {
        grid.innerHTML = '';
        list.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = `glass-card`;
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.innerHTML = `
                <img src="${p.img}" class="product-image" loading="lazy" onerror="this.style.background='linear-gradient(135deg, rgba(0,255,135,0.1), rgba(127,255,0,0.05))'; this.style.display='flex'; this.alt='${p.name}';">
                <span class="badge badge-green" style="position:absolute; top:var(--space-md); right:var(--space-md); backdrop-filter:blur(10px); background: rgba(0,255,135,0.2);">${p.category}</span>
                <h3 style="margin-bottom: var(--space-xs); flex: 1; font-size: 0.95rem;">${p.name}</h3>
                <p class="text-muted" style="font-size: 0.85rem; margin-bottom: var(--space-sm);">By ${p.farmer}
                    <span class="material-symbols-outlined" style="font-size:0.9rem; color:var(--warning); vertical-align:middle;">star</span> ${p.rating}
                </p>
                <div class="product-meta">
                    <span class="product-price">${formatCurrency(p.price)}<span style="font-size:0.8rem;color:var(--text-muted);font-weight:400;">/unit</span></span>
                </div>
                <div style="display:flex; align-items:center; gap:var(--space-sm); margin-top:var(--space-sm);">
                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.04); border-radius:var(--radius-sm); border:var(--border-glass); overflow:hidden;">
                        <button class="qty-btn qty-minus" data-id="${p.id}" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0.3rem 0.5rem; font-size:1.1rem; transition:color 0.2s;">−</button>
                        <span class="qty-val" id="qty-${p.id}" style="min-width:24px; text-align:center; font-weight:600; font-size:0.9rem; color:var(--text-main);">${cardQtys[p.id]}</span>
                        <button class="qty-btn qty-plus" data-id="${p.id}" style="background:none; border:none; color:var(--primary); cursor:pointer; padding:0.3rem 0.5rem; font-size:1.1rem; transition:color 0.2s;">+</button>
                    </div>
                    <button class="btn btn-primary buy-btn" style="padding: var(--space-xs) var(--space-md); font-size:0.85rem; flex:1;" data-id="${p.id}">Add <span class="material-symbols-outlined" style="font-size: 1rem; margin-left:2px;">shopping_cart</span></button>
                </div>
            `;
            grid.appendChild(card);
        });
        wireUpCardButtons();
    };

    renderProducts(products);

    // Search & filter
    const searchEl = document.getElementById('market-search');
    const catEl = document.getElementById('market-category');
    const filterProducts = () => {
        const q = searchEl.value.toLowerCase();
        const cat = catEl.value;
        const filtered = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(q) || p.farmer.toLowerCase().includes(q);
            const matchesCat = cat === 'all' || p.category === cat;
            return matchesSearch && matchesCat;
        });
        renderProducts(filtered);
    };
    searchEl.addEventListener('input', filterProducts);
    catEl.addEventListener('change', filterProducts);

    function wireUpCardButtons() {
        // Qty buttons
        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                cardQtys[id] = Math.max(1, (cardQtys[id] || 1) - 1);
                document.getElementById(`qty-${id}`).textContent = cardQtys[id];
            });
        });
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                cardQtys[id] = Math.min(99, (cardQtys[id] || 1) + 1);
                document.getElementById(`qty-${id}`).textContent = cardQtys[id];
            });
        });

        // Add To Cart Logic
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnEl = e.currentTarget;
                const id = btnEl.dataset.id;
                const product = products.find(p => p.id === id);
                const qty = cardQtys[id] || 1;

                const existing = cart.find(c => c.id === id);
                if (existing) {
                    existing.qty += qty;
                } else {
                    cart.push({ ...product, qty });
                }
                showToast(`${qty}x ${product.name} added to cart!`, 'success');
                updateCartUI();
                // Reset card qty
                cardQtys[id] = 1;
                const el = document.getElementById(`qty-${id}`);
                if (el) el.textContent = '1';
            });
        });
    }

    // Sidebar Toggles
    const sidebar = document.getElementById('cart-sidebar');
    document.getElementById('cart-toggle-btn').addEventListener('click', () => {
        sidebar.classList.add('open');
    });
    document.getElementById('close-cart').addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    const updateCartUI = () => {
        const cartItemsContainer = document.getElementById('cart-items');
        document.getElementById('cart-count').innerText = cart.reduce((acc, c) => acc + c.qty, 0);

        const total = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);
        document.getElementById('cart-total').innerText = formatCurrency(total);

        document.getElementById('checkout-btn').disabled = cart.length === 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(c => `
            <div style="display: flex; gap: var(--space-md); align-items: center; background: rgba(255,255,255,0.05); padding: var(--space-sm); border-radius: var(--radius-md);">
                <img src="${c.img}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;" onerror="this.style.background='rgba(0,255,135,0.1)'">
                <div style="flex: 1;">
                    <p style="font-size: 0.9rem; font-weight: 500; margin:0;">${c.name}</p>
                    <p class="text-neon" style="font-size: 0.9rem; margin:0;">${formatCurrency(c.price)} × ${c.qty}</p>
                </div>
            </div>
        `).join('');
    };

    // Checkout Logic
    document.getElementById('checkout-btn').addEventListener('click', () => {
        sidebar.classList.remove('open');
        const total = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);

        const invoiceHTML = cart.map(c => `
            <div style="display:flex; justify-content:space-between; font-size: 0.9rem; margin-bottom: 4px;">
                <span>${c.name} (×${c.qty})</span>
                <span class="text-muted">${formatCurrency(c.price * c.qty)}</span>
            </div>
        `).join('');

        showModal('Confirm Checkout', `
            <div style="text-align:left; margin-bottom: var(--space-md);">
                <div style="background: rgba(0,0,0,0.3); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.1);">
                    <p class="text-muted" style="margin-bottom: var(--space-sm); font-size: 0.8rem; text-transform: uppercase;">Order Summary</p>
                    ${invoiceHTML}
                    <hr style="border:0; border-top:1px dashed rgba(255,255,255,0.2); margin: var(--space-sm) 0;">
                    <div style="display:flex; justify-content:space-between; font-weight: 700; font-size: 1.1rem;">
                        <span>Final Total</span>
                        <span class="text-neon">${formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        `, `
            <button class="btn btn-primary" id="confirm-buy" style="width:100%; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(0,255,135,0.3);">Secure Payment (Demo Mode)</button>
        `);

        document.getElementById('confirm-buy').addEventListener('click', async (ev) => {
            const btnBuy = document.getElementById('confirm-buy');
            btnBuy.innerHTML = '<span class="material-symbols-outlined spin" style="animation: spin 1s linear infinite;">sync</span> Processing...';
            btnBuy.disabled = true;

            try {
                if (!window.Razorpay) {
                    throw new Error("Razorpay SDK not loaded");
                }

                const options = {
                    key: CONFIG.RAZORPAY_KEY_ID || "rzp_test_dummy", // Enter the Key ID generated from the Dashboard
                    amount: total * 100, // Amount is in currency subunits. 50000 refers to 50000 paise
                    currency: "INR",
                    name: "GreenTrack Marketplace",
                    description: "GreenTrack Secure Checkout",
                    handler: async function (response) {
                        try {
                            // Realistic payment simulation
                            const res = await fetch('/api/market/order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ total, items: cart.map(i => i.id) })
                            });
                            const orderData = await res.json();
                            if (!orderData.success) throw new Error(orderData.error || 'Payment failed');
                            
                            // Save Order to Firestore
                            if (currentUser) {
                                await firebaseDB.addDocument('market_orders', {
                                    userId: currentUser.uid,
                                    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
                                    total,
                                    status: 'paid',
                                    orderId: orderData.orderId,
                                    timestamp: new Date().toISOString()
                                });
                            }
                            hideModal();
                            showToast('Payment successful! Your items are on their way.', 'success');
                            const xp = 50 * cart.length;
                            addEcoPoints(xp);
                            flyPoints(xp, window.innerWidth/2, window.innerHeight/2);
                            cart = [];
                            updateCartUI();
                        } catch(e) {
                            showToast("Error saving order: " + e.message, "error");
                        }
                    },
                    prefill: {
                        name: currentUser?.displayName || "Guest User",
                        email: currentUser?.email || "guest@greentrack.com",
                    },
                    theme: {
                        color: "#00FF87"
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response){
                    btnBuy.disabled = false;
                    btnBuy.innerText = 'Try Again';
                    showToast("Payment failed: " + response.error.description, "error");
                });
                rzp1.open();
                
            } catch (err) {
                btnBuy.innerText = 'Pay via Razorpay';
                btnBuy.disabled = false;
                showToast("Payment error: " + err.message, "error");
            }
        });
    });
};

