module.exports = async function handler(req, res) {
  // Allow requests from your site (adjust origin if you want to lock it down later)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { messages, max_tokens } = req.body;
    // Vision-capable model is required whenever any message has
    // array-formatted content (i.e. includes an image). Text-only
    // gpt-oss-120b rejects array content with a 400 error.
    const hasImage = Array.isArray(messages) && messages.some(
      m => Array.isArray(m.content)
    );
    const model = hasImage
      ? "meta-llama/llama-4-maverick-17b-128e-instruct"
      : "openai/gpt-oss-120b";
    const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        max_tokens: max_tokens || 800,
        messages: messages
      })
    });
    const data = await groqResp.json();
    if (!groqResp.ok) {
      return res.status(groqResp.status).json({ error: data.error?.message || "Groq API error" });
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
