export default async function handler(req, res) {
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

    const systemInstruction = "You are a friendly and expert AI Science Teacher. Explain the user's topic step by step with easy real-life analogies. Keep the language very simple, clear and engaging. Always write a detailed, informative, and complete response in natural Bengali language. Do not leave the answer incomplete.";

    try {
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(systemInstruction + "\n\nUser Question: " + message)}?model=openai`);
        
        if (!response.ok) throw new Error("AI Service failed");
        
        const data = await response.text();
        return res.status(200).json({ reply: data.trim() });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to generate response' });
    }
}
