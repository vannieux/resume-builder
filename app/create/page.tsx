"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Turnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";

/* =========================================================
   TYPES
========================================================= */

type Experience = {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Education = {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
};

type Project = {
  name: string;
  role: string;
  description: string;
  link: string;
};

type Certification = {
  name: string;
  issuer: string;
  year: string;
};

type Resume = {
  summary: string;

  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];

  education: Education[];

  projects: {
    name: string;
    role: string;
    description: string;
    link: string;
  }[];

  certifications: Certification[];

  languages: string[];

  skills: string[];
};

type PersonalInfo = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
};

type Template =
  | "modern"
  | "classic"
  | "minimal";

type FormDataState = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;

  summary: string;

  experience: Experience[];

  education: Education[];

  skills: string;

  projects: Project[];

  certifications: Certification[];

  languages: string;

  jobDescription: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const LOADING_MESSAGES = [
  "Reading your experience...",
  "Understanding your background...",
  "Finding your strongest points...",
  "Pulling out the useful details...",
  "Polishing your work history...",
  "Improving your professional summary...",
  "Turning rough notes into stronger wording...",
  "Organizing your experience...",
  "Cleaning up your skills...",
  "Analyzing your projects...",
  "Checking your career story...",
  "Matching your strengths to the role...",
  "Improving recruiter readability...",
  "Checking your resume structure...",
  "Removing unnecessary wording...",
  "Making everything consistent...",
  "Checking for weak phrases...",
  "Making your strongest points stand out...",
  "Running the final resume review...",
  "Almost there...",
];

const STORAGE_KEY =
  "resumeforge-last-result";

const TEMPLATE_STORAGE_KEY =
  "resumeforge-template";

/* =========================================================
   EMPTY OBJECTS
========================================================= */

function emptyExperience(): Experience {
  return {
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
  };
}

function emptyEducation(): Education {
  return {
    school: "",
    degree: "",
    startDate: "",
    endDate: "",
  };
}

function emptyProject(): Project {
  return {
    name: "",
    role: "",
    description: "",
    link: "",
  };
}

function emptyCertification(): Certification {
  return {
    name: "",
    issuer: "",
    year: "",
  };
}

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM: FormDataState = {
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",

  summary: "",

  experience: [
    emptyExperience(),
  ],

  education: [
    emptyEducation(),
  ],

  skills: "",

  projects: [],

  certifications: [],

  languages: "",

  jobDescription: "",
};

/* =========================================================
   PAGE
========================================================= */

export default function CreateResume() {
  const [form, setForm] =
    useState<FormDataState>(
      INITIAL_FORM
    );

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [messageIndex, setMessageIndex] =
    useState(0);

  const [resume, setResume] =
    useState<Resume | null>(null);

  const [personalInfo, setPersonalInfo] =
    useState<PersonalInfo | null>(null);

  const [template, setTemplate] =
    useState<Template>("modern");

  const [aiEditing, setAiEditing] =
    useState(false);

  const [editInstruction, setEditInstruction] =
    useState("");

  const loadingRef =
    useRef<HTMLElement | null>(null);

  const resultRef =
    useRef<HTMLElement | null>(null);

  const turnstileRef =
    useRef<TurnstileInstance | null>(null);

  const [turnstileToken, setTurnstileToken] =
    useState("");

  const [anonymousLimitMessage, setAnonymousLimitMessage] =
    useState("");

  /* =======================================================
     RESTORE TEMPLATE
  ======================================================== */

  useEffect(() => {
    try {
      const savedTemplate =
        sessionStorage.getItem(
          TEMPLATE_STORAGE_KEY
        );

      if (
        savedTemplate === "modern" ||
        savedTemplate === "classic" ||
        savedTemplate === "minimal"
      ) {
        setTemplate(
          savedTemplate
        );
      }
    } catch {
      // Ignore storage failures.
    }
  }, []);

  /* =======================================================
     RESTORE GENERATED RESUME
  ======================================================== */

  useEffect(() => {
    try {
      const raw =
        sessionStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return;
      }

      const parsed =
        JSON.parse(raw);

      if (
        parsed?.resume &&
        parsed?.personalInfo
      ) {
        setResume(
          sanitizeResume(
            parsed.resume
          )
        );

        setPersonalInfo(
          sanitizePersonalInfo(
            parsed.personalInfo
          )
        );
      }
    } catch (error) {
      console.error(
        "Could not restore saved resume:",
        error
      );

      sessionStorage.removeItem(
        STORAGE_KEY
      );
    }
  }, []);

  /* =======================================================
     LOADING TEXT ROTATION
  ======================================================== */

  useEffect(() => {
    if (!loading) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setMessageIndex(
          (current) =>
            (current + 1) %
            LOADING_MESSAGES.length
        );
      }, 2600);

    return () =>
      window.clearInterval(
        interval
      );
  }, [loading]);

  /* =======================================================
     PROGRESS SIMULATION
  ======================================================== */

  useEffect(() => {
    if (!loading) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setProgress((current) => {
          if (current >= 92) {
            return current;
          }

          let increment = 0.35;

          if (current < 20) {
            increment = 2.4;
          } else if (current < 45) {
            increment = 1.6;
          } else if (current < 70) {
            increment = 0.9;
          }

          return Math.min(
            92,
            current + increment
          );
        });
      }, 180);

    return () =>
      window.clearInterval(
        interval
      );
  }, [loading]);

  /* =======================================================
     SCROLL TO LOADING
  ======================================================== */

  useEffect(() => {
    if (!loading) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        loadingRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "center",
          }
        );
      }, 120);

    return () =>
      window.clearTimeout(
        timer
      );
  }, [loading]);

  /* =======================================================
     SCROLL TO RESULT
  ======================================================== */

  useEffect(() => {
    if (
      !resume ||
      !personalInfo ||
      loading
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          }
        );
      }, 250);

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    resume,
    personalInfo,
    loading,
  ]);

  /* =======================================================
     GENERIC FIELD UPDATE
  ======================================================== */

  function updateField<
    K extends keyof FormDataState
  >(
    field: K,
    value: FormDataState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =======================================================
     EXPERIENCE
  ======================================================== */

  function updateExperience(
    index: number,
    field: keyof Experience,
    value: string
  ) {
    setForm((current) => ({
      ...current,

      experience:
        current.experience.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  }

  function addExperience() {
    setForm((current) => ({
      ...current,

      experience: [
        ...current.experience,
        emptyExperience(),
      ],
    }));
  }

  function removeExperience(
    index: number
  ) {
    setForm((current) => ({
      ...current,

      experience:
        current.experience.length ===
        1
          ? [
              emptyExperience(),
            ]
          : current.experience.filter(
              (_, itemIndex) =>
                itemIndex !== index
            ),
    }));
  }

  /* =======================================================
     EDUCATION
  ======================================================== */

  function updateEducation(
    index: number,
    field: keyof Education,
    value: string
  ) {
    setForm((current) => ({
      ...current,

      education:
        current.education.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  }

  function addEducation() {
    setForm((current) => ({
      ...current,

      education: [
        ...current.education,
        emptyEducation(),
      ],
    }));
  }

  function removeEducation(
    index: number
  ) {
    setForm((current) => ({
      ...current,

      education:
        current.education.length ===
        1
          ? [
              emptyEducation(),
            ]
          : current.education.filter(
              (_, itemIndex) =>
                itemIndex !== index
            ),
    }));
  }

  /* =======================================================
     PROJECTS
  ======================================================== */

  function updateProject(
    index: number,
    field: keyof Project,
    value: string
  ) {
    setForm((current) => ({
      ...current,

      projects:
        current.projects.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  }

  function addProject() {
    setForm((current) => ({
      ...current,

      projects: [
        ...current.projects,
        emptyProject(),
      ],
    }));
  }

  function removeProject(
    index: number
  ) {
    setForm((current) => ({
      ...current,

      projects:
        current.projects.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    }));
  }

  /* =======================================================
     CERTIFICATIONS
  ======================================================== */

  function updateCertification(
    index: number,
    field: keyof Certification,
    value: string
  ) {
    setForm((current) => ({
      ...current,

      certifications:
        current.certifications.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  }

  function addCertification() {
    setForm((current) => ({
      ...current,

      certifications: [
        ...current.certifications,
        emptyCertification(),
      ],
    }));
  }

  function removeCertification(
    index: number
  ) {
    setForm((current) => ({
      ...current,

      certifications:
        current.certifications.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    }));
  }

  /* =======================================================
     TEMPLATE
  ======================================================== */

  function changeTemplate(
    nextTemplate: Template
  ) {
    setTemplate(
      nextTemplate
    );

    try {
      sessionStorage.setItem(
        TEMPLATE_STORAGE_KEY,
        nextTemplate
      );
    } catch {
      // Ignore storage failures.
    }
  }

  /* =======================================================
     GENERATE
  ======================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setResume(null);
    setPersonalInfo(null);
    setAnonymousLimitMessage("");

    const token =
      turnstileToken ||
      turnstileRef.current?.getResponse() ||
      "";

    if (!token) {
      alert(
        "Please complete the security check before creating your resume."
      );
      return;
    }

    setLoading(true);
    setProgress(3);
    setMessageIndex(0);

    document.body.classList.add(
      "resume-generating"
    );

    try {
      const response =
        await fetch(
          "/api/generate",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              ...form,
              turnstileToken: token,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        if (
          result.code ===
          "ANONYMOUS_LIMIT_REACHED"
        ) {
          setAnonymousLimitMessage(
            result.error ||
              "Your free resume has already been used. Create a free account to continue."
          );
        }

        throw new Error(
          result.error ||
            "Something went wrong."
        );
      }

      const generatedResume =
        sanitizeResume(
          result.resume
        );

      const generatedPersonalInfo: PersonalInfo =
        {
          name: form.name,
          title: form.title,
          email: form.email,
          phone: form.phone,
          location: form.location,
          linkedin: form.linkedin,
        };

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          resume:
            generatedResume,

          personalInfo:
            generatedPersonalInfo,
        })
      );

      setResume(
        generatedResume
      );

      setPersonalInfo(
        generatedPersonalInfo
      );

      setProgress(100);

      await delay(650);
    } catch (error) {
      console.error(
        "Resume generation failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Could not create your resume."
      );

      setResume(null);
      setPersonalInfo(null);
      setProgress(0);
    } finally {
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setLoading(false);

      window.setTimeout(() => {
        document.body.classList.remove(
          "resume-generating"
        );
      }, 700);
    }
  }

  /* =======================================================
     AI EDIT
  ======================================================== */

  async function handleAIEdit(
    instruction: string
  ) {
    const cleanInstruction =
      instruction.trim();

    if (
      !resume ||
      !personalInfo ||
      aiEditing ||
      !cleanInstruction
    ) {
      return;
    }

    setAiEditing(true);

    try {
      const response =
        await fetch(
          "/api/generate",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              mode: "edit",
              instruction:
                cleanInstruction,
              resume,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "AI editing failed."
        );
      }

      const editedResume =
        sanitizeResume(
          result.resume
        );

      setResume(
        editedResume
      );

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          resume:
            editedResume,

          personalInfo,
        })
      );

      setEditInstruction("");

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          }
        );
      }, 150);
    } catch (error) {
      console.error(
        "AI edit failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Could not edit your resume."
      );
    } finally {
      setAiEditing(false);
    }
  }

  function quickAIEdit(
    instruction: string
  ) {
    handleAIEdit(
      instruction
    );
  }

  /* =======================================================
     START OVER
  ======================================================== */

  function handleStartOver() {
    sessionStorage.removeItem(
      STORAGE_KEY
    );

    setResume(null);
    setPersonalInfo(null);

    setProgress(0);

    setAiEditing(false);
    setEditInstruction("");
    setAnonymousLimitMessage("");
    turnstileRef.current?.reset();
    setTurnstileToken("");

    setForm(
      cloneInitialForm()
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     PRINT / PDF
  ======================================================== */

  function handlePrint() {
    window.print();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f3] text-zinc-900">

      {/* ===================================================
          GENERATION EDGE GLOW
      ==================================================== */}

      {loading && (
        <div
          className="generation-edge-layer"
          aria-hidden="true"
        >
          <div className="generation-edge generation-edge-top" />

          <div className="generation-edge generation-edge-right" />

          <div className="generation-edge generation-edge-bottom" />

          <div className="generation-edge generation-edge-left" />

          <div className="generation-bloom generation-bloom-left" />

          <div className="generation-bloom generation-bloom-right" />

          <div className="generation-wave generation-wave-one" />

          <div className="generation-wave generation-wave-two" />
        </div>
      )}

      {/* ===================================================
          NAV
      ==================================================== */}

      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[#f5f5f3]/90 backdrop-blur-xl print:hidden">

        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">

          <a
            href="/"
            className="group flex items-center gap-2.5"
          >
            <span className="brand-mark">
              R
            </span>

            <span className="text-[17px] font-bold tracking-[-0.04em]">
              ResumeForge
            </span>
          </a>

          <div className="flex items-center gap-2">

            <a
              href="/account"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-white hover:text-zinc-900"
            >
              Account
            </a>

            <a
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-white hover:text-zinc-900"
            >
              Exit
            </a>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">

        {/* =================================================
            HERO
        ================================================== */}

        {!resume && (
          <section className="mb-11 max-w-3xl print:hidden">

            <div className="status-pill">
              <span className="status-dot" />

              AI-powered resume builder
            </div>

            <h1 className="hero-title mt-5">
              Your experience.
              <br />

              <span>
                Better presented.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-[15px] leading-7 text-zinc-500 sm:text-base">
              Tell us what you've
              actually done. Add as
              much or as little as you
              have. ResumeForge handles
              the professional
              presentation.
            </p>
          </section>
        )}

        {/* =================================================
            FORM
        ================================================== */}

        {!resume && (
          <form
            onSubmit={handleSubmit}
            className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px] print:hidden"
          >

            <div className="space-y-4">

              {/* ABOUT */}

              <FormCard
                number="01"
                title="About you"
                description="The information recruiters see first."
              >
                <div className="grid gap-5 sm:grid-cols-2">

                  <Field
                    label="Full name"
                    value={form.name}
                    onChange={(value) =>
                      updateField(
                        "name",
                        value
                      )
                    }
                    placeholder="John Doe"
                    required
                  />

                  <Field
                    label="Professional title"
                    value={form.title}
                    onChange={(value) =>
                      updateField(
                        "title",
                        value
                      )
                    }
                    placeholder="Marketing Assistant"
                  />

                  <Field
                    label="Email"
                    value={form.email}
                    onChange={(value) =>
                      updateField(
                        "email",
                        value
                      )
                    }
                    type="email"
                    placeholder="john@example.com"
                    required
                  />

                  <Field
                    label="Phone"
                    value={form.phone}
                    onChange={(value) =>
                      updateField(
                        "phone",
                        value
                      )
                    }
                    placeholder="+63 912 345 6789"
                  />

                  <Field
                    label="Location"
                    value={form.location}
                    onChange={(value) =>
                      updateField(
                        "location",
                        value
                      )
                    }
                    placeholder="Makati, Metro Manila"
                  />

                  <Field
                    label="LinkedIn"
                    value={form.linkedin}
                    onChange={(value) =>
                      updateField(
                        "linkedin",
                        value
                      )
                    }
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
              </FormCard>

              {/* SUMMARY */}

              <FormCard
                number="02"
                title="Professional summary"
                description="Write naturally. The AI handles the polish."
              >
                <TextareaField
                  label="Your story"
                  value={form.summary}
                  onChange={(value) =>
                    updateField(
                      "summary",
                      value
                    )
                  }
                  placeholder="I'm a student who enjoys working with people and technology..."
                  rows={7}
                />
              </FormCard>

              {/* EXPERIENCE */}

              <FormCard
                number="03"
                title="Work experience"
                description="Add every job, internship, freelance role, or relevant work."
              >
                <div className="space-y-6">

                  {form.experience.map(
                    (
                      experience,
                      index
                    ) => (
                      <div
                        key={index}
                        className="entry-card"
                      >

                        <div className="entry-header">

                          <div>
                            <p className="entry-label">
                              Experience{" "}
                              {index + 1}
                            </p>

                            <p className="mt-1 text-xs text-zinc-400">
                              Tell us what you
                              actually did.
                            </p>
                          </div>

                          {form.experience.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeExperience(
                                  index
                                )
                              }
                              className="remove-button"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                          <Field
                            label="Company"
                            value={
                              experience.company
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "company",
                                value
                              )
                            }
                            placeholder="Company name"
                          />

                          <Field
                            label="Position"
                            value={
                              experience.position
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "position",
                                value
                              )
                            }
                            placeholder="Crew Member"
                          />

                          <Field
                            label="Start date"
                            value={
                              experience.startDate
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "startDate",
                                value
                              )
                            }
                            placeholder="July 2025"
                          />

                          <Field
                            label="End date"
                            value={
                              experience.endDate
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "endDate",
                                value
                              )
                            }
                            placeholder="December 2025"
                          />
                        </div>

                        <div className="mt-5">

                          <TextareaField
                            label="What did you do?"
                            value={
                              experience.description
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "description",
                                value
                              )
                            }
                            placeholder={`I handled customers.
I processed payments.
I worked during busy hours.
I helped coworkers.
I maintained the workspace.`}
                            rows={8}
                          />
                        </div>
                      </div>
                    )
                  )}

                  <AddButton
                    onClick={
                      addExperience
                    }
                  >
                    + Add another experience
                  </AddButton>
                </div>
              </FormCard>

              {/* EDUCATION */}

              <FormCard
                number="04"
                title="Education"
                description="Add universities, schools, training programs, or other education."
              >
                <div className="space-y-6">

                  {form.education.map(
                    (
                      education,
                      index
                    ) => (
                      <div
                        key={index}
                        className="entry-card"
                      >

                        <div className="entry-header">

                          <p className="entry-label">
                            Education{" "}
                            {index + 1}
                          </p>

                          {form.education.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeEducation(
                                  index
                                )
                              }
                              className="remove-button"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                          <Field
                            label="School"
                            value={
                              education.school
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "school",
                                value
                              )
                            }
                            placeholder="University Name"
                          />

                          <Field
                            label="Degree / Program"
                            value={
                              education.degree
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "degree",
                                value
                              )
                            }
                            placeholder="Bachelor of Computer Science"
                          />

                          <Field
                            label="Start year"
                            value={
                              education.startDate
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "startDate",
                                value
                              )
                            }
                            placeholder="2025"
                          />

                          <Field
                            label="End year"
                            value={
                              education.endDate
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "endDate",
                                value
                              )
                            }
                            placeholder="2029"
                          />
                        </div>
                      </div>
                    )
                  )}

                  <AddButton
                    onClick={
                      addEducation
                    }
                  >
                    + Add another education
                  </AddButton>
                </div>
              </FormCard>

              {/* SKILLS */}

              <FormCard
                number="05"
                title="Skills"
                description="Technical, professional, creative, practical, or interpersonal skills."
              >
                <Field
                  label="Your skills"
                  value={form.skills}
                  onChange={(value) =>
                    updateField(
                      "skills",
                      value
                    )
                  }
                  placeholder="Customer Service, Communication, Excel, Leadership"
                />

                <p className="mt-3 text-xs text-zinc-400">
                  Separate skills with
                  commas.
                </p>
              </FormCard>

              {/* PROJECTS */}

              <FormCard
                number="06"
                title="Projects"
                description="Great for students, freelancers, creatives, developers, and career changers."
                optional
              >
                <div className="space-y-6">

                  {form.projects.length ===
                    0 && (
                    <EmptyOptional
                      title="No projects yet"
                      description="Projects can show what you can do even when you don't have formal work experience."
                      button="Add a project"
                      onClick={
                        addProject
                      }
                    />
                  )}

                  {form.projects.map(
                    (
                      project,
                      index
                    ) => (
                      <div
                        key={index}
                        className="entry-card"
                      >

                        <div className="entry-header">

                          <p className="entry-label">
                            Project{" "}
                            {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removeProject(
                                index
                              )
                            }
                            className="remove-button"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                          <Field
                            label="Project name"
                            value={
                              project.name
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "name",
                                value
                              )
                            }
                            placeholder="Personal Website"
                          />

                          <Field
                            label="Your role"
                            value={
                              project.role
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "role",
                                value
                              )
                            }
                            placeholder="Designer / Developer"
                          />
                        </div>

                        <div className="mt-5">

                          <TextareaField
                            label="What did you build or do?"
                            value={
                              project.description
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "description",
                                value
                              )
                            }
                            placeholder="Built a responsive website for..."
                            rows={6}
                          />
                        </div>

                        <div className="mt-5">

                          <Field
                            label="Project link"
                            value={
                              project.link
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "link",
                                value
                              )
                            }
                            placeholder="github.com/... or example.com"
                          />
                        </div>
                      </div>
                    )
                  )}

                  {form.projects.length >
                    0 && (
                    <AddButton
                      onClick={
                        addProject
                      }
                    >
                      + Add another project
                    </AddButton>
                  )}
                </div>
              </FormCard>

              {/* CERTIFICATIONS */}

              <FormCard
                number="07"
                title="Certifications"
                description="Certifications, licenses, courses, or credentials."
                optional
              >
                <div className="space-y-6">

                  {form.certifications.length ===
                    0 && (
                    <EmptyOptional
                      title="No certifications yet"
                      description="Add relevant certificates or credentials to strengthen your resume."
                      button="Add certification"
                      onClick={
                        addCertification
                      }
                    />
                  )}

                  {form.certifications.map(
                    (
                      certification,
                      index
                    ) => (
                      <div
                        key={index}
                        className="entry-card"
                      >

                        <div className="entry-header">

                          <p className="entry-label">
                            Certification{" "}
                            {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removeCertification(
                                index
                              )
                            }
                            className="remove-button"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                          <Field
                            label="Certification"
                            value={
                              certification.name
                            }
                            onChange={(
                              value
                            ) =>
                              updateCertification(
                                index,
                                "name",
                                value
                              )
                            }
                            placeholder="Google Data Analytics"
                          />

                          <Field
                            label="Issuer"
                            value={
                              certification.issuer
                            }
                            onChange={(
                              value
                            ) =>
                              updateCertification(
                                index,
                                "issuer",
                                value
                              )
                            }
                            placeholder="Google"
                          />

                          <Field
                            label="Year"
                            value={
                              certification.year
                            }
                            onChange={(
                              value
                            ) =>
                              updateCertification(
                                index,
                                "year",
                                value
                              )
                            }
                            placeholder="2026"
                          />
                        </div>
                      </div>
                    )
                  )}

                  {form.certifications.length >
                    0 && (
                    <AddButton
                      onClick={
                        addCertification
                      }
                    >
                      + Add another certification
                    </AddButton>
                  )}
                </div>
              </FormCard>

              {/* LANGUAGES */}

              <FormCard
                number="08"
                title="Languages"
                description="Useful for international, customer-facing, hospitality, and many other roles."
                optional
              >
                <Field
                  label="Languages"
                  value={
                    form.languages
                  }
                  onChange={(value) =>
                    updateField(
                      "languages",
                      value
                    )
                  }
                  placeholder="English — Fluent, Filipino — Native"
                />

                <p className="mt-3 text-xs text-zinc-400">
                  Example: English —
                  Fluent, Filipino —
                  Native
                </p>
              </FormCard>

              {/* TARGET JOB */}

              <FormCard
                number="09"
                title="Target job"
                description="Paste a job description and the AI will tailor the resume toward it."
                optional
              >
                <TextareaField
                  label="Job description"
                  value={
                    form.jobDescription
                  }
                  onChange={(value) =>
                    updateField(
                      "jobDescription",
                      value
                    )
                  }
                  placeholder="Paste the job description here..."
                  rows={10}
                />
              </FormCard>

              {/* SECURITY CHECK */}

              <div className="my-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 print:hidden">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-700">
                      Quick security check
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-400">
                      Helps keep ResumeForge free from automated abuse.
                    </p>
                  </div>

                  <div className="min-h-[65px] shrink-0">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={
                        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
                        ""
                      }
                      onSuccess={(token) =>
                        setTurnstileToken(token)
                      }
                      onExpire={() =>
                        setTurnstileToken("")
                      }
                      onError={() =>
                        setTurnstileToken("")
                      }
                      options={{
                        theme: "light",
                        size: "flexible",
                      }}
                    />
                  </div>
                </div>
              </div>

              {anonymousLimitMessage && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 print:hidden">
                  <p className="text-sm font-semibold text-amber-900">
                    Free generation used
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800/80">
                    {anonymousLimitMessage}
                  </p>

                  <a
                    href="/auth/sign-up"
                    className="mt-3 inline-flex rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
                  >
                    Create free account →
                  </a>
                </div>
              )}

              {/* MOBILE GENERATE */}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="generate-button lg:hidden"
              >
                {loading
                  ? "Creating your resume..."
                  : "Create my resume →"}
              </button>
            </div>

            {/* =================================================
                SIDEBAR
            ================================================== */}

            <aside className="hidden lg:block">

              <div className="sticky top-24 space-y-4">

                <div className="sidebar-card">

                  <div className="border-b border-zinc-100 px-5 py-4">

                    <p className="eyebrow">
                      Your process
                    </p>
                  </div>

                  <div className="space-y-5 p-5">

                    <Step
                      number="01"
                      text="Build your profile"
                      active
                    />

                    <Step
                      number="02"
                      text="Add your experience"
                    />

                    <Step
                      number="03"
                      text="Add education & skills"
                    />

                    <Step
                      number="04"
                      text="Add optional details"
                    />

                    <Step
                      number="05"
                      text="AI improves the writing"
                    />

                    <Step
                      number="06"
                      text="Choose your design"
                    />
                  </div>
                </div>

                <div className="sidebar-note">

                  <div className="tip-icon">
                    ✦
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Built for real careers.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-400">
                      One profile can power
                      multiple professional
                      resume designs.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="generate-button"
                >
                  {loading
                    ? "Creating..."
                    : "Create my resume →"}
                </button>
              </div>
            </aside>
          </form>
        )}

        {/* =================================================
            LOADING
        ================================================== */}

        {loading && (
          <section
            ref={loadingRef}
            className="loading-section"
            aria-live="polite"
          >

            <div className="loading-section-aura loading-aura-one" />

            <div className="loading-section-aura loading-aura-two" />

            <div className="loading-content">

              <div className="loading-kicker">
                <span className="loading-kicker-line" />
                RESUMEFORGE AI
                <span className="loading-kicker-line" />
              </div>

              <div className="loading-pulse">
                <span className="loading-pulse-ring loading-pulse-ring-one" />
                <span className="loading-pulse-ring loading-pulse-ring-two" />
                <span className="loading-pulse-core" />
              </div>

              <h2
                key={messageIndex}
                className="loading-title"
              >
                {
                  LOADING_MESSAGES[
                    messageIndex
                  ]
                }
              </h2>

              <p className="loading-description">
                Carefully improving your
                information without inventing
                experience, qualifications,
                or achievements.
              </p>

              <div className="loading-progress-wrap">

                <div className="loading-progress-meta">

                  <span>
                    Building your resume
                  </span>

                  <span>
                    {Math.round(
                      progress
                    )}
                    %
                  </span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="loading-stages">

                <LoadingStage
                  label="Analyze"
                  done={
                    progress >= 25
                  }
                />

                <LoadingStage
                  label="Enhance"
                  done={
                    progress >= 50
                  }
                />

                <LoadingStage
                  label="Polish"
                  done={
                    progress >= 75
                  }
                />

                <LoadingStage
                  label="Finish"
                  done={
                    progress >= 100
                  }
                />
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            RESULT
        ================================================== */}

        {resume &&
          personalInfo && (
            <section
              ref={resultRef}
              id="resume-result"
              className="result-section"
            >

              {/* RESULT HEADER */}

              <div className="result-heading">

                <div>

                  <div className="completed-pill">
                    <span>✓</span>

                    Resume completed
                  </div>

                  <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                    Your resume is ready.
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                    Refine the wording with AI,
                    choose your layout, then
                    save your final resume.
                  </p>
                </div>

                <div className="result-actions">

                  <button
                    type="button"
                    onClick={
                      handleStartOver
                    }
                    className="secondary-button"
                  >
                    ← Start over
                  </button>

                  <button
                    type="button"
                    onClick={
                      handlePrint
                    }
                    className="primary-button"
                  >
                    Save / Print PDF
                  </button>
                </div>
              </div>

              {/* =================================================
                  AI EDITOR
              ================================================== */}

              <div className="ai-editor-card print:hidden">

                <div className="ai-editor-header">

                  <div className="ai-editor-symbol">
                    ✦
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="ai-editor-topline">

                      <p className="eyebrow text-indigo-500">
                        AI editor
                      </p>

                      <span className="ai-editor-badge">
                        Refine your resume
                      </span>
                    </div>

                    <h3 className="mt-1 text-xl font-bold tracking-[-0.035em]">
                      Make it sharper.
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
                      Ask for a change in plain
                      language. Your existing
                      resume stays intact unless
                      you ask the AI to improve it.
                    </p>
                  </div>
                </div>

                {/* QUICK COMMANDS */}

                <div className="ai-quick-actions">

                  <AIQuickButton
                    disabled={
                      aiEditing
                    }
                    onClick={() =>
                      quickAIEdit(
                        "Make my professional summary stronger and more polished while remaining completely truthful."
                      )
                    }
                  >
                    Strengthen summary
                  </AIQuickButton>

                  <AIQuickButton
                    disabled={
                      aiEditing
                    }
                    onClick={() =>
                      quickAIEdit(
                        "Make my experience bullets more concise and easier for recruiters to scan."
                      )
                    }
                  >
                    Shorten experience
                  </AIQuickButton>

                  <AIQuickButton
                    disabled={
                      aiEditing
                    }
                    onClick={() =>
                      quickAIEdit(
                        "Make the entire resume more professional and polished without exaggerating anything."
                      )
                    }
                  >
                    More professional
                  </AIQuickButton>

                  <AIQuickButton
                    disabled={
                      aiEditing
                    }
                    onClick={() =>
                      quickAIEdit(
                        "Fix grammar, spelling, punctuation, and awkward phrasing throughout the resume."
                      )
                    }
                  >
                    Fix grammar
                  </AIQuickButton>

                  <AIQuickButton
                    disabled={
                      aiEditing
                    }
                    onClick={() =>
                      quickAIEdit(
                        "Make the experience bullets more action-oriented while preserving their factual meaning."
                      )
                    }
                  >
                    Stronger bullets
                  </AIQuickButton>

                  <AIQuickButton
                    disabled={
                      aiEditing
                    }
                    onClick={() =>
                      quickAIEdit(
                        "Make the resume clearer and more concise overall while preserving important information."
                      )
                    }
                  >
                    Make concise
                  </AIQuickButton>
                </div>

                {/* CUSTOM COMMAND */}

                <div className="ai-editor-input-row">

                  <input
                    value={
                      editInstruction
                    }
                    onChange={(event) =>
                      setEditInstruction(
                        event.target.value
                      )
                    }
                    disabled={
                      aiEditing
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                          "Enter" &&
                        !event.shiftKey &&
                        editInstruction.trim()
                      ) {
                        event.preventDefault();

                        handleAIEdit(
                          editInstruction
                        );
                      }
                    }}
                    placeholder="Ask AI to change something..."
                    className="ai-editor-input"
                  />

                  <button
                    type="button"
                    disabled={
                      aiEditing ||
                      !editInstruction.trim()
                    }
                    onClick={() =>
                      handleAIEdit(
                        editInstruction
                      )
                    }
                    className="ai-editor-submit"
                  >
                    {aiEditing ? (
                      <>
                        <span className="ai-spinner" />
                        Editing...
                      </>
                    ) : (
                      <>
                        Apply
                        <span>
                          →
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {aiEditing && (
                  <div className="ai-editor-status">

                    <span className="ai-status-dot" />

                    AI is refining your resume...
                  </div>
                )}
              </div>

              {/* =================================================
                  TEMPLATE SELECTOR
                  ONLY ONE.
              ================================================== */}

              <TemplateSelector
                selected={
                  template
                }
                onChange={
                  changeTemplate
                }
              />

              {/* =================================================
                  RESUME
              ================================================== */}

              <div
                id="resume-print-area"
                className="mt-7"
              >
                <ResumePage
                  resume={resume}
                  personalInfo={
                    personalInfo
                  }
                  template={
                    template
                  }
                />
              </div>
            </section>
          )}
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      {!resume && (
        <footer className="mt-12 border-t border-zinc-200 py-10 print:hidden">

          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-5 sm:flex-row sm:px-8">

            <div>
              <p className="text-sm font-bold">
                ResumeForge
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                Better presentation for the
                experience you already have.
              </p>
            </div>

            <p className="text-xs text-zinc-400">
              AI-assisted resume creation
            </p>
          </div>
        </footer>
      )}
    </main>
  );
}

/* =========================================================
   FORM CARD
========================================================= */

function FormCard({
  number,
  title,
  description,
  optional = false,
  children,
}: {
  number: string;
  title: string;
  description: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="form-card">

      <div className="border-b border-zinc-100 px-6 py-5 sm:px-7">

        <div className="flex gap-4">

          <div className="section-number">
            {number}
          </div>

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <h2 className="font-semibold tracking-[-0.02em]">
                {title}
              </h2>

              {optional && (
                <span className="optional-pill">
                  Optional
                </span>
              )}
            </div>

            <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-[13px] font-semibold text-zinc-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        required={required}
        className="input-field"
      />
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
}: {
  label?: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>

      {label && (
        <label className="mb-2 block text-[13px] font-semibold text-zinc-700">
          {label}
        </label>
      )}

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        rows={rows}
        className="textarea-field"
      />
    </div>
  );
}

/* =========================================================
   STEP
========================================================= */

function Step({
  number,
  text,
  active = false,
}: {
  number: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">

      <span
        className={`step-number ${
          active
            ? "step-number-active"
            : ""
        }`}
      >
        {number}
      </span>

      <span
        className={`text-sm ${
          active
            ? "font-medium text-zinc-900"
            : "text-zinc-500"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   ADD BUTTON
========================================================= */

function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="add-button"
    >
      {children}
    </button>
  );
}

/* =========================================================
   EMPTY OPTIONAL
========================================================= */

function EmptyOptional({
  title,
  description,
  button,
  onClick,
}: {
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="empty-optional">

      <div className="empty-optional-icon">
        +
      </div>

      <div className="min-w-0">

        <p className="text-sm font-semibold text-zinc-700">
          {title}
        </p>

        <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="empty-optional-button"
      >
        {button}
      </button>
    </div>
  );
}

/* =========================================================
   AI QUICK BUTTON
========================================================= */

function AIQuickButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="ai-quick-button"
    >
      {children}
    </button>
  );
}

/* =========================================================
   LOADING STAGE
========================================================= */

function LoadingStage({
  label,
  done,
}: {
  label: string;
  done: boolean;
}) {
  return (
    <div
      className={`loading-stage ${
        done
          ? "loading-stage-done"
          : ""
      }`}
    >
      <span>
        {done ? "✓" : "•"}
      </span>

      <p>{label}</p>
    </div>
  );
}

/* =========================================================
   TEMPLATE SELECTOR
========================================================= */

function TemplateSelector({
  selected,
  onChange,
}: {
  selected: Template;
  onChange: (
    template: Template
  ) => void;
}) {
  const templates: {
    id: Template;
    name: string;
    description: string;
  }[] = [
    {
      id: "modern",
      name: "Modern",
      description:
        "Clean, contemporary, versatile",
    },
    {
      id: "classic",
      name: "Classic",
      description:
        "Traditional, formal, recruiter-friendly",
    },
    {
      id: "minimal",
      name: "Minimal",
      description:
        "Simple, elegant, highly readable",
    },
  ];

  return (
    <div className="template-selector print:hidden">

      <div>
        <p className="eyebrow">
          Resume design
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          Change the visual style without
          regenerating your resume.
        </p>
      </div>

      <div className="template-grid">

        {templates.map(
          (item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onChange(
                  item.id
                )
              }
              className={`template-card ${
                selected ===
                item.id
                  ? "template-card-active"
                  : ""
              }`}
            >
              <TemplateMiniPreview
                template={
                  item.id
                }
              />

              <div className="template-card-copy">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-sm font-bold text-zinc-900">
                    {item.name}
                  </p>

                  {selected ===
                    item.id && (
                    <span className="template-selected">
                      ✓
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[11px] leading-5 text-zinc-400">
                  {
                    item.description
                  }
                </p>
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MINI PREVIEW
========================================================= */

function TemplateMiniPreview({
  template,
}: {
  template: Template;
}) {
  return (
    <div
      className={`template-mini-preview template-mini-${template}`}
    >

      <div className="template-mini-name" />

      <div className="template-mini-line template-mini-long" />

      <div className="template-mini-line template-mini-medium" />

      <div className="template-mini-heading" />

      <div className="template-mini-line template-mini-long" />

      <div className="template-mini-line template-mini-long" />

      <div className="template-mini-line template-mini-short" />

      <div className="template-mini-heading" />

      <div className="template-mini-line template-mini-medium" />

      <div className="template-mini-line template-mini-long" />
    </div>
  );
}

/* =========================================================
   RESUME PAGE
========================================================= */

function ResumePage({
  resume,
  personalInfo,
  template,
}: {
  resume: Resume;
  personalInfo: PersonalInfo;
  template: Template;
}) {
  if (
    template ===
    "classic"
  ) {
    return (
      <ClassicResume
        resume={resume}
        personalInfo={
          personalInfo
        }
      />
    );
  }

  if (
    template ===
    "minimal"
  ) {
    return (
      <MinimalResume
        resume={resume}
        personalInfo={
          personalInfo
        }
      />
    );
  }

  return (
    <ModernResume
      resume={resume}
      personalInfo={
        personalInfo
      }
    />
  );
}

/* =========================================================
   MODERN
========================================================= */

function ModernResume({
  resume,
  personalInfo,
}: {
  resume: Resume;
  personalInfo: PersonalInfo;
}) {
  return (
    <article className="resume-page resume-modern">

      <ResumeHeader
        personalInfo={
          personalInfo
        }
      />

      <ResumeContent
        resume={resume}
        variant="modern"
      />
    </article>
  );
}

/* =========================================================
   CLASSIC
========================================================= */

function ClassicResume({
  resume,
  personalInfo,
}: {
  resume: Resume;
  personalInfo: PersonalInfo;
}) {
  return (
    <article className="resume-page resume-classic">

      <header className="classic-header">

        <h1>
          {personalInfo.name}
        </h1>

        {personalInfo.title && (
          <p>
            {personalInfo.title}
          </p>
        )}

        <div className="classic-contact">

          {personalInfo.email && (
            <span>
              {personalInfo.email}
            </span>
          )}

          {personalInfo.phone && (
            <span>
              {personalInfo.phone}
            </span>
          )}

          {personalInfo.location && (
            <span>
              {personalInfo.location}
            </span>
          )}

          {personalInfo.linkedin && (
            <span>
              {personalInfo.linkedin}
            </span>
          )}
        </div>
      </header>

      <ResumeContent
        resume={resume}
        variant="classic"
      />
    </article>
  );
}

/* =========================================================
   MINIMAL
========================================================= */

function MinimalResume({
  resume,
  personalInfo,
}: {
  resume: Resume;
  personalInfo: PersonalInfo;
}) {
  return (
    <article className="resume-page resume-minimal">

      <header className="minimal-header">

        <div>

          <h1>
            {personalInfo.name}
          </h1>

          {personalInfo.title && (
            <p>
              {personalInfo.title}
            </p>
          )}
        </div>

        <div className="minimal-contact">

          {personalInfo.email && (
            <span>
              {personalInfo.email}
            </span>
          )}

          {personalInfo.phone && (
            <span>
              {personalInfo.phone}
            </span>
          )}

          {personalInfo.location && (
            <span>
              {personalInfo.location}
            </span>
          )}

          {personalInfo.linkedin && (
            <span>
              {personalInfo.linkedin}
            </span>
          )}
        </div>
      </header>

      <ResumeContent
        resume={resume}
        variant="minimal"
      />
    </article>
  );
}

/* =========================================================
   RESUME HEADER
========================================================= */

function ResumeHeader({
  personalInfo,
}: {
  personalInfo: PersonalInfo;
}) {
  return (
    <header className="resume-header">

      <h1>
        {personalInfo.name}
      </h1>

      {personalInfo.title && (
        <p className="resume-title">
          {personalInfo.title}
        </p>
      )}

      <div className="resume-contact">

        {personalInfo.email && (
          <span>
            {personalInfo.email}
          </span>
        )}

        {personalInfo.phone && (
          <span>
            {personalInfo.phone}
          </span>
        )}

        {personalInfo.location && (
          <span>
            {personalInfo.location}
          </span>
        )}

        {personalInfo.linkedin && (
          <span>
            {personalInfo.linkedin}
          </span>
        )}
      </div>
    </header>
  );
}

/* =========================================================
   RESUME CONTENT
========================================================= */

function ResumeContent({
  resume,
  variant,
}: {
  resume: Resume;
  variant: Template;
}) {
  return (
    <div
      className={`resume-content resume-content-${variant}`}
    >

      {resume.summary && (
        <ResumeSection
          title="Professional Summary"
          variant={
            variant
          }
        >
          <p className="resume-body">
            {resume.summary}
          </p>
        </ResumeSection>
      )}

      {resume.experience.length >
        0 && (
        <ResumeSection
          title="Experience"
          variant={
            variant
          }
        >
          <div className="space-y-7">

            {resume.experience.map(
              (
                job,
                index
              ) => (
                <div
                  key={index}
                  className="resume-break"
                >

                  <div className="resume-job">

                    <div>

                      {job.position && (
                        <h3>
                          {
                            job.position
                          }
                        </h3>
                      )}

                      {job.company && (
                        <p>
                          {
                            job.company
                          }
                        </p>
                      )}
                    </div>

                    {(job.startDate ||
                      job.endDate) && (
                      <span>
                        {
                          job.startDate
                        }

                        {job.endDate &&
                          ` — ${job.endDate}`}
                      </span>
                    )}
                  </div>

                  {job.bullets.length >
                    0 && (
                    <ul className="resume-bullets">

                      {job.bullets.map(
                        (
                          bullet,
                          bulletIndex
                        ) => (
                          <li
                            key={
                              bulletIndex
                            }
                          >
                            {cleanText(
                              bullet
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              )
            )}
          </div>
        </ResumeSection>
      )}

      {resume.education.length >
        0 && (
        <ResumeSection
          title="Education"
          variant={
            variant
          }
        >
          <div className="space-y-5">

            {resume.education.map(
              (
                education,
                index
              ) => (
                <div
                  key={index}
                  className="resume-break"
                >

                  <div className="resume-job">

                    <div>

                      {education.degree && (
                        <h3>
                          {
                            education.degree
                          }
                        </h3>
                      )}

                      {education.school && (
                        <p>
                          {
                            education.school
                          }
                        </p>
                      )}
                    </div>

                    {(education.startDate ||
                      education.endDate) && (
                      <span>
                        {
                          education.startDate
                        }

                        {education.endDate &&
                          ` — ${education.endDate}`}
                      </span>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </ResumeSection>
      )}

      {resume.projects.length >
        0 && (
        <ResumeSection
          title="Projects"
          variant={
            variant
          }
        >
          <div className="space-y-6">

            {resume.projects.map(
              (
                project,
                index
              ) => (
                <div
                  key={index}
                  className="resume-break"
                >

                  <div className="resume-job">

                    <div>

                      {project.name && (
                        <h3>
                          {
                            project.name
                          }
                        </h3>
                      )}

                      {project.role && (
                        <p>
                          {
                            project.role
                          }
                        </p>
                      )}
                    </div>

                    {project.link && (
                      <span>
                        {
                          project.link
                        }
                      </span>
                    )}
                  </div>

                  {project.description && (
                    <p className="resume-project-description">
                      {
                        project.description
                      }
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </ResumeSection>
      )}

      {resume.certifications.length >
        0 && (
        <ResumeSection
          title="Certifications"
          variant={
            variant
          }
        >
          <div className="space-y-4">

            {resume.certifications.map(
              (
                certification,
                index
              ) => (
                <div
                  key={index}
                  className="resume-job resume-break"
                >

                  <div>

                    <h3>
                      {
                        certification.name
                      }
                    </h3>

                    {certification.issuer && (
                      <p>
                        {
                          certification.issuer
                        }
                      </p>
                    )}
                  </div>

                  {certification.year && (
                    <span>
                      {
                        certification.year
                      }
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        </ResumeSection>
      )}

      {resume.skills.length >
        0 && (
        <ResumeSection
          title="Skills"
          variant={
            variant
          }
        >
          <div className="resume-skills">

            {resume.skills.map(
              (
                skill,
                index
              ) => (
                <span
                  key={index}
                  className="resume-skill"
                >
                  {cleanSkill(
                    skill
                  )}
                </span>
              )
            )}
          </div>
        </ResumeSection>
      )}

      {resume.languages.length >
        0 && (
        <ResumeSection
          title="Languages"
          variant={
            variant
          }
        >
          <div className="resume-skills">

            {resume.languages.map(
              (
                language,
                index
              ) => (
                <span
                  key={index}
                  className="resume-skill"
                >
                  {
                    language
                  }
                </span>
              )
            )}
          </div>
        </ResumeSection>
      )}
    </div>
  );
}

/* =========================================================
   RESUME SECTION
========================================================= */

function ResumeSection({
  title,
  variant,
  children,
}: {
  title: string;
  variant: Template;
  children: ReactNode;
}) {
  return (
    <section
      className={`resume-section resume-section-${variant}`}
    >
      <h2>
        {title}
      </h2>

      {children}
    </section>
  );
}

/* =========================================================
   CLEAN TEXT
========================================================= */

function cleanText(
  text: unknown
) {
  if (
    typeof text !== "string"
  ) {
    return "";
  }

  return text
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
   CLEAN SKILLS
========================================================= */

function cleanSkill(
  skill: unknown
) {
  if (
    typeof skill !== "string"
  ) {
    return "";
  }

  const cleaned =
    skill
      .replace(
        /^[\s•●▪◦*-]+/,
        ""
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (!cleaned) {
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
    word: "Microsoft Word",
  };

  const normalized =
    cleaned.toLowerCase();

  if (
    specialCases[
      normalized
    ]
  ) {
    return specialCases[
      normalized
    ];
  }

  return cleaned
    .split(" ")
    .map((word) => {
      if (!word) {
        return word;
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

/* =========================================================
   PERSONAL INFO SANITIZER
========================================================= */

function sanitizePersonalInfo(
  input: unknown
): PersonalInfo {
  const data =
    input &&
    typeof input ===
      "object"
      ? (input as Record<
          string,
          unknown
        >)
      : {};

  return {
    name:
      typeof data.name ===
      "string"
        ? data.name.trim()
        : "",

    title:
      typeof data.title ===
      "string"
        ? data.title.trim()
        : "",

    email:
      typeof data.email ===
      "string"
        ? data.email.trim()
        : "",

    phone:
      typeof data.phone ===
      "string"
        ? data.phone.trim()
        : "",

    location:
      typeof data.location ===
      "string"
        ? data.location.trim()
        : "",

    linkedin:
      typeof data.linkedin ===
      "string"
        ? data.linkedin.trim()
        : "",
  };
}

/* =========================================================
   RESUME SANITIZER
========================================================= */

function sanitizeResume(
  input: unknown
): Resume {
  const data =
    input &&
    typeof input ===
      "object"
      ? (input as Record<
          string,
          unknown
        >)
      : {};

  const rawExperience =
    Array.isArray(
      data.experience
    )
      ? data.experience
      : [];

  const rawEducation =
    Array.isArray(
      data.education
    )
      ? data.education
      : [];

  const rawProjects =
    Array.isArray(
      data.projects
    )
      ? data.projects
      : [];

  const rawCertifications =
    Array.isArray(
      data.certifications
    )
      ? data.certifications
      : [];

  const rawLanguages =
    Array.isArray(
      data.languages
    )
      ? data.languages
      : [];

  const rawSkills =
    Array.isArray(
      data.skills
    )
      ? data.skills
      : [];

  return {
    summary:
      typeof data.summary ===
      "string"
        ? cleanText(
            data.summary
          )
        : "",

    experience:
      rawExperience
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
              typeof job.company ===
              "string"
                ? job.company.trim()
                : "",

            position:
              typeof job.position ===
              "string"
                ? job.position.trim()
                : "",

            startDate:
              typeof job.startDate ===
              "string"
                ? job.startDate.trim()
                : "",

            endDate:
              typeof job.endDate ===
              "string"
                ? job.endDate.trim()
                : "",

            bullets:
              Array.isArray(
                job.bullets
              )
                ? job.bullets
                    .filter(
                      (
                        bullet
                      ): bullet is string =>
                        typeof bullet ===
                        "string"
                    )
                    .map(
                      cleanText
                    )
                    .filter(
                      Boolean
                    )
                : [],
          };
        })
        .filter(
          (job) =>
            job.company ||
            job.position ||
            job.bullets.length >
              0
        ),

    education:
      rawEducation
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
              typeof education.school ===
              "string"
                ? education.school.trim()
                : "",

            degree:
              typeof education.degree ===
              "string"
                ? education.degree.trim()
                : "",

            startDate:
              typeof education.startDate ===
              "string"
                ? education.startDate.trim()
                : "",

            endDate:
              typeof education.endDate ===
              "string"
                ? education.endDate.trim()
                : "",
          };
        })
        .filter(
          (education) =>
            education.school ||
            education.degree
        ),

    projects:
      rawProjects
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
              typeof project.name ===
              "string"
                ? project.name.trim()
                : "",

            role:
              typeof project.role ===
              "string"
                ? project.role.trim()
                : "",

            description:
              typeof project.description ===
              "string"
                ? cleanText(
                    project.description
                  )
                : "",

            link:
              typeof project.link ===
              "string"
                ? project.link.trim()
                : "",
          };
        })
        .filter(
          (project) =>
            project.name ||
            project.description
        ),

    certifications:
      rawCertifications
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
              typeof certification.name ===
              "string"
                ? certification.name.trim()
                : "",

            issuer:
              typeof certification.issuer ===
              "string"
                ? certification.issuer.trim()
                : "",

            year:
              typeof certification.year ===
              "string"
                ? certification.year.trim()
                : "",
          };
        })
        .filter(
          (certification) =>
            certification.name
        ),

    languages:
      rawLanguages
        .filter(
          (
            language
          ): language is string =>
            typeof language ===
            "string"
        )
        .map(
          cleanText
        )
        .filter(Boolean),

    skills:
      rawSkills
        .filter(
          (
            skill
          ): skill is string =>
            typeof skill ===
            "string"
        )
        .map(
          cleanSkill
        )
        .filter(Boolean),
  };
}

/* =========================================================
   RESET
========================================================= */

function cloneInitialForm(): FormDataState {
  return {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",

    summary: "",

    experience: [
      emptyExperience(),
    ],

    education: [
      emptyEducation(),
    ],

    skills: "",

    projects: [],

    certifications: [],

    languages: "",

    jobDescription: "",
  };
}

/* =========================================================
   DELAY
========================================================= */

function delay(
  milliseconds: number
) {
  return new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}