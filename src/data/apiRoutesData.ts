export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type UserRole =
  | 'PUBLIC'
  | 'AUTHENTICATED'
  | 'TEACHER'
  | 'TEAMLEAD'
  | 'DEAN'
  | 'SUPERADMIN'
  | 'REVIEW_CENTER_REPRESENTATIVE';

export interface RouteParam {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  type: string;
  description: string;
  example?: string;
}

export interface RouteResponse {
  statusCode: number;
  description: string;
  schema?: string;
  example?: any;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  summary: string;
  description: string;
  roles: UserRole[];
  authRequired: boolean;
  rateLimited?: boolean;
  parameters?: RouteParam[];
  requestBody?: {
    contentType: string;
    schema: string;
    example: any;
  };
  responses: RouteResponse[];
}

export interface ApiCategory {
  id: string;
  name: string;
  section: 'admin' | 'review-center' | 'schema';
  description: string;
  basePath: string;
  endpoints: ApiEndpoint[];
}

export const API_SPEC_INFO = {
  title: "BoardQuest Medical Technology Board Review API",
  version: "1.2.0",
  oasVersion: "3.1.0",
  institution: "SWU PHINMA School of Medical Technology",
  description:
    "Comprehensive RESTful backend API documentation for the BoardQuest Medical Technology board exam preparation and review ecosystem. Powering institutional faculty administration, AI-driven question bank curation, automated diagnostic scoring, and multi-tenant review center partnerships.",
  contact: {
    name: "BoardQuest Technical Engineering Team",
    email: "engineering@swu.phinma.edu.ph",
  },
  servers: [
    {
      id: "local",
      url: "http://localhost:5000",
      description: "Local Express Development Server (Vite / Node.js 22 LTS)",
    },
    {
      id: "staging",
      url: "http://localhost:5001",
      description: "Staging / Pre-Production Testing Cluster",
    },
  ],
};

