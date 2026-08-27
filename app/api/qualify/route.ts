import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const LeadSchema = z.object({
  company: z.string().trim().min(2).max(120),
  website: z.string().trim().url().max(300),
  service: z.string().trim().min(3).max(300),
  budget: z.string().trim().min(1).max(200),
  goal: z.string().trim().min(8).max(1000),
});

const ResultSchema = z.object({
  qualification: z.enum(["High", "Medium", "Low"]),
  score: z.number().int().min(0).max(100),
  reasoning: z.string().min(1).max(1200),
  missing_information: z.array(z.string()).max(8),
  next_best_action: z.string().min(1).max(500),
});

const resultJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    qualification: {
      type: "string",
      enum: ["High", "Medium", "Low"],
    },
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    reasoning: {
      type: "string",
    },
    missing_information: {
      type: "array",
      items: {
        type: "string",
      },
      maxItems: 8,
    },
    next_best_action: {
      type: "string",
    },
  },
  required: [
    "qualification",
    "score",
    "reasoning",
    "missing_information",
    "next_best_action",
  ],
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const supabase =
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
    : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate lead data
    const lead = LeadSchema.parse(body);

    // Check Groq API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    // Call Groq
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: `
You are an experienced B2B sales qualification assistant.

Your job is to evaluate an inbound lead based ONLY on the
information provided by the user.

Do NOT invent:
- company facts
- revenue
- employee count
- technology
- website content
- business information
- decision-maker information

The website URL should only be treated as an identifier.
Do not claim that you inspected or analyzed the website.

Qualification criteria:

HIGH:
- Strong purchase intent
- Specific service requirement
- Clear business goal
- Credible budget
- Good evidence of business need

MEDIUM:
- Potentially good fit
- Some important information is missing
- Budget, timeline, scope, or decision-maker may be unclear

LOW:
- Weak purchase intent
- Very vague requirement
- No meaningful budget
- Weak or unclear business goal
- Insufficient evidence for a higher qualification

Scoring:

High = 75-100
Medium = 45-74
Low = 0-44

The score must match the qualification.

Reasoning:
Explain clearly why the lead received the qualification.

Missing information:
Only identify information that would materially improve
the qualification decision.

Next best action:
Recommend ONE concrete sales action.

Examples:
- Schedule a discovery call
- Ask for project timeline
- Confirm budget
- Identify decision maker
- Request project requirements

Keep the reasoning concise and practical.
          `.trim(),
        },
        {
          role: "user",
          content: JSON.stringify(lead),
        },
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "lead_qualification",
          strict: true,
          schema: resultJsonSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response received from Groq.");
    }

    // Parse and validate AI response
    const result = ResultSchema.parse(JSON.parse(content));

    // Save to Supabase
    if (supabase) {
      const { error } = await supabase
        .from("lead_qualifications")
        .insert({
          company: lead.company,
          website: lead.website,
          service: lead.service,
          budget: lead.budget,
          goal: lead.goal,

          qualification: result.qualification,
          score: result.score,
          reasoning: result.reasoning,
          missing_information: result.missing_information,
          next_best_action: result.next_best_action,

          model:
            process.env.GROQ_MODEL ||
            "openai/gpt-oss-20b",
        });

      if (error) {
        console.error(
          "Supabase insert failed:",
          error.message
        );
      }
    }

    return NextResponse.json({
      result,
    });
  } catch (error) {
    console.error("Qualification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Please check the submitted lead details.",
          fields: error.flatten().fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to qualify this lead right now. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}