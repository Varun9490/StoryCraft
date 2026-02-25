const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyB4Cf4g8MVL6H573swWqPdCbLuSJlipW3M"; // never hardcode in production
const genAI = new GoogleGenerativeAI(API_KEY);

async function run() {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const prompt = `
Generate product FAQs in STRICT JSON format.

Product Title: Etikoppaka Wooden Lacquer Toy Elephant
Category: Woodwork

Description:
This handcrafted Etikoppaka toy elephant is made by traditional artisans from Andhra Pradesh using age-old turning techniques. The toy is shaped on a hand-operated lathe using soft Ankudu wood and finished with natural lac colors derived from seeds and plant dyes. Each piece is carefully polished to achieve a smooth, glossy surface without using chemicals.

Material: Ankudu wood, natural lac dyes, vegetable colors
Craft Technique: Traditional hand-lathe turning with natural lac finishing
Tags: handmade, eco-friendly, traditional, wooden toy, etikoppaka, artisan craft
Customizable: Yes
Location: Visakhapatnam

Return ONLY JSON like:
{
  "faqs":[
    {"question":"", "answer":""}
  ]
}
`;

        // ⏱️ start timer
        const start = Date.now();

        const result = await model.generateContent(prompt);
        const response = await result.response;

        // ⏱️ end timer
        const end = Date.now();

        console.log("Response Time:", end - start, "ms");
        console.log(response.text());

    } catch (err) {
        console.error("Error:", err);
    }
}

run();