const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function parsePayload(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const raw = req.bodyText || req.body || "{}";
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function json(res, status, body) {
  return res.json(body, status);
}

function buildMessages(payload) {
  const { action } = payload;

  if (action === "enhance_description") {
    return [
      {
        role: "system",
        content:
          "You are an expert Agile Product Owner and Task Refinement Engine.\n\n" +
          "Your goal is to rewrite the raw, unstructured user input into a highly structured, clear, and execution-ready task description.\n\n" +
          "Guidelines:\n" +
          "- Respond ONLY with the refined description. Do not include any introduction, conversational preamble, conversational wrap-up, or markdown headings.\n" +
          "- Do not invent new data, assumptions, or requirements; refine and structure only what is provided or clearly implied in the input.\n" +
          "- Write in professional, actionable, and clear software development language.\n\n" +
          "Required Structure:\n" +
          "🎯 **Objective**:\n" +
          "[A single sentence describing the clear outcome and goal of this task]\n\n" +
          "📋 **Scope & Details**:\n" +
          "- [Point-by-point details explaining the requirements and boundaries based on input]\n\n" +
          "📦 **Deliverables**:\n" +
          "- [List tangible, verifiable outputs or deliverables]\n\n" +
          "⚠️ **Risks & Dependencies**:\n" +
          "- [List dependencies, constraints, or potential gaps mentioned in the input, or 'None' if none are implied]",
      },
      { role: "user", content: payload.text || "" },
    ];
  }

  if (action === "generate_title") {
    return [
      {
        role: "system",
        content:
          "You generate precise, descriptive, and action-oriented task titles for a software project management system.\n\n" +
          "Guidelines:\n" +
          "- Return exactly a single line of text representing the title. Do not include any bullets, quotes, prefixes (like 'Title:', 'Task:'), or preamble.\n" +
          "- Use active verb phrasing: [Active Verb] + [Direct Object] (e.g., 'Implement user logout flow', 'Optimize SQL indices for users table').\n" +
          "- Avoid vague, generic words such as 'improve', 'fix', 'handle', 'do', or 'change' unless specifically qualified.\n" +
          "- Keep the title under 60 characters and focused on the expected outcome.",
      },
      { role: "user", content: payload.text || "" },
    ];
  }

  if (action === "enhance_comment") {
    return [
      {
        role: "system",
        content:
          "You refine workspace task comments for clarity, professional communication, and constructive team collaboration.\n\n" +
          "Guidelines:\n" +
          "- Respond ONLY with the refined comment text. Do not include any greeting, preamble, or notes.\n" +
          "- Use structured lists (using numbered bullets) only if the input details multiple separate points.\n" +
          "- Preserve the user's original message, details, and meaning exactly without adding new facts or opinions.\n" +
          "- Correct grammar, spelling, and phrasing to be clear, polite, and professional while retaining a natural collaborative tone.",
      },
      { role: "user", content: payload.text || "" },
    ];
  }

  if (action === "script") {
    const context = payload.context || {};
    return [
      {
        role: "system",
        content:
          payload.mode === "weekly"
            ? "You are an executive presenter generating a weekly project sync script for spoken delivery.\n\n" +
              "Guidelines:\n" +
              "- Output ONLY the spoken sync script. Do not include introductory notes, slide labels, brackets, or conversational fillers. Write it ready to be read aloud directly.\n" +
              "- Structure the script with a clear, logical progress flow (e.g., accomplishments, current focus, and major upcoming items).\n" +
              "- Rely strictly on the provided context data; do not invent projects, metrics, or statuses."
            : "You generate a natural, concise daily standup (DSM) update script to be read aloud by a team member.\n\n" +
              "Guidelines:\n" +
              "- Output ONLY the script. No intro, greetings, or side comments. Write in the first person ('Yesterday I... Today I will...').\n" +
              "- Restrict updates strictly to the provided 2-day DSM window. Do not mention historical tasks or future roadmaps outside this data.\n" +
              "- Do not invent task statuses, estimates, or progress details.",
      },
      {
        role: "user",
        content: JSON.stringify({
          mode: payload.mode,
          context,
          tasks: payload.tasks || [],
        }),
      },
    ];
  }

  if (action === "standup_digest") {
    return [
      {
        role: "system",
        content:
          "You are an agile team lead summarizing sprint activity into a concise standup digest.\n\n" +
          "Guidelines:\n" +
          "- Do not output any introduction, summary text, or markdown title hashes. Start directly with the first section.\n" +
          "- Organize the response into exactly three sections in this order:\n\n" +
          "Progress:\n" +
          "[List of completed/ongoing tasks with numbered bullets]\n\n" +
          "Blockers:\n" +
          "[List of impediments or blockers. If none are specified in input, output 'None']\n\n" +
          "Next Steps:\n" +
          "[List of next immediate steps with numbered bullets]\n\n" +
          "- Ensure each item is concise, action-focused, and deduplicated.",
      },
      {
        role: "user",
        content: JSON.stringify(payload.context || {}),
      },
    ];
  }

  if (action === "chat") {
    return [
      {
        role: "system",
        content:
          "You are an AI assistant optimizing internal team chat communication for clarity, structure, and readability.\n\n" +
          "Guidelines:\n" +
          "- Output ONLY the optimized message body. No introduction or notes.\n" +
          "- Enhance grammar, logical flow, and layout structure (such as using '-' bullets for lists to make details readable).\n" +
          "- Keep the tone professional, friendly, and direct. Do not add outside facts or alter the core intent or meaning.",
      },
      ...(payload.messages || []),
    ];
  }

  if (action === "design_lab") {
    return [
      {
        role: "system",
        content:
          "You are a professional product UI/UX design assistant.\n\n" +
          "Guidelines:\n" +
          "- Return ONLY a valid, parseable JSON object with the exact schema shown below.\n" +
          "- Do not include markdown formatting, code block backticks (```json), prefixes, or explanation text. Output pure JSON.\n" +
          "- Use professional, modern color palettes with hex values.\n\n" +
          "JSON Schema:\n" +
          "{\n" +
          '  "name": "Design Concept Name",\n' +
          '  "summary": "Brief description of the design aesthetic and goals",\n' +
          '  "theme": {\n' +
          '    "primary": "#hex",\n' +
          '    "accent": "#hex",\n' +
          '    "surface": "#hex",\n' +
          '    "panel": "#hex",\n' +
          '    "text": "#hex",\n' +
          '    "muted": "#hex"\n' +
          "  },\n" +
          '  "radius": "e.g., 8px, 12px, 18px",\n' +
          '  "density": "compact | comfortable | loose",\n' +
          '  "notes": ["design rule 1", "design rule 2"],\n' +
          '  "components": [\n' +
          '    { "name": "component name", "description": "styling notes" }\n' +
          "  ]\n" +
          "}",
      },
      {
        role: "user",
        content: JSON.stringify({
          componentType: payload.componentType,
          styleDirection: payload.styleDirection,
          prompt: payload.prompt,
        }),
      },
    ];
  }

  return [];
}

async function callGroq(apiKey, model, messages) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Groq request failed with ${response.status}`);
  }

  return data.choices?.[0]?.message?.content?.trim() || "";
}

export default async ({ req, res, error }) => {
  try {
    const payload = parsePayload(req);
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) {
      return json(res, 500, { ok: false, error: "Missing GROQ_API_KEY in function variables." });
    }

    const messages = buildMessages(payload);
    if (messages.length === 0) {
      return json(res, 400, { ok: false, error: "Unsupported AI action." });
    }

    const output = await callGroq(apiKey, model, messages);
    return json(res, 200, {
      ok: true,
      output,
      title: payload.action === "generate_title" ? output : undefined,
      action: payload.action,
    });
  } catch (err) {
    error(err.message || String(err));
    return json(res, 500, { ok: false, error: err.message || "AI router failed." });
  }
};
