import fs from 'fs';

const categories = {
    "Eco": ["Bamboo toothbrush", "Reusable shopping bags", "Solar-powered charger", "Compost bin", "Beeswax food wraps", "Reusable water bottle", "LED light bulbs", "Eco-friendly cleaning products", "Cloth napkins", "Recycled paper notebooks", "Metal straws", "Biodegradable trash bags", "Rainwater harvesting system", "Energy-efficient appliances", "Organic fertilizers"],
    "Clothing": ["T-shirts", "Jeans", "Jackets", "Sweaters", "Dresses", "Skirts", "Shorts", "Hoodies", "Socks", "Underwear", "Blazers", "Tracksuits", "Pajamas", "Coats", "Activewear"],
    "Gadgets": ["Smartphone", "Laptop", "Tablet", "Smartwatch", "Wireless earbuds", "Bluetooth speaker", "Power bank", "Digital camera", "Gaming console", "E-reader", "Smart home hub", "Fitness tracker", "Drone", "VR headset", "Portable hard drive"],
    "Accessories": ["Watches", "Sunglasses", "Belts", "Hats", "Scarves", "Handbags", "Wallets", "Jewelry", "Hair clips", "Gloves", "Backpacks", "Keychains", "Ties", "Bracelets", "Rings"],
    "Vegetables": ["Carrot", "Broccoli", "Spinach", "Potato", "Onion", "Tomato", "Cucumber", "Cabbage", "Cauliflower", "Bell pepper", "Eggplant", "Zucchini", "Lettuce", "Peas", "Corn"],
    "Fruits": ["Apple", "Banana", "Orange", "Mango", "Grapes", "Pineapple", "Strawberry", "Watermelon", "Blueberry", "Peach", "Pear", "Cherry", "Kiwi", "Papaya", "Pomegranate", "Dragon Fruit", "Guava", "Lychee"],
    "Herbs": ["Basil", "Mint", "Parsley", "Cilantro", "Thyme", "Rosemary", "Oregano", "Sage", "Dill", "Chives", "Tarragon", "Lemongrass", "Bay leaves", "Fennel", "Marjoram"],
    "Grains": ["Rice", "Wheat", "Oats", "Barley", "Cornmeal", "Quinoa", "Millet", "Rye", "Sorghum", "Buckwheat", "Bulgur", "Farro", "Amaranth", "Spelt", "Teff"],
    "Dairy": ["Milk", "Cheese", "Butter", "Yogurt", "Cream", "Ice cream", "Cottage cheese", "Sour cream", "Buttermilk", "Ghee", "Cream cheese", "Condensed milk", "Evaporated milk", "Kefir", "Ricotta"]
};

const farmerNames = ["Green Acres", "Organic Roots", "Nature's Best", "Earth Threads", "Eco Basics", "Sun-Kissed Farm", "Valley Organics", "Pure Harvest", "Nandi Farms", "Sustainable Co.", "Ancient Grains", "Sattvic Life"];

const imageKeywords = {
    "Eco": "eco-friendly",
    "Clothing": "sustainable-clothing",
    "Gadgets": "modern-gadget",
    "Accessories": "accessory-style",
    "Vegetables": "fresh-vegetable",
    "Fruits": "organic-fruit",
    "Herbs": "herb-garden",
    "Grains": "grain-seeds",
    "Dairy": "dairy-milk"
};

const products = [];
let idCounter = 1;

for (const [category, items] of Object.entries(categories)) {
    items.forEach(name => {
        let price = Math.floor(Math.random() * 500) + 50;
        if (category === 'Clothing') price += 500;
        if (category === 'Gadgets') price += 2000 + Math.random() * 30000;
        if (category === 'Vegetables' || category === 'Fruits' || category === 'Herbs') price = Math.floor(Math.random() * 150) + 20;
        if (category === 'Dairy' || category === 'Grains') price = Math.floor(Math.random() * 400) + 40;

        products.push({
            id: String(idCounter++),
            name: name,
            category: category,
            price: Math.floor(price),
            farmer: farmerNames[Math.floor(Math.random() * farmerNames.length)],
            rating: (Math.random() * 1.5 + 3.5).toFixed(1),
            img: `https://loremflickr.com/400/300/${imageKeywords[category]}?lock=${idCounter}`
        });
    });
}

console.log(JSON.stringify(products, null, 2));