export const API_CATEGORIES: ApiCategory[] = [
  // =========================================================================
  // 1. ADMIN - AUTHENTICATION
  // =========================================================================
  {
    id: "auth",
    name: "Admin Authentication & Identity",
    section: "admin",
    description: "Faculty and executive administrative authentication, Argon2id credentials verification, refresh tokens, and profile session management.",
    basePath: "/api/v1/auth",
    endpoints: [
      {
        id: "auth-login",
        path: "/api/v1/auth/login",
        method: "POST",
        summary: "Faculty & Administrator Login",
        description: "Authenticates an institutional faculty or administrative user. Returns a signed JWT access token in the response payload and sets a secure httpOnly refresh token cookie.",
        roles: ["PUBLIC"],
        authRequired: false,
        rateLimited: true,
        requestBody: {
          contentType: "application/json",
          schema: "LoginInputDto",
          example: {
            email: "teacher@swu.phinma.edu.ph",
            password: "SecurePassword123!",
          },
        },
        responses: [
          {
            statusCode: 200,
            description: "Authentication successful; access token returned.",
            schema: "AuthSuccessResponse",
            example: {
              success: true,
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              user: {
                id: "usr_68dfb910",
                employeeId: "EMP-2026-081",
                email: "teacher@swu.phinma.edu.ph",
                name: "Maria Santos, RMT, MSMT",
                role: "TEACHER",
                isActive: true,
                mustChangePassword: false,
                location: "Philippines"
              },
            },
          },
          {
            statusCode: 401,
            description: "Invalid credentials or account deactivated.",
            example: { error: "Invalid credentials or account is deactivated" },
          },
        ],
      },
      {
        id: "auth-me",
        path: "/api/v1/auth/me",
        method: "GET",
        summary: "Current Authenticated Admin Profile",
        description: "Retrieves complete profile details, assigned subject disciplines, and quota metrics of the currently authenticated administrator.",
        roles: ["AUTHENTICATED", "TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        responses: [
          {
            statusCode: 200,
            description: "Profile metadata returned.",
            schema: "AdminUserResponse",
            example: {
              success: true,
              data: {
                id: "usr_68dfb910",
                email: "teacher@swu.phinma.edu.ph",
                name: "Maria Santos, RMT, MSMT",
                role: "TEACHER",
                handledSubjects: ["Clinical Chemistry", "Clinical Microscopy"],
                location: "Philippines",
                lastActiveAt: "2026-10-26T14:30:00.000Z"
              },
            },
          },
          {
            statusCode: 401,
            description: "Missing or expired authorization bearer token.",
            example: { error: "Access token required" },
          },
        ],
      },
      {
        id: "auth-refresh",
        path: "/api/v1/auth/refresh",
        method: "GET",
        summary: "Rotate & Refresh JWT Access Token",
        description: "Rotates the access token using the httpOnly refresh cookie, maintaining persistent secure sessions without re-authenticating.",
        roles: ["PUBLIC"],
        authRequired: false,
        responses: [
          {
            statusCode: 200,
            description: "New access token generated successfully.",
            example: {
              success: true,
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newPayload...",
            },
          },
          {
            statusCode: 403,
            description: "Refresh token is invalid or expired.",
            example: { error: "Invalid refresh token" },
          },
        ],
      },
      {
        id: "auth-logout",
        path: "/api/v1/auth/logout",
        method: "POST",
        summary: "Revoke Active Session & Invalidate Cookie",
        description: "Clears the active session and invalidates the httpOnly refresh token cookie on the client.",
        roles: ["PUBLIC"],
        authRequired: false,
        responses: [
          {
            statusCode: 200,
            description: "Logged out successfully.",
            example: { success: true, message: "Logged out successfully" },
          },
        ],
      },
      {
        id: "auth-forgot",
        path: "/api/v1/auth/forgot-password",
        method: "POST",
        summary: "Request Password Reset Token",
        description: "Dispatches a time-limited cryptographically secure password reset token to the registered institutional email.",
        roles: ["PUBLIC"],
        authRequired: false,
        rateLimited: true,
        requestBody: {
          contentType: "application/json",
          schema: "ForgotPasswordDto",
          example: { email: "teacher@swu.phinma.edu.ph" },
        },
        responses: [
          {
            statusCode: 200,
            description: "Reset instructions dispatched if email exists.",
            example: { success: true, message: "Password reset link sent to your email" },
          },
        ],
      },
      {
        id: "auth-reset",
        path: "/api/v1/auth/reset-password",
        method: "POST",
        summary: "Confirm Password Reset",
        description: "Updates account password with cryptographic token verification.",
        roles: ["PUBLIC"],
        authRequired: false,
        rateLimited: true,
        requestBody: {
          contentType: "application/json",
          schema: "ResetPasswordDto",
          example: {
            token: "rst_8849bca72e10",
            newPassword: "UpdatedSecurePassword2026!"
          }
        },
        responses: [
          { statusCode: 200, description: "Password updated successfully." }
        ]
      },
      {
        id: "auth-profile",
        path: "/api/v1/auth/profile",
        method: "PUT",
        summary: "Update Faculty Profile",
        description: "Modifies user phone number, avatar URL, or display names.",
        roles: ["AUTHENTICATED"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "UpdateProfileDto",
          example: {
            phoneNumber: "+63 917 123 4567",
            avatarUrl: "https://storage.boardquest.edu.ph/avatars/maria.jpg"
          }
        },
        responses: [
          { statusCode: 200, description: "Profile updated successfully." }
        ]
      }
    ],
  },

  // =========================================================================
  // 2. ADMIN - QUESTION BANK & CMS
  // =========================================================================
  {
    id: "questions",
    name: "Question Bank & Psychometrics",
    section: "admin",
    description: "Standardized Medical Technology board exam question repository, Bloom's cognitive taxonomy, bulk ingestion, and AI paraphrase synthesis.",
    basePath: "/api/v1/questions",
    endpoints: [
      {
        id: "questions-stats",
        path: "/api/v1/questions/stats",
        method: "GET",
        summary: "Question Bank Statistics",
        description: "Returns aggregated metrics: total items, approval statuses, difficulty breakdown, and Bloom's cognitive taxonomy ratios.",
        roles: ["AUTHENTICATED", "TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        responses: [
          {
            statusCode: 200,
            description: "Question bank metrics calculated.",
            example: {
              success: true,
              data: {
                totalQuestions: 2450,
                approved: 1980,
                pendingReview: 350,
                pendingRevision: 120,
                lotsRatio: "45%",
                hotsRatio: "55%"
              }
            }
          }
        ]
      },
      {
        id: "questions-list",
        path: "/api/v1/questions/get",
        method: "GET",
        summary: "Query & Filter Question Bank",
        description: "Retrieves question records with multi-dimensional filtering by subject, difficulty, cognitive level, review status, and full-text keyword search.",
        roles: ["AUTHENTICATED", "TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        parameters: [
          { name: "page", in: "query", required: false, type: "number", description: "Pagination page (default: 1)", example: "1" },
          { name: "limit", in: "query", required: false, type: "number", description: "Items per page (default: 20)", example: "20" },
          { name: "subjectId", in: "query", required: false, type: "string", description: "Subject discipline MongoDB ObjectId" },
          { name: "status", in: "query", required: false, type: "string", description: "APPROVED | PENDING_REVIEW | PENDING_REVISION" },
          { name: "difficulty", in: "query", required: false, type: "string", description: "EASY | MEDIUM | HARD" },
          { name: "cognitiveLevel", in: "query", required: false, type: "string", description: "LOTS | HOTS" }
        ],
        responses: [
          {
            statusCode: 200,
            description: "List of matching questions.",
            example: {
              success: true,
              data: [
                {
                  id: "q_91a0c12e",
                  question: "A 45-year-old male presents with severe jaundice. Laboratory testing demonstrates elevated direct bilirubin and absent urinary urobilinogen. What is the most likely etiology?",
                  choices: ["Biliary duct obstruction", "Hemolytic anemia", "Gilbert syndrome", "Neonatal jaundice"],
                  correctAnswer: "Biliary duct obstruction",
                  status: "APPROVED",
                  difficulty: "HARD",
                  cognitiveLevel: "HOTS",
                  subjectId: "subj_cc_01"
                }
              ],
              total: 2450
            }
          }
        ]
      },
      {
        id: "questions-create",
        path: "/api/v1/questions/create",
        method: "POST",
        summary: "Encode Single Board Exam Question",
        description: "Submits a new clinical vignette or recall board exam item with options, correct answer, rationale, and taxonomic classification.",
        roles: ["TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "CreateQuestionDto",
          example: {
            question: "In the hexokinase method for glucose determination, what enzyme catalyzes the primary phosphorylation reaction?",
            choices: ["Hexokinase", "Glucose-6-phosphate dehydrogenase", "Phosphoglucomutase", "Glucose oxidase"],
            correctAnswer: "Hexokinase",
            subjectId: "subj_cc_01",
            topic: "Carbohydrate Metabolism",
            difficulty: "MEDIUM",
            cognitiveLevel: "LOTS",
            type: "MCQ",
            rationale: "Hexokinase phosphorylates glucose using ATP to produce glucose-6-phosphate and ADP."
          }
        },
        responses: [
          { statusCode: 201, description: "Question created and submitted for peer review." }
        ]
      },
      {
        id: "questions-synthesize",
        path: "/api/v1/questions/synthesize",
        method: "POST",
        summary: "AI Question Synthesis & Clinical Vignette Generator",
        description: "Generates clinical vignettes, distractors, and evidence-based rationales utilizing AI models tailored to Philippine PRB MedTech standards.",
        roles: ["TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "SynthesizeDto",
          example: {
            subject: "Hematology",
            topic: "Hemolytic Anemias",
            difficulty: "HARD",
            cognitiveLevel: "HOTS",
            promptKeywords: ["Schistocytes", "DIC", "Thrombocytopenia"]
          }
        },
        responses: [
          { statusCode: 200, description: "Synthesized draft item with rationale." }
        ]
      },
      {
        id: "questions-paraphrase",
        path: "/api/v1/questions/bulk/paraphrase",
        method: "POST",
        summary: "AI Bulk Distractor & Stem Paraphraser",
        description: "Re-phrases multiple questions or distractors to create parallel form exam variants while preserving psychometric difficulty.",
        roles: ["TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "BulkParaphraseDto",
          example: {
            questionIds: ["q_91a0c12e", "q_91a0c12f"],
            paraphraseMode: "CLINICAL_SCENARIO"
          }
        },
        responses: [
          { statusCode: 200, description: "Paraphrased alternatives generated." }
        ]
      },
      {
        id: "questions-tracker",
        path: "/api/v1/questions/encoding-tracker",
        method: "GET",
        summary: "Faculty Question Encoding Tracker",
        description: "Executive tracking dashboard monitoring faculty encoding quotas, completion rates, and pending review bottlenecks.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Faculty quota summary returned." }
        ]
      },
      {
        id: "questions-topics",
        path: "/api/v1/questions/topics",
        method: "GET",
        summary: "Discipline Topic List",
        description: "Retrieves organized clinical chapter topics and sub-disciplines for question classification.",
        roles: ["AUTHENTICATED"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "List of curriculum topics." }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. ADMIN - STUDENT ROSTER & LEARNING DIAGNOSTICS
  // =========================================================================
  {
    id: "students",
    name: "Student Roster & Diagnostics",
    section: "admin",
    description: "Medical Technology student examinee cohorts, CSV enrollment, mock exam score recording, personalized study plans, and lesson completion.",
    basePath: "/api/v1/students",
    endpoints: [
      {
        id: "students-list",
        path: "/api/v1/students/get",
        method: "GET",
        summary: "Enrolled Students Directory",
        description: "Returns paginated list of student examinees with filtering by academic level, XP tier, passing status, and search query.",
        roles: ["TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        parameters: [
          { name: "page", in: "query", required: false, type: "number", description: "Page index (1-based)" },
          { name: "limit", in: "query", required: false, type: "number", description: "Records per page" },
          { name: "search", in: "query", required: false, type: "string", description: "Search by student name or email" }
        ],
        responses: [
          {
            statusCode: 200,
            description: "Students roster returned.",
            example: {
              success: true,
              data: [
                {
                  id: "std_2023001",
                  name: "Juan Dela Cruz",
                  email: "j.delacruz@swu.phinma.edu.ph",
                  level: 18,
                  xp: 14250,
                  streak: 12,
                  verified: true
                }
              ],
              total: 420
            }
          }
        ]
      },
      {
        id: "students-enroll-bulk",
        path: "/api/v1/students/bulk",
        method: "POST",
        summary: "Bulk Enroll Students via CSV / Excel",
        description: "Batch creates student user profiles, generates verified institutional credentials, and links examinees to target academic cohorts.",
        roles: ["TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "BulkStudentsDto",
          example: {
            students: [
              { name: "Ana Reyes", email: "a.reyes@swu.phinma.edu.ph" },
              { name: "Mark Bautista", email: "m.bautista@swu.phinma.edu.ph" }
            ],
            schoolYear: "S.Y. 2026-2027"
          }
        },
        responses: [
          { statusCode: 201, description: "Batch enrollment processed." }
        ]
      },
      {
        id: "students-stats",
        path: "/api/v1/students/stats/:studentId",
        method: "GET",
        summary: "Student Overview Diagnostics",
        description: "Retrieves complete performance statistics, question attempts, mock board readiness index, and weak topics for an individual examinee.",
        roles: ["TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        parameters: [
          { name: "studentId", in: "path", required: true, type: "string", description: "Student User ObjectID" }
        ],
        responses: [
          { statusCode: 200, description: "Detailed diagnostics payload." }
        ]
      },
      {
        id: "students-exam-record",
        path: "/api/v1/students/exam/record",
        method: "POST",
        summary: "Record Mock Exam Result",
        description: "Records student score, total items, accuracy, and subject breakdown for an administered exam session.",
        roles: ["TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "RecordExamDto",
          example: {
            userId: "std_2023001",
            score: 82,
            total: 100,
            accuracy: 82.0,
            subject: "Clinical Chemistry"
          }
        },
        responses: [
          { statusCode: 201, description: "Exam result recorded." }
        ]
      }
    ]
  },

  // =========================================================================
  // 4. ADMIN - FACULTY & USER DIRECTORY
  // =========================================================================
  {
    id: "faculty",
    name: "Faculty & Access Control",
    section: "admin",
    description: "Management of faculty accounts, Dean & Team Lead promotions, discipline assignments, and active session overrides.",
    basePath: "/api/v1/faculty",
    endpoints: [
      {
        id: "faculty-list",
        path: "/api/v1/faculty",
        method: "GET",
        summary: "List Faculty & Administrative Accounts",
        description: "Returns all faculty members with assigned subjects, roles, and status.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Faculty list returned." }
        ]
      },
      {
        id: "faculty-create",
        path: "/api/v1/faculty",
        method: "POST",
        summary: "Create Faculty Account",
        description: "Provisions an institutional faculty or coordinator account with assigned roles.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "CreateFacultyDto",
          example: {
            name: "Dr. Roberto Gomez, MD, FPSP",
            email: "r.gomez@swu.phinma.edu.ph",
            employeeId: "EMP-2026-104",
            role: "TEAMLEAD",
            phoneNumber: "+63 918 555 1234",
            handledSubjectIds: ["subj_cc_01"]
          }
        },
        responses: [
          { statusCode: 201, description: "Faculty user provisioned." }
        ]
      },
      {
        id: "faculty-status",
        path: "/api/v1/faculty/:id/status",
        method: "PATCH",
        summary: "Toggle Faculty Account Status",
        description: "Activates or deactivates faculty portal credentials.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
        authRequired: true,
        parameters: [
          { name: "id", in: "path", required: true, type: "string", description: "AdminUser ObjectID" }
        ],
        responses: [
          { statusCode: 200, description: "Account status modified." }
        ]
      }
    ]
  },

  // =========================================================================
  // 5. ADMIN - ANALYTICS & MASTERY RADAR
  // =========================================================================
  {
    id: "analytics",
    name: "Academic Analytics & Reporting",
    section: "admin",
    description: "Institutional board exam readiness metrics, subject mastery radar distributions, and student diagnostic pass probability models.",
    basePath: "/api/v1/analytics",
    endpoints: [
      {
        id: "analytics-overview",
        path: "/api/v1/analytics/dashboard-summary",
        method: "GET",
        summary: "Executive Dean's Dashboard Summary",
        description: "Calculates cohort pass probability, overall average accuracy, high-risk student counts, and question encoding progress.",
        roles: ["AUTHENTICATED", "TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        responses: [
          {
            statusCode: 200,
            description: "Analytics dashboard metrics.",
            example: {
              success: true,
              data: {
                totalStudents: 420,
                predictedPassRate: 88.4,
                atRiskStudentsCount: 38,
                totalMockExamsTaken: 1250,
                subjectPerformance: [
                  { subject: "Clinical Chemistry", accuracy: 81.2 },
                  { subject: "Microbiology & Parasitology", accuracy: 76.5 },
                  { subject: "Hematology", accuracy: 84.1 }
                ]
              }
            }
          }
        ]
      },
      {
        id: "analytics-student-mastery",
        path: "/api/v1/analytics/student/:studentId/topic-mastery",
        method: "GET",
        summary: "Student Topic Mastery Radar",
        description: "Generates topic-level mastery radar metrics across all board disciplines for an individual examinee.",
        roles: ["TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        parameters: [
          { name: "studentId", in: "path", required: true, type: "string", description: "Student User ObjectID" }
        ],
        responses: [
          { statusCode: 200, description: "Topic mastery radar metrics." }
        ]
      }
    ]
  },

  // =========================================================================
  // 6. ADMIN - CALENDAR & REVIEW SCHEDULES
  // =========================================================================
  {
    id: "calendar",
    name: "Academic Calendar & Schedules",
    section: "admin",
    description: "Comprehensive review session schedules, faculty office hours, mock board test dates, and calendar event coordination.",
    basePath: "/api/v1/calendar",
    endpoints: [
      {
        id: "calendar-events",
        path: "/api/v1/calendar/events",
        method: "GET",
        summary: "List Academic Calendar Events",
        description: "Retrieves scheduled review lectures, mock board dates, and deadlines.",
        roles: ["AUTHENTICATED", "TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Calendar events array." }
        ]
      },
      {
        id: "calendar-create",
        path: "/api/v1/calendar/events",
        method: "POST",
        summary: "Schedule Calendar Event",
        description: "Publishes an academic review event or exam date to faculty and student calendars.",
        roles: ["TEACHER", "TEAMLEAD", "DEAN", "SUPERADMIN"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "CreateEventDto",
          example: {
            title: "Diagnostic Mock Board Examination #1",
            startDate: "2026-11-15T08:00:00.000Z",
            endDate: "2026-11-15T17:00:00.000Z",
            category: "EXAM",
            location: "Main Auditorium / Arena Mode"
          }
        },
        responses: [
          { statusCode: 201, description: "Event scheduled." }
        ]
      }
    ]
  },

  // =========================================================================
  // 7. ADMIN - AUDIT LOGS & TRACE
  // =========================================================================
  {
    id: "logs",
    name: "System Logs & Audit Trail",
    section: "admin",
    description: "Tamper-evident audit trail capturing security logins, role privilege updates, question approval events, and administrative deletions.",
    basePath: "/api/v1/logs",
    endpoints: [
      {
        id: "logs-get",
        path: "/api/v1/logs/get",
        method: "GET",
        summary: "Query Administrative Audit Logs",
        description: "Returns paginated audit records with filtering by log severity (`INFO`, `WARN`, `ERROR`, `FATAL`) and action keyword.",
        roles: ["SUPERADMIN", "DEAN"],
        authRequired: true,
        parameters: [
          { name: "level", in: "query", required: false, type: "string", description: "INFO | WARN | ERROR | FATAL" },
          { name: "page", in: "query", required: false, type: "number", description: "Page index" }
        ],
        responses: [
          { statusCode: 200, description: "Audit trail log records." }
        ]
      },
      {
        id: "logs-stats",
        path: "/api/v1/logs/stats",
        method: "GET",
        summary: "Audit Log Aggregation Stats",
        description: "Returns log frequency grouped by severity and source component.",
        roles: ["SUPERADMIN", "DEAN"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Log counts by level." }
        ]
      }
    ]
  },

  // =========================================================================
  // 8. ADMIN - GUIDANCE COUNSELING & OUTREACH
  // =========================================================================
  {
    id: "guidance",
    name: "Guidance Counseling & Student Outreach",
    section: "admin",
    description: "Academic intervention protocols, at-risk student referral cases, remedial quiz quotas, and advisor consultation communication logs.",
    basePath: "/api/v1/guidance",
    endpoints: [
      {
        id: "guidance-failing",
        path: "/api/v1/guidance/failing-students",
        method: "GET",
        summary: "Identify At-Risk Students",
        description: "Identifies examinees performing below passing cutoff rates or with active proctoring warning strikes.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "List of identified at-risk examinees." }
        ]
      },
      {
        id: "guidance-reachout",
        path: "/api/v1/guidance/reachout",
        method: "POST",
        summary: "Dispatch Advisory Outreach",
        description: "Dispatches personalized email, consultation invite, or warning notification to an at-risk student examinee.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "ReachoutDto",
          example: {
            studentId: "std_2023001",
            channel: "EMAIL",
            subject: "Academic Consultation & Review Strategy",
            message: "We noticed low scores in Clinical Chemistry diagnostic mock boards. Please schedule a consultation.",
            templateType: "CONSULTATION",
            focusSubject: "Clinical Chemistry"
          }
        },
        responses: [
          { statusCode: 200, description: "Outreach message logged and dispatched." }
        ]
      },
      {
        id: "guidance-list",
        path: "/api/v1/guidance",
        method: "GET",
        summary: "List Guidance Case Assignments",
        description: "Lists active academic guidance cases, assigned advisors, targets, and resolution states.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Guidance assignments list." }
        ]
      },
      {
        id: "guidance-create",
        path: "/api/v1/guidance",
        method: "POST",
        summary: "Create Guidance Assignment",
        description: "Assigns a faculty advisor to mentor a student with mandatory drill question quotas.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "CreateGuidanceDto",
          example: {
            studentId: "std_2023001",
            advisorId: "usr_68dfb910",
            subjectCategory: "Clinical Chemistry",
            reason: "Score below 75% on diagnostic exam",
            drillQuota: 30,
            targetAccuracy: 75.0
          }
        },
        responses: [
          { statusCode: 201, description: "Guidance case opened." }
        ]
      }
    ]
  },

  // =========================================================================
  // 9. ADMIN - REAL-TIME NOTIFICATIONS & SSE
  // =========================================================================
  {
    id: "notifications",
    name: "Notifications & Real-Time SSE",
    section: "admin",
    description: "Server-Sent Events (SSE) live notification stream, quota alerts, item review notifications, and periodic email digests.",
    basePath: "/api/v1/notifications",
    endpoints: [
      {
        id: "notif-stream",
        path: "/api/v1/notifications/stream",
        method: "GET",
        summary: "Live SSE Notification Stream",
        description: "Establishes a persistent Server-Sent Events (SSE) connection pushing live alerts for approvals, quota reminders, and guidance referrals.",
        roles: ["AUTHENTICATED"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "text/event-stream active channel." }
        ]
      },
      {
        id: "notif-list",
        path: "/api/v1/notifications/get",
        method: "GET",
        summary: "List In-App Notifications",
        description: "Returns unread and historical notifications for the current authenticated user.",
        roles: ["AUTHENTICATED"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Notifications list." }
        ]
      },
      {
        id: "notif-read-all",
        path: "/api/v1/notifications/read-all",
        method: "PATCH",
        summary: "Mark All Notifications as Read",
        description: "Updates read status for all unread notifications belonging to the user.",
        roles: ["AUTHENTICATED"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "All notifications marked as read." }
        ]
      }
    ]
  },

  // =========================================================================
  // 10. ADMIN - MEDIA & DOCUMENT UPLOADS
  // =========================================================================
  {
    id: "upload",
    name: "Media & Asset Uploads",
    section: "admin",
    description: "Cloud storage uploads for badge artwork, question photomicrographs, curriculum slides, and faculty portrait pictures.",
    basePath: "/api/v1/upload",
    endpoints: [
      {
        id: "upload-module",
        path: "/api/v1/upload/module-file",
        method: "POST",
        summary: "Upload Learning Module Handout",
        description: "Uploads lecture slides, laboratory guides, or reference PDF files linked to learning modules.",
        roles: ["AUTHENTICATED"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Hosted URL of uploaded document." }
        ]
      },
      {
        id: "upload-badge",
        path: "/api/v1/upload/badge-image",
        method: "POST",
        summary: "Upload Badge Artwork",
        description: "Uploads high-resolution sprite or icon asset for collectible achievements.",
        roles: ["AUTHENTICATED"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Hosted URL of badge image." }
        ]
      },
      {
        id: "upload-avatar",
        path: "/api/v1/upload/profile-picture",
        method: "POST",
        summary: "Upload Profile Avatar",
        description: "Uploads personal faculty or student avatar image.",
        roles: ["AUTHENTICATED"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Hosted URL of profile photo." }
        ]
      }
    ]
  },

  // =========================================================================
  // 11. ADMIN - GAMIFICATION ARENA & CMS
  // =========================================================================
  {
    id: "game",
    name: "Gamification Arena & Rules Engine",
    section: "admin",
    description: "Collectible badges, rank tiers (Novice to Paragon), XP balancing parameters, active streak bonuses, and student arena leaderboards.",
    basePath: "/api/v1/game",
    endpoints: [
      {
        id: "game-badges",
        path: "/api/v1/game/badges",
        method: "GET",
        summary: "List Achievement Badges",
        description: "Retrieves all gamification badge definitions, unlock rules, categories, and sprite artwork.",
        roles: ["PUBLIC"],
        authRequired: false,
        responses: [
          { statusCode: 200, description: "Badges array." }
        ]
      },
      {
        id: "game-ranks",
        path: "/api/v1/game/ranks",
        method: "GET",
        summary: "List Rank Tiers",
        description: "Retrieves rank hierarchy (Novice, Aspirant, Adept, Scholar, Vanguard, Paragon) and level thresholds.",
        roles: ["PUBLIC"],
        authRequired: false,
        responses: [
          { statusCode: 200, description: "Rank tiers array." }
        ]
      },
      {
        id: "game-config",
        path: "/api/v1/game/config",
        method: "GET",
        summary: "Game Rules & XP Multipliers",
        description: "Retrieves balancing rules: base XP, streak bonus percentages, HOTS multipliers, and level caps.",
        roles: ["PUBLIC"],
        authRequired: false,
        responses: [
          { statusCode: 200, description: "Game configuration object." }
        ]
      },
      {
        id: "game-leaderboard",
        path: "/api/v1/game/leaderboard",
        method: "GET",
        summary: "Arena Student Leaderboard",
        description: "Returns top student rankings by cumulative XP, streak longevity, and badge counts.",
        roles: ["PUBLIC"],
        authRequired: false,
        responses: [
          { statusCode: 200, description: "Leaderboard rankings." }
        ]
      },
      {
        id: "game-session",
        path: "/api/v1/game/session/complete",
        method: "POST",
        summary: "Submit Arena Gameplay Session",
        description: "Processes completed arena quiz session, computes XP gains, updates streak, and awards unlocked badges.",
        roles: ["PUBLIC"],
        authRequired: false,
        requestBody: {
          contentType: "application/json",
          schema: "SessionCompleteDto",
          example: {
            userId: "std_2023001",
            subject: "Clinical Chemistry",
            correctCount: 9,
            totalCount: 10,
            quizMode: "quest"
          }
        },
        responses: [
          { statusCode: 200, description: "Session summary with XP and badges earned." }
        ]
      }
    ]
  },

  // =========================================================================
  // 12. ADMIN - SYSTEM SETTINGS & BRANDING
  // =========================================================================
  {
    id: "system-settings",
    name: "System Settings & White-Label Theme",
    section: "admin",
    description: "Institutional identity, SWU PHINMA university seal, and theme color overrides.",
    basePath: "/api/v1/system-settings",
    endpoints: [
      {
        id: "settings-get",
        path: "/api/v1/system-settings",
        method: "GET",
        summary: "Public Branding & Portal Settings",
        description: "Returns white-label identity parameters, portal logo, institution subtitle, and theme color palette tokens.",
        roles: ["PUBLIC"],
        authRequired: false,
        responses: [
          {
            statusCode: 200,
            description: "System settings returned.",
            example: {
              success: true,
              data: {
                systemName: "BoardQuest",
                institutionSubtitle: "SWU PHINMA School of Medical Technology",
                adminThemeId: "maroon-heritage",
                adminCustomColor: "#800000",
                reviewCenterThemeId: "monochrome-zinc"
              }
            }
          }
        ]
      },
      {
        id: "settings-update",
        path: "/api/v1/system-settings",
        method: "PUT",
        summary: "Update Institutional Settings",
        description: "Restricted to Superadmin & Dean: modifies institutional branding, theme tokens, and university logos.",
        roles: ["SUPERADMIN", "DEAN"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "UpdateSettingsDto",
          example: {
            systemName: "BoardQuest Pro",
            adminThemeId: "emerald",
            adminCustomColor: "#059669"
          }
        },
        responses: [
          { statusCode: 200, description: "Settings updated successfully." }
        ]
      }
    ]
  },

  // =========================================================================
  // 13. REVIEW CENTER - PARTNER MANAGEMENT (ADMIN VIEW)
  // =========================================================================
  {
    id: "review-center-mgmt",
    name: "Review Center Partner Administration",
    section: "review-center",
    description: "Multi-tenant review center partner company registration, representative rosters, candidate score previews, and report card dispatches.",
    basePath: "/api/v1/review-center",
    endpoints: [
      {
        id: "rc-mgmt-list",
        path: "/api/v1/review-center",
        method: "GET",
        summary: "List Partner Review Centers",
        description: "Returns all registered external review center partner tenants and their status.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Review centers array." }
        ]
      },
      {
        id: "rc-mgmt-create",
        path: "/api/v1/review-center",
        method: "POST",
        summary: "Register Review Center Partner",
        description: "Onboards a new review center corporate partner tenant.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "CreateReviewCenterDto",
          example: {
            name: "Apex MedTech Review Academy",
            code: "APEX-CEBU",
            contactEmail: "info@apexmedtech.ph",
            contactPhone: "+63 32 255 8899",
            location: "Cebu City, Philippines"
          }
        },
        responses: [
          { statusCode: 201, description: "Review center created." }
        ]
      },
      {
        id: "rc-mgmt-email-reports",
        path: "/api/v1/review-center/assessments/:id/email-reports",
        method: "POST",
        summary: "Email Candidate Grade Reports",
        description: "Triggers automated email dispatch of individual mock board scorecards to candidates.",
        roles: ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"],
        authRequired: true,
        parameters: [
          { name: "id", in: "path", required: true, type: "string", description: "Assessment ObjectID" }
        ],
        responses: [
          { statusCode: 200, description: "Scorecard emails queued." }
        ]
      }
    ]
  },

  // =========================================================================
  // 14. REVIEW CENTER - AUTHENTICATION
  // =========================================================================
  {
    id: "rc-auth",
    name: "Review Center Partner Auth",
    section: "review-center",
    description: "Dedicated portal authentication for external review center representative accounts.",
    basePath: "/api/v1/review-center-app/auth",
    endpoints: [
      {
        id: "rc-auth-login",
        path: "/api/v1/review-center-app/auth/login",
        method: "POST",
        summary: "Representative Partner Login",
        description: "Authenticates a review center representative and returns scoped authorization tokens.",
        roles: ["PUBLIC"],
        authRequired: false,
        rateLimited: true,
        requestBody: {
          contentType: "application/json",
          schema: "RcLoginDto",
          example: {
            email: "rep@pioneer-review.com",
            password: "PartnerPassword2026!"
          }
        },
        responses: [
          {
            statusCode: 200,
            description: "Authentication successful.",
            example: {
              success: true,
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              user: {
                id: "rc_rep_09",
                email: "rep@pioneer-review.com",
                name: "Carlos Mendoza, RMT",
                companyName: "Pioneer Review Center",
                role: "REVIEW_CENTER_REPRESENTATIVE"
              }
            }
          }
        ]
      },
      {
        id: "rc-auth-me",
        path: "/api/v1/review-center-app/auth/me",
        method: "GET",
        summary: "Review Center Profile Details",
        description: "Retrieves authenticated partner profile and affiliated company information.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Representative profile returned." }
        ]
      }
    ]
  },

  // =========================================================================
  // 15. REVIEW CENTER - SCHEDULES & CALENDAR
  // =========================================================================
  {
    id: "rc-schedules",
    name: "Review Center Schedules & Batches",
    section: "review-center",
    description: "Schedule review cohorts, lecture sessions, and mock board exams for partner review centers.",
    basePath: "/api/v1/review-center-app/schedules",
    endpoints: [
      {
        id: "rc-schedules-list",
        path: "/api/v1/review-center-app/schedules",
        method: "GET",
        summary: "List Review Program Schedules",
        description: "Retrieves scheduled cohort review classes and testing dates.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Schedules array." }
        ]
      },
      {
        id: "rc-schedules-create",
        path: "/api/v1/review-center-app/schedules",
        method: "POST",
        summary: "Create Review Schedule",
        description: "Creates a new review class or mock exam schedule session.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "CreateScheduleDto",
          example: {
            title: "Intensive Clinical Microscopy Workshop",
            startDate: "2026-11-20T08:00:00.000Z",
            endDate: "2026-11-20T17:00:00.000Z",
            category: "WORKSHOP"
          }
        },
        responses: [
          { statusCode: 201, description: "Schedule created." }
        ]
      }
    ]
  },

  // =========================================================================
  // 16. REVIEW CENTER - CANDIDATE ENROLLMENT
  // =========================================================================
  {
    id: "rc-candidates",
    name: "Candidate Enrollment & School Years",
    section: "review-center",
    description: "Review center candidate examinee rosters, CSV batch registration, and school year cohorts.",
    basePath: "/api/v1/review-center-app/candidates",
    endpoints: [
      {
        id: "rc-candidates-list",
        path: "/api/v1/review-center-app/candidates",
        method: "GET",
        summary: "List Enrolled Candidates",
        description: "Retrieves candidate examinees enrolled in review center cohort programs.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        parameters: [
          { name: "schoolYear", in: "query", required: false, type: "string", description: "Academic year filter" },
          { name: "batch", in: "query", required: false, type: "string", description: "Batch filter" }
        ],
        responses: [
          { statusCode: 200, description: "Candidate examinees array." }
        ]
      },
      {
        id: "rc-candidates-bulk",
        path: "/api/v1/review-center-app/candidates/bulk",
        method: "POST",
        summary: "Bulk Enroll Candidates via CSV",
        description: "Uploads roster of examinee candidates enrolled for upcoming mock board exams.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "BulkCandidatesDto",
          example: {
            candidates: [
              { name: "Kaye Bernardo", email: "k.bernardo@gmail.com", schoolId: "SWU-2023-901" },
              { name: "Liam Tan", email: "l.tan@gmail.com", schoolId: "SWU-2023-902" }
            ],
            schoolYear: "2026-2027",
            batch: "Batch 1"
          }
        },
        responses: [
          { statusCode: 201, description: "Candidates enrolled." }
        ]
      },
      {
        id: "rc-school-years",
        path: "/api/v1/review-center-app/candidates/school-years",
        method: "GET",
        summary: "List Cohort School Years",
        description: "Returns review center academic years and current term status.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "School years array." }
        ]
      }
    ]
  },

  // =========================================================================
  // 17. REVIEW CENTER - ASSESSMENTS & SCORES
  // =========================================================================
  {
    id: "rc-assessments",
    name: "Mock Board Assessments & Scores",
    section: "review-center",
    description: "Creation of mock board examinations, CSV score uploads, grade matrix analysis, and student scorecard preview.",
    basePath: "/api/v1/review-center-app/assessments",
    endpoints: [
      {
        id: "rc-assessments-list",
        path: "/api/v1/review-center-app/assessments",
        method: "GET",
        summary: "List Mock Board Assessments",
        description: "Retrieves assessments administered by review center partner with mean scores and passing rates.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Assessments array." }
        ]
      },
      {
        id: "rc-assessments-create",
        path: "/api/v1/review-center-app/assessments",
        method: "POST",
        summary: "Create Mock Board Exam Instance",
        description: "Sets up an assessment with discipline, maximum score, and passing cutoff.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        requestBody: {
          contentType: "application/json",
          schema: "CreateAssessmentDto",
          example: {
            title: "Comprehensive Mock Board #1",
            subject: "Clinical Chemistry",
            schoolYear: "2026-2027",
            batch: "Batch 1",
            maxScore: 100,
            passingScore: 75,
            passingRate: 75.0,
            assessmentDate: "2026-11-25T08:00:00.000Z"
          }
        },
        responses: [
          { statusCode: 201, description: "Assessment created." }
        ]
      },
      {
        id: "rc-assessments-template",
        path: "/api/v1/review-center-app/assessments/:id/template",
        method: "GET",
        summary: "Download Pre-Populated Scoring Template",
        description: "Generates CSV spreadsheet pre-filled with candidate IDs and names ready for score recording.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        parameters: [
          { name: "id", in: "path", required: true, type: "string", description: "Assessment ObjectID" }
        ],
        responses: [
          { statusCode: 200, description: "CSV file download stream." }
        ]
      },
      {
        id: "rc-assessments-scores-bulk",
        path: "/api/v1/review-center-app/assessments/:id/scores/bulk",
        method: "POST",
        summary: "Bulk Save Examinee Scores",
        description: "Imports numeric scores, calculates percentiles, and updates assessment statistics.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        parameters: [
          { name: "id", in: "path", required: true, type: "string", description: "Assessment ObjectID" }
        ],
        requestBody: {
          contentType: "application/json",
          schema: "BulkScoresDto",
          example: {
            scores: [
              { candidateId: "cand_01", score: 88, status: "PRESENT" },
              { candidateId: "cand_02", score: 72, status: "PRESENT" }
            ]
          }
        },
        responses: [
          { statusCode: 200, description: "Scores recorded and percentiles computed." }
        ]
      },
      {
        id: "rc-assessments-matrix",
        path: "/api/v1/review-center-app/assessments/matrix",
        method: "GET",
        summary: "Examinee Grade Matrix",
        description: "Comparative matrix tracking examinee performance across all subjects.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Comparative grade matrix array." }
        ]
      }
    ]
  },

  // =========================================================================
  // 18. REVIEW CENTER - REAL-TIME NOTIFICATIONS
  // =========================================================================
  {
    id: "rc-notifications",
    name: "Review Center Real-Time SSE",
    section: "review-center",
    description: "Live Server-Sent Events stream and notification alerts for partner review center representatives.",
    basePath: "/api/v1/review-center-app/notifications",
    endpoints: [
      {
        id: "rc-notif-stream",
        path: "/api/v1/review-center-app/notifications/stream",
        method: "GET",
        summary: "Live Representative SSE Stream",
        description: "Maintains live connection pushing candidate roster updates and scorecard email dispatch logs.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "text/event-stream active channel." }
        ]
      },
      {
        id: "rc-notif-list",
        path: "/api/v1/review-center-app/notifications",
        method: "GET",
        summary: "List Representative Notifications",
        description: "Returns unread and historical notifications for the representative.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Notifications array." }
        ]
      },
      {
        id: "rc-notif-unread",
        path: "/api/v1/review-center-app/notifications/unread-count",
        method: "GET",
        summary: "Unread Alerts Badge Count",
        description: "Returns total number of unread notifications for badge display.",
        roles: ["REVIEW_CENTER_REPRESENTATIVE"],
        authRequired: true,
        responses: [
          { statusCode: 200, description: "Unread count count." }
        ]
      }
    ]
  }
];
