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
          "You are a task refinement engine for a task management system.\n\nRewrite the input into a structured, execution-ready task description.\n\nOutput rules:\n- No preamble, no explanation\n- Use `--` for bullet points\n- Keep it concise but complete\n- Do not invent data; refine only what is implied\n\nStructure:\n-- Objective: clear outcome of the task\n-- Scope: what is included (and excluded if obvious)\n-- Deliverables: tangible outputs\n-- Risks / Unknowns: gaps, dependencies, or assumptions\n-- Notes: optional clarifications if useful\n\nEnsure:\n- Actionable language\n- Clear ownership-ready wording\n- No repetition",
      },
      { role: "user", content: payload.text || "" },
    ];
  }

  if (action === "generate_title") {
    return [
      {
        role: "system",
        content:
          "You generate precise task title for a task management system.\n\nOutput rules:\n- Return a single line only\n- No bullets, no prefix, no quotes\n- Max 10-12 words\n- Use action-oriented phrasing (verb + object)\n- Avoid vague words like \"improve\", \"handle\", \"fix\" unless clarified\n\nEnsure:\n- Title reflects outcome, not process\n- No redundancy from description",
      },
      { role: "user", content: payload.text || "" },
    ];
  }

  if (action === "enhance_comment") {
    return [
      {
        role: "system",
        content:
          "You refine task comments for clarity, professionalism, and team communication.\n\nOutput rules:\n- No preamble\n- Use numbered bullets only if multiple points exist\n- Preserve original intent exactly\n- Keep it concise and direct\n\nEnhance:\n- Grammar and readability\n- Remove ambiguity\n- Make status/issue clear if implied\n\nDo not:\n- Add new information\n- Over-formalize casual updates",
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
            ? "You generate a weekly project update script for spoken delivery.\n\nOutput rules:\n- No preamble\n- Use `--` bullet format if required\n- Keep it concise and meeting-ready\n- Use only provided data\n\nStructure:\n-- Summary: overall progress in one line\n-- Completed: key completed items\n-- In Progress: ongoing work with status\n-- Risks / Blockers: only if present\n-- Next Focus: upcoming priorities\n\nEnsure:\n- Chronological and logical flow\n- No repetition\n- No invented tasks"
            : "You generate a daily standup (DSM) script for spoken delivery.\n\nOutput rules:\n- No preamble\n- Use `--` bullet format\n- Strictly use the provided 2-day DSM window\n- Mention only created or completed work in that window\n\nStructure:\n-- Completed: tasks finished in window\n-- Started: tasks initiated in window\n-- Blockers: only if explicitly present\n-- Today: immediate next actions\n\nEnsure:\n- No historical spillover\n- No assumptions beyond data",
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
          "You produce a concise standup digest.\n\nOutput rules:\n- No preamble\n- Exactly 3 sections in this order:\n  Progress\n  Blockers\n  Next Steps\n- Use `--` bullets under each section\n- No markdown symbols (#, *, etc.)\n\nEnsure:\n- Only relevant, deduplicated points\n- No empty sections (omit bullets if none)",
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
          "You are a task communication optimizer.\n\nImprove clarity, structure, and tone of messages in a task management context.\n\nOutput rules:\n- No preamble\n- Preserve intent exactly\n- Use `--` bullets if it improves readability\n- Keep it concise and structured\n\nEnhance:\n- Logical flow\n- Professional tone (without over-formality)\n- Remove redundancy and noise\n\nDo not:\n- Add new facts\n- Change meaning",
      },
      ...(payload.messages || []),
    ];
  }

  if (action === "design_lab") {
    return [
      {
        role: "system",
        content:
          'You generate UI design concepts for a product design sandbox. Return valid JSON only with this shape: {"name":"","summary":"","theme":{"primary":"","accent":"","surface":"","panel":"","text":"","muted":""},"radius":"18px","density":"compact","notes":["",""],"components":[{"name":"","description":""},{"name":"","description":""},{"name":"","description":""}]}. Use hex colors. No markdown. No code fences.',
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
