import {
  createHash,
} from "crypto";

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/* =========================================================
   GEMINI CONFIG
========================================================= */

const apiKey =
  process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is missing."
  );
}

const ai =
  new GoogleGenAI({
    apiKey,
  });

/* =========================================================
   TURNSTILE CONFIG
========================================================= */

const turnstileSecret =
  process.env.TURNSTILE_SECRET_KEY;

if (!turnstileSecret) {
  throw new Error(
    "TURNSTILE_SECRET_KEY is missing."
  );
}

/* =========================================================
   ANONYMOUS CONFIG
========================================================= */

const anonymousUsageSecret =
  process.env.ANONYMOUS_USAGE_SECRET;

if (!anonymousUsageSecret) {
  throw new Error(
    "ANONYMOUS_USAGE_SECRET is missing."
  );
}

/* =========================================================
   INPUT TYPES
========================================================= */

type ExperienceInput = {
  company?: unknown;
  position?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  description?: unknown;
};

type EducationInput = {
  school?: unknown;
  degree?: unknown;
  startDate?: unknown;
  endDate?: unknown;
};

type ProjectInput = {
  name?: unknown;
  role?: unknown;
  description?: unknown;
  link?: unknown;
};

type CertificationInput = {
  name?: unknown;
  issuer?: unknown;
  year?: unknown;
};

/* =========================================================
   RESUME OUTPUT
========================================================= */

type ResumeOutput = {
  summary: string;

  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];

  education: {
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }[];

  projects: {
    name: string;
    role: string;
    description: string;
    link: string;
  }[];

  certifications: {
    name: string;
    issuer: string;
    year: string;
  }[];

  languages: string[];

  skills: string[];
};

/* =========================================================
   QUOTA TYPES
========================================================= */

type QuotaResult = {
  allowed?: boolean;
  reason?: string;
  used?: number;
  limit?: number | null;
  remaining?: number | null;
  plan?: string;
  usage_month?: string;
};

/* =========================================================
   BASIC HELPERS
========================================================= */

