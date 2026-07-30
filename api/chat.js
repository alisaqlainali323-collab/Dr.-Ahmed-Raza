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
