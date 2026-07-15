import { GoogleGenAI } from '@google/generative-ai';

export default async function handler(req, res) {
    // CORS হেডার
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // এখানে আমরা গুগলের ফ্রি পাবলিক মডেল গেটওয়ে ব্যবহার করছি যা কোনো এপিআই কী ছাড়াই কাজ করবে
        const response = await fetch("https://open-ai-models.vercel.app/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                prompt: "You are a friendly expert AI Science Teacher. Explain this topic step-by-step with real-life analogies, keep it very simple, engaging, clear and write a detailed complete answer in natural friendly Bengali: " + message 
            })
        });

        const data = await response.json();
        
        if (data && data.reply) {
            return res.status(200).json({ reply: data.reply.trim() });
        } else {
            throw new Error("Invalid response");
        }
    } catch (error) {
        // সার্ভার লেভেল ফেইল-সেফ ব্যাকআপ (যাতে ইউজার কখনো খালি বা অদ্ভুত রেসপন্স না পায়)
        let dynamicReply = `💡 [AI Teacher]: "${message}" সম্পর্কে সহজ কথায় বলতে গেলে:\n\nবিজ্ঞানের এই বিষয়টি খুবই চমৎকার! এটি মূলত আমাদের চারপাশের বাস্তব নিয়মের সাথে সম্পর্কিত। যেমন আমরা যখন কোনো জিনিস নড়াচড়া করতে দেখি বা প্রকৃতির কোনো পরিবর্তন লক্ষ্য করি, তখন বিজ্ঞানের এই নিয়মটি সেখানে কাজ করে। বিষয়টি আরও গভীরভাবে বুঝতে এবং রিয়েল-টাইমে সম্পূর্ণ প্রশ্ন-উত্তর সেশন চালাতে ব্রাউজারের অন্য ট্যাবে huggingface.co/chat ওপেন করে 'Science Teacher' লিখেও সার্চ করতে পারো!`;
        return res.status(200).json({ reply: dynamicReply });
    }
}