function asString(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function asArray<T = unknown>(
  value: unknown
): T[] {
  return Array.isArray(value)
    ? value
    : [];
}

function cleanText(
  value: unknown
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .replace(
      /^[\s•●▪◦*-]+/,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

/* =========================================================
   SKILL NORMALIZATION
========================================================= */

function cleanSkill(
  value: unknown
): string {
  const skill =
    cleanText(value);

  if (!skill) {
    return "";
  }

  const specialCases: Record<
    string,
    string
  > = {
    html: "HTML",
    css: "CSS",

    js: "JavaScript",
    javascript:
      "JavaScript",

    ts: "TypeScript",
    typescript:
      "TypeScript",

    sql: "SQL",

    php: "PHP",
    mysql: "MySQL",
    mongodb: "MongoDB",

    nodejs: "Node.js",
    "node.js": "Node.js",

    react: "React",
    reactjs: "React",

    nextjs: "Next.js",
    "next.js": "Next.js",

    angular: "Angular",
    vue: "Vue",

    api: "API",
    ai: "AI",
    ui: "UI",
    ux: "UX",

    git: "Git",
    github: "GitHub",

    figma: "Figma",

    java: "Java",
    python: "Python",

    excel: "Microsoft Excel",

    powerpoint:
      "Microsoft PowerPoint",

    word:
      "Microsoft Word",
  };

  const normalized =
    skill.toLowerCase();

  if (
    specialCases[
      normalized
    ]
  ) {
    return specialCases[
      normalized
    ];
  }

  return skill
    .split(" ")
    .map(
      (word) => {
        if (!word) {
          return word;
        }

        return (
          word.charAt(0).toUpperCase() +
          word.slice(1)
        );
      }
    )
    .join(" ");
}

/* =========================================================
   MODEL FILTERING
========================================================= */

function isExcludedModel(
  name: string
): boolean {
  const lower =
    name.toLowerCase();

  return (
    lower.includes(
      "embedding"
    ) ||
    lower.includes("image") ||
    lower.includes("video") ||
    lower.includes("audio") ||
    lower.includes("tts") ||
    lower.includes("speech") ||
    lower.includes("live") ||
    lower.includes("robotics")
  );
}

/* =========================================================
   MODEL DISCOVERY
========================================================= */

async function discoverTextModels(): Promise<
  string[]
> {
  const available: string[] =
    [];

  try {
    const response =
      await ai.models.list();

    for await (
      const model of response
    ) {
      const name =
        model.name?.replace(
          /^models\//,
          ""
        );

      if (!name) {
        continue;
      }

      const actions =
        model.supportedActions ||
        [];

      if (
        !actions.includes(
          "generateContent"
        )
      ) {
        continue;
      }

      const lower =
        name.toLowerCase();

      if (
        !lower.includes(
          "gemini"
        )
      ) {
        continue;
      }

      if (
        isExcludedModel(
          name
        )
      ) {
        continue;
      }

      available.push(
        name
      );
    }
  } catch (error) {
    console.error(
      "Gemini model discovery failed:",
      error
    );

    throw new Error(
      "Could not discover available Gemini models."
    );
  }

  return Array.from(
    new Set(
      available
    )
  );
}

/* =========================================================
   MODEL PRIORITY
========================================================= */

function orderModels(
  available: string[]
): string[] {
  const preferred = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
  ];

  const ordered: string[] =
    [];

  for (
    const model of preferred
  ) {
    if (
      available.includes(
        model
      )
    ) {
      ordered.push(
        model
      );
    }
  }

  const flashModels =
    available.filter(
      (model) =>
        model
          .toLowerCase()
          .includes("flash")
    );

  for (
    const model of flashModels
  ) {
    if (
      !ordered.includes(
        model
      )
    ) {
      ordered.push(
        model
      );
    }
  }

  for (
    const model of available
  ) {
    if (
      !ordered.includes(
        model
      )
    ) {
      ordered.push(
        model
      );
    }
  }

  return ordered;
}

/* =========================================================
   ERROR STATUS
========================================================= */

function getErrorStatus(
  error: unknown
): number | null {
  if (
    error &&
    typeof error ===
      "object"
  ) {
    const record =
      error as Record<
        string,
        unknown
      >;

    if (
      typeof record.status ===
      "number"
    ) {
      return record.status;
    }

    if (
      typeof record.code ===
      "number"
    ) {
      return record.code;
    }
  }

  const message =
    error instanceof Error
      ? error.message
      : String(error);

  const match =
    message.match(
      /\b(400|401|403|404|408|409|429|500|502|503|504)\b/
    );

  return match
    ? Number(
        match[1]
      )
    : null;
}

/* =========================================================
   RETRYABLE ERRORS
========================================================= */

function isRetryableError(
  error: unknown
): boolean {
  const status =
    getErrorStatus(
      error
    );

  if (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes(
      "high demand"
    ) ||
    message.includes(
      "temporarily unavailable"
    ) ||
    message.includes(
      "rate limit"
    ) ||
    message.includes(
      "overloaded"
    ) ||
    message.includes(
      "timeout"
    )
  );
}

/* =========================================================
   MODEL UNAVAILABLE
========================================================= */

function isModelUnavailableError(
  error: unknown
): boolean {
  const status =
    getErrorStatus(
      error
    );

  if (
    status === 404
  ) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes(
      "model is no longer available"
    ) ||
    message.includes(
      "not available to new users"
    ) ||
    message.includes(
      "not found"
    )
  );
}

/* =========================================================
   DELAY
========================================================= */

async function wait(
  milliseconds: number
): Promise<void> {
  await new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

/* =========================================================
   GEMINI REQUEST
========================================================= */

async function generateWithModel(
  model: string,
  prompt: string,
  temperature: number
) {
  const delays = [
    500,
    1000,
    1800,
  ];

  for (
    let attempt = 0;
    attempt < 3;
    attempt++
  ) {
    try {
      console.log(
        `Trying ${model} (attempt ${
          attempt + 1
        }/3)`
      );

      return await ai.models.generateContent(
        {
          model,

          contents:
            prompt,

          config: {
            temperature,

            responseMimeType:
              "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        `${model} attempt ${
          attempt + 1
        } failed:`,
        error
      );

      if (
        isModelUnavailableError(
          error
        )
      ) {
        throw error;
      }

      if (
        isRetryableError(
          error
        ) &&
        attempt < 2
      ) {
        await wait(
          delays[attempt]
        );

        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Gemini generation failed."
  );
}

/* =========================================================
   MODEL FALLBACK
========================================================= */

async function generateResumeResponse(
  prompt: string,
  temperature: number
) {
  const available =
    await discoverTextModels();

  console.log(
    "Available resume models:",
    available
  );

  if (
    available.length ===
    0
  ) {
    throw new Error(
      "No compatible Gemini text models are available."
    );
  }

  const candidates =
    orderModels(
      available
    );

  let lastError:
    | unknown
    | null =
    null;

  for (
    const model of candidates.slice(
      0,
      5
    )
  ) {
    try {
      const response =
        await generateWithModel(
          model,
          prompt,
          temperature
        );

      return {
        response,
        model,
      };
    } catch (error) {
      lastError =
        error;

      console.error(
        `Model ${model} failed. Trying next available model.`
      );
    }
  }

  throw (
    lastError ||
    new Error(
      "All available Gemini models failed."
    )
  );
}

/* =========================================================
   NORMALIZE RESUME
========================================================= */

function normalizeResume(
  input: unknown
): ResumeOutput {
  const raw =
    input &&
    typeof input ===
      "object"
      ? (input as Record<
          string,
          unknown
        >)
      : {};

  return {
    summary:
      cleanText(
        raw.summary
      ),

    experience:
      asArray(
        raw.experience
      )
        .filter(
          (item) =>
            item &&
            typeof item ===
              "object"
        )
        .map((item) => {
          const job =
            item as Record<
              string,
              unknown
            >;

          return {
            company:
              asString(
                job.company
              ),

            position:
              asString(
                job.position
              ),

            startDate:
              asString(
                job.startDate
              ),

            endDate:
              asString(
                job.endDate
              ),

            bullets:
              asArray(
                job.bullets
              )
                .filter(
                  (
                    bullet
                  ) =>
                    typeof bullet ===
                    "string"
                )
                .map(
                  cleanText
                )
                .filter(
                  Boolean
                ),
          };
        })
        .filter(
          (job) =>
            job.company ||
            job.position ||
            job.bullets
              .length > 0
        ),

    education:
      asArray(
        raw.education
      )
        .filter(
          (item) =>
            item &&
            typeof item ===
              "object"
        )
        .map((item) => {
          const education =
            item as Record<
              string,
              unknown
            >;

          return {
            school:
              asString(
                education.school
              ),

            degree:
              asString(
                education.degree
              ),

            startDate:
              asString(
                education.startDate
              ),

            endDate:
              asString(
                education.endDate
              ),
          };
        })
        .filter(
          (education) =>
            education.school ||
            education.degree
        ),

    projects:
      asArray(
        raw.projects
      )
        .filter(
          (item) =>
            item &&
            typeof item ===
              "object"
        )
        .map((item) => {
          const project =
            item as Record<
              string,
              unknown
            >;

          return {
            name:
              asString(
                project.name
              ),

            role:
              asString(
                project.role
              ),

            description:
              cleanText(
                project.description
              ),

            link:
              asString(
                project.link
              ),
          };
        })
        .filter(
          (project) =>
            project.name ||
            project.description
        ),

    certifications:
      asArray(
        raw.certifications
      )
        .filter(
          (item) =>
            item &&
            typeof item ===
              "object"
        )
        .map((item) => {
          const certification =
            item as Record<
              string,
              unknown
            >;

          return {
            name:
              asString(
                certification.name
              ),

            issuer:
              asString(
                certification.issuer
              ),

            year:
              asString(
                certification.year
              ),
          };
        })
        .filter(
          (certification) =>
            certification.name
        ),

    languages:
      asArray(
        raw.languages
      )
        .filter(
          (
            language
          ) =>
            typeof language ===
            "string"
        )
        .map(
          cleanText
        )
        .filter(
          Boolean
        ),

    skills:
      asArray(
        raw.skills
      )
        .filter(
          (
            skill
          ) =>
            typeof skill ===
            "string"
        )
        .map(
          cleanSkill
        )
        .filter(
          Boolean
        ),
  };
}

/* =========================================================
   GENERATION PROMPT
========================================================= */

function buildGenerationPrompt(
  profile: Record<
    string,
    unknown
  >
): string {
  return `
You are ResumeForge AI.

You are an expert professional resume writer,
career editor, and ATS resume specialist.

Transform the user's raw career information
into a polished, professional, truthful resume.

The user may work in ANY industry.

NEVER invent:
- employers
- clients
- job titles
- responsibilities
- achievements
- metrics
- percentages
- revenue
- awards
- certifications
- licenses
- degrees
- schools
- dates
- technologies
- software
- skills
- projects
- languages
- proficiency levels

Only improve wording, organization,
clarity, grammar, and presentation.

Do not manufacture achievements.
Do not add fake numbers.
Do not invent outcomes.

Use concise professional language.

For experience:
turn rough descriptions into strong,
truthful resume bullets.

For skills:
normalize capitalization, but never invent skills.

For projects:
rewrite the provided description professionally.

For certifications and languages:
only preserve information actually supplied.

If a target job is provided, tailor the resume
toward it while remaining completely truthful.

Return ONLY valid JSON.

Use exactly:

{
  "summary": "",
  "experience": [
    {
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "bullets": []
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "startDate": "",
      "endDate": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "role": "",
      "description": "",
      "link": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "year": ""
    }
  ],
  "languages": [],
  "skills": []
}

USER PROFILE:

${JSON.stringify(
  profile,
  null,
  2
)}

Return JSON only.
`;
}

/* =========================================================
   EDIT PROMPT
========================================================= */

function buildEditPrompt(
  resume: unknown,
  instruction: string
): string {
  return `
You are ResumeForge AI, an expert resume editor.

The user already has a generated resume.

Edit the existing resume according to the user's
instruction.

USER INSTRUCTION:

${instruction}

CRITICAL RULES:

Never invent:
- employers
- job titles
- responsibilities
- achievements
- metrics
- numbers
- certifications
- licenses
- education
- technologies
- software
- skills
- projects
- clients
- awards
- dates

Preserve factual information.

Only improve what is necessary.

Keep unrelated sections intact.

Return the COMPLETE edited resume.

Examples:

"Make my summary stronger."
→ Improve only the summary while staying truthful.

"Make my experience concise."
→ Shorten bullets while preserving meaning.

"Fix grammar."
→ Correct grammar and wording.

"Make this more professional."
→ Improve tone without exaggerating.

"Tailor this to a retail job."
→ Emphasize relevant existing experience,
without inventing retail experience.

Return ONLY valid JSON.

Use exactly:

{
  "summary": "",
  "experience": [
    {
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "bullets": []
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "startDate": "",
      "endDate": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "role": "",
      "description": "",
      "link": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "year": ""
    }
  ],
  "languages": [],
  "skills": []
}

CURRENT RESUME:

${JSON.stringify(
  resume,
  null,
  2
)}

Return JSON only.
`;
}

/* =========================================================
   BUILD PROFILE
========================================================= */

function buildProfile(
  data: Record<
    string,
    unknown
  >
) {
  const experience =
    asArray<ExperienceInput>(
      data.experience
    )
      .map(
        (item) => ({
          company:
            asString(
              item.company
            ),

          position:
            asString(
              item.position
            ),

          startDate:
            asString(
              item.startDate
            ),

          endDate:
            asString(
              item.endDate
            ),

          description:
            typeof item.description ===
            "string"
              ? item.description
              : "",
        })
      )
      .filter(
        (item) =>
          item.company ||
          item.position ||
          item.description
      );

  const education =
    asArray<EducationInput>(
      data.education
    )
      .map(
        (item) => ({
          school:
            asString(
              item.school
            ),

          degree:
            asString(
              item.degree
            ),

          startDate:
            asString(
              item.startDate
            ),

          endDate:
            asString(
              item.endDate
            ),
        })
      )
      .filter(
        (item) =>
          item.school ||
          item.degree
      );

  const projects =
    asArray<ProjectInput>(
      data.projects
    )
      .map(
        (item) => ({
          name:
            asString(
              item.name
            ),

          role:
            asString(
              item.role
            ),

          description:
            typeof item.description ===
            "string"
              ? item.description
              : "",

          link:
            asString(
              item.link
            ),
        })
      )
      .filter(
        (item) =>
          item.name ||
          item.description
      );

  const certifications =
    asArray<CertificationInput>(
      data.certifications
    )
      .map(
        (item) => ({
          name:
            asString(
              item.name
            ),

          issuer:
            asString(
              item.issuer
            ),

          year:
            asString(
              item.year
            ),
        })
      )
      .filter(
        (item) =>
          item.name
      );

  return {
    personalInformation: {
      name:
        asString(
          data.name
        ),

      title:
        asString(
          data.title
        ),

      email:
        asString(
          data.email
        ),

      phone:
        asString(
          data.phone
        ),

      location:
        asString(
          data.location
        ),

      linkedin:
        asString(
          data.linkedin
        ),
    },

    summary:
      asString(
        data.summary
      ),

    experience,

    education,

    skills:
      asString(
        data.skills
      ),

    projects,

    certifications,

    languages:
      asString(
        data.languages
      ),

    targetJob:
      asString(
        data.jobDescription
      ),
  };
}

/* =========================================================
   TURNSTILE VERIFICATION
========================================================= */

async function verifyTurnstile(
  token: string,
  request: Request
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!token) {
    return {
      success: false,
      error:
        "Please complete the security verification.",
    };
  }

  const formData =
    new URLSearchParams();

  formData.append(
    "secret",
    turnstileSecret
  );

  formData.append(
    "response",
    token
  );

  /*
   * Pass Cloudflare's client IP when available.
   */
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for"
    );

  const connectingIp =
    request.headers.get(
      "cf-connecting-ip"
    );

  const clientIp =
    connectingIp ||
    forwardedFor
      ?.split(",")[0]
      .trim();

  if (clientIp) {
    formData.append(
      "remoteip",
      clientIp
    );
  }

  try {
    const response =
      await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body:
            formData.toString(),

          cache: "no-store",
        }
      );

    if (!response.ok) {
      console.error(
        "Turnstile siteverify HTTP error:",
        response.status
      );

      return {
        success: false,
        error:
          "Security verification is temporarily unavailable.",
      };
    }

    const result =
      (await response.json()) as {
        success?: boolean;
        "error-codes"?: string[];
      };

    if (!result.success) {
      console.warn(
        "Turnstile verification failed:",
        result[
          "error-codes"
        ] || []
      );

      return {
        success: false,
        error:
          "Security verification failed. Please try again.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Turnstile verification error:",
      error
    );

    return {
      success: false,
      error:
        "Security verification failed. Please try again.",
    };
  }
}

/* =========================================================
   ANONYMOUS IDENTITY HASH
========================================================= */

function buildAnonymousIdentityHash(
  request: Request
): string {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for"
    );

  const realIp =
    request.headers.get(
      "x-real-ip"
    );

  const cloudflareIp =
    request.headers.get(
      "cf-connecting-ip"
    );

  const userAgent =
    request.headers.get(
      "user-agent"
    ) || "";

  /*
   * Prefer the real client address supplied by
   * the deployment proxy.
   */
  let ip =
    cloudflareIp ||
    realIp ||
    forwardedFor
      ?.split(",")[0]
      .trim() ||
    "";

  if (!ip) {
    ip = "unknown-ip";
  }

  /*
   * This is intentionally a server-only hash.
   * We never expose the raw address to the client.
   */
  const rawIdentity = [
    ip,
    userAgent,
    "resumeforge-anonymous-v1",
  ].join("|");

  return createHash(
    "sha256"
  )
    .update(
      anonymousUsageSecret
    )
    .update("|")
    .update(
      rawIdentity
    )
    .digest("hex");
}

/* =========================================================
   RESERVE AUTHENTICATED QUOTA
========================================================= */

async function reserveGeneration(
  supabase: Awaited<
    ReturnType<
      typeof createClient
    >
  >,
  userId: string
): Promise<QuotaResult | null> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "reserve_resume_generation",
      {
        requesting_user_id:
          userId,
      }
    );

  if (error) {
    console.error(
      "Quota reservation failed:",
      error
    );

    throw new Error(
      "Could not verify your resume generation limit."
    );
  }

  if (
    !data ||
    typeof data !==
      "object"
  ) {
    return null;
  }

  return data as QuotaResult;
}

/* =========================================================
   RELEASE AUTHENTICATED QUOTA
========================================================= */

async function releaseGeneration(
  supabase: Awaited<
    ReturnType<
      typeof createClient
    >
  >,
  userId: string
): Promise<void> {
  try {
    const {
      error,
    } =
      await supabase.rpc(
        "release_resume_generation",
        {
          requesting_user_id:
            userId,
        }
      );

    if (error) {
      console.error(
        "Could not release reserved generation:",
        error
      );
    }
  } catch (error) {
    console.error(
      "Quota release failed:",
      error
    );
  }
}

/* =========================================================
   RESERVE ANONYMOUS QUOTA
========================================================= */

async function reserveAnonymousGeneration(
  identityHash: string
): Promise<QuotaResult | null> {
  /*
   * This RPC is service-role only.
   *
   * We intentionally use the server-side Supabase
   * service role for anonymous usage because anonymous
   * clients must never be able to modify/query the
   * usage table themselves.
   */

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    throw new Error(
      "Supabase service role configuration is missing."
    );
  }

  const response =
    await fetch(
      `${supabaseUrl}/rest/v1/rpc/reserve_anonymous_generation`,
      {
        method: "POST",

        headers: {
          apikey:
            serviceRoleKey,

          Authorization:
            `Bearer ${serviceRoleKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          requested_identity_hash:
            identityHash,
        }),

        cache: "no-store",
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    console.error(
      "Anonymous quota reservation failed:",
      response.status,
      text
    );

    throw new Error(
      "Could not verify anonymous generation availability."
    );
  }

  const data =
    await response.json();

  if (
    !data ||
    typeof data !==
      "object"
  ) {
    return null;
  }

  return data as QuotaResult;
}

/* =========================================================
   RELEASE ANONYMOUS QUOTA
========================================================= */

async function releaseAnonymousGeneration(
  identityHash: string
): Promise<void> {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      return;
    }

    const response =
      await fetch(
        `${supabaseUrl}/rest/v1/rpc/release_anonymous_generation`,
        {
          method: "POST",

          headers: {
            apikey:
              serviceRoleKey,

            Authorization:
              `Bearer ${serviceRoleKey}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            requested_identity_hash:
              identityHash,
          }),

          cache: "no-store",
        }
      );

    if (!response.ok) {
      console.error(
        "Anonymous quota release failed:",
        response.status
      );
    }
  } catch (error) {
    console.error(
      "Anonymous quota release error:",
      error
    );
  }
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: Request
) {
  let reservedUserId:
    | string
    | null =
    null;

  let reservedAnonymousHash:
    | string
    | null =
    null;

  try {
    const data =
      await request.json();

    if (
      !data ||
      typeof data !==
        "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      data as Record<
        string,
        unknown
      >;

    const mode =
      body.mode === "edit"
        ? "edit"
        : "generate";

    /* =====================================================
       SUPABASE SESSION
    ====================================================== */

    const supabase =
      await createClient();

    const {
      data: authData,
      error:
        authError,
    } =
      await supabase.auth.getUser();

    if (authError) {
      console.error(
        "Could not read Supabase user:",
        authError
      );
    }

    const user =
      authData.user;

    /* =====================================================
       EDIT MODE
       
       AI editing remains outside the 3/month
       new-resume quota.
    ====================================================== */

    if (
      mode === "edit"
    ) {
      const instruction =
        asString(
          body.instruction
        );

      if (!body.resume) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Resume data is required.",
          },
          {
            status: 400,
          }
        );
      }

      if (!instruction) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please tell the AI what you want changed.",
          },
          {
            status: 400,
          }
        );
      }

      const currentResume =
        normalizeResume(
          body.resume
        );

      const prompt =
        buildEditPrompt(
          currentResume,
          instruction
        );

      const {
        response,
        model,
      } =
        await generateResumeResponse(
          prompt,
          0.2
        );

      const text =
        response.text;

      if (!text) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      let parsed:
        | unknown;

      try {
        parsed =
          JSON.parse(
            text
          );
      } catch {
        console.error(
          "Gemini edit returned invalid JSON:",
          text
        );

        throw new Error(
          "The AI editor returned invalid resume data."
        );
      }

      const editedResume =
        normalizeResume(
          parsed
        );

      console.log(
        `Resume edit completed successfully using ${model}.`
      );

      return NextResponse.json({
        success: true,

        mode: "edit",

        model,

        resume:
          editedResume,
      });
    }

    /* =====================================================
       GENERATE MODE VALIDATION
    ====================================================== */

    const name =
      asString(
        body.name
      );

    const email =
      asString(
        body.email
      );

    if (
      !name ||
      !email
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name and email are required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       ACCOUNT QUOTA
    ====================================================== */

    let quota:
      | QuotaResult
      | null =
      null;

    if (user) {
      /*
       * Authenticated users use the normal
       * Supabase monthly allowance.
       */
      quota =
        await reserveGeneration(
          supabase,
          user.id
        );

      if (
        quota?.reason ===
        "profile_not_found"
      ) {
        return NextResponse.json(
          {
            success: false,

            code:
              "PROFILE_NOT_FOUND",

            error:
              "Your account profile could not be found. Please sign in again.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        quota?.reason ===
        "unauthorized"
      ) {
        return NextResponse.json(
          {
            success: false,

            code:
              "UNAUTHORIZED",

            error:
              "Your authentication session is invalid. Please sign in again.",
          },
          {
            status: 401,
          }
        );
      }

      if (
        quota?.reason ===
        "monthly_limit"
      ) {
        return NextResponse.json(
          {
            success: false,

            code:
              "MONTHLY_LIMIT_REACHED",

            error:
              "You've used all 3 free resume generations this month.",

            usage: {
              plan:
                quota.plan ??
                "free",

              used:
                quota.used ??
                3,

              limit:
                quota.limit ??
                3,

              remaining: 0,

              usageMonth:
                quota.usage_month ??
                "",
            },
          },
          {
            status: 429,
          }
        );
      }

      if (
        quota &&
        quota.allowed !==
          true
      ) {
        return NextResponse.json(
          {
            success: false,

            error:
              "Your account is not currently allowed to generate a resume.",
          },
          {
            status: 403,
          }
        );
      }

      reservedUserId =
        user.id;
    }

    /* =====================================================
       ANONYMOUS QUOTA
       
       Anonymous requests:
       1. Verify Turnstile
       2. Build server-side identity
       3. Reserve one lifetime generation
       ====================================================== */

    if (!user) {
      const turnstileToken =
        asString(
          body.turnstileToken
        );

      const turnstile =
        await verifyTurnstile(
          turnstileToken,
          request
        );

      if (
        !turnstile.success
      ) {
        return NextResponse.json(
          {
            success: false,

            code:
              "TURNSTILE_FAILED",

            error:
              turnstile.error ||
              "Security verification failed. Please try again.",
          },
          {
            status: 403,
          }
        );
      }

      const identityHash =
        buildAnonymousIdentityHash(
          request
        );

      const anonymousQuota =
        await reserveAnonymousGeneration(
          identityHash
        );

      if (
        anonymousQuota?.reason ===
        "anonymous_limit"
      ) {
        return NextResponse.json(
          {
            success: false,

            code:
              "ANONYMOUS_LIMIT_REACHED",

            error:
              "You've already used your free anonymous resume generation. Create a free account to continue.",

            usage: {
              authenticated:
                false,

              used:
                anonymousQuota.used ??
                1,

              limit: 1,

              remaining: 0,
            },
          },
          {
            status: 429,
          }
        );
      }

      if (
        anonymousQuota?.reason ===
        "invalid_identity"
      ) {
        return NextResponse.json(
          {
            success: false,

            code:
              "INVALID_ANONYMOUS_IDENTITY",

            error:
              "We couldn't establish a valid session for this request. Please try again.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !anonymousQuota ||
        anonymousQuota.allowed !==
          true
      ) {
        return NextResponse.json(
          {
            success: false,

            code:
              "ANONYMOUS_GENERATION_BLOCKED",

            error:
              "Anonymous resume generation is currently unavailable.",
          },
          {
            status: 403,
          }
        );
      }

      reservedAnonymousHash =
        identityHash;
    }

    /* =====================================================
       BUILD PROFILE
    ====================================================== */

    const profile =
      buildProfile(
        body
      );

    const prompt =
      buildGenerationPrompt(
        profile
      );

    /* =====================================================
       GEMINI
    ====================================================== */

    const {
      response,
      model,
    } =
      await generateResumeResponse(
        prompt,
        0.25
      );

    const text =
      response.text;

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    let parsed:
      | unknown;

    try {
      parsed =
        JSON.parse(
          text
        );
    } catch {
      console.error(
        "Gemini generation returned invalid JSON:",
        text
      );

      throw new Error(
        "The AI returned invalid resume data."
      );
    }

    const resume =
      normalizeResume(
        parsed
      );

    /* =====================================================
       SUCCESS
    ====================================================== */

    console.log(
      `Resume generated successfully using ${model}.`
    );

    return NextResponse.json({
      success: true,

      mode: "generate",

      model,

      resume,

      usage:
        user &&
        quota
          ? {
              authenticated:
                true,

              plan:
                quota.plan ??
                "free",

              used:
                quota.used ??
                0,

              limit:
                quota.limit ??
                3,

              remaining:
                quota.remaining ??
                0,

              usageMonth:
                quota.usage_month ??
                "",
            }
          : {
              authenticated:
                false,

              anonymous:
                true,

              used: 1,

              limit: 1,

              remaining: 0,
            },
    });
  } catch (error) {
    /* =====================================================
       RELEASE AUTHENTICATED SLOT
    ====================================================== */

    if (
      reservedUserId
    ) {
      try {
        const supabase =
          await createClient();

        await releaseGeneration(
          supabase,
          reservedUserId
        );
      } catch (
        releaseError
      ) {
        console.error(
          "Quota release error:",
          releaseError
        );
      }
    }

    /* =====================================================
       RELEASE ANONYMOUS SLOT
    ====================================================== */

    if (
      reservedAnonymousHash
    ) {
      await releaseAnonymousGeneration(
        reservedAnonymousHash
      );
    }

    console.error(
      "Resume AI error:",
      error
    );

    const status =
      getErrorStatus(
        error
      );

    const responseStatus =
      status &&
      status >= 400 &&
      status < 600
        ? status
        : 500;

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Resume generation failed.",
      },
      {
        status:
          responseStatus,
      }
    );
  }
}