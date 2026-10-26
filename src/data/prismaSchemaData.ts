export interface SchemaField {
  name: string;
  type: string;
  isRequired: boolean;
  isId?: boolean;
  isUnique?: boolean;
  defaultValue?: string;
  description: string;
}

export type SchemaCategory = 
  | 'All'
  | 'Admin & Faculty'
  | 'Question Bank & AI'
  | 'Review Center'
  | 'Student & Learning'
  | 'Gamification & Integrity'
  | 'Enums & Types';

export interface SchemaModel {
  name: string;
  category: 'Admin & Faculty' | 'Question Bank & AI' | 'Review Center' | 'Student & Learning' | 'Gamification & Integrity';
  collectionName?: string;
  description: string;
  fields: SchemaField[];
}

export interface SchemaEnum {
  name: string;
  description: string;
  values: { name: string; description?: string }[];
}

export const PRISMA_ENUMS: SchemaEnum[] = [
  {
    name: "Role",
    description: "Hierarchical role-based access control (RBAC) tiers for institutional faculty and administrators.",
    values: [
      { name: "SUPERADMIN", description: "Highest administrative authority with full system configuration and user management rights." },
      { name: "DEAN", description: "Departmental academic executive overseeing faculty, subjects, and curriculum metrics." },
      { name: "TEAMLEAD", description: "Subject discipline lead reviewing question submissions and approving items." },
      { name: "TEACHER", description: "Instructional faculty member encoding questions and monitoring student mastery." }
    ]
  },
  {
    name: "QuestionDifficulty",
    description: "Item response psychometric calibration tiers for question complexity.",
    values: [
      { name: "EASY", description: "Foundational recall and basic terminology recognition." },
      { name: "MEDIUM", description: "Application of clinical principles and laboratory analysis interpretation." },
      { name: "HARD", description: "Complex clinical vignette, multi-step problem solving, and cross-discipline integration." }
    ]
  },
  {
    name: "CognitiveLevel",
    description: "Bloom's Revised Taxonomy classification for board exam preparedness.",
    values: [
      { name: "LOTS", description: "Lower Order Thinking Skills (Remembering, Understanding)." },
      { name: "HOTS", description: "Higher Order Thinking Skills (Applying, Analyzing, Evaluating)." }
    ]
  },
  {
    name: "QuestionType",
    description: "Permitted assessment question interaction formats.",
    values: [
      { name: "MCQ", description: "Standard single-best-answer 4-option multiple choice question." },
      { name: "TRUE_FALSE", description: "Binary validity statement verification." },
      { name: "SHORT_ANSWER", description: "Direct numerical or medical laboratory term response." }
    ]
  },
  {
    name: "QuestionStatus",
    description: "Lifecycle editorial workflow stage of a question bank entry.",
    values: [
      { name: "APPROVED", description: "Vetted and published into the active exam and quest rotation pools." },
      { name: "PENDING_REVIEW", description: "Awaiting review and peer critique by the assigned subject Team Lead." },
      { name: "PENDING_REVISION", description: "Flagged with editorial notes requiring revision by the original author." }
    ]
  },
  {
    name: "RequestStatus",
    description: "Administrative approval state for workflow requests.",
    values: [
      { name: "PENDING", description: "Submission awaiting executive decision." },
      { name: "APPROVED", description: "Approved and granted." },
      { name: "DECLINED", description: "Rejected with justification notes." }
    ]
  },
  {
    name: "GuidanceStatus",
    description: "Student academic intervention and faculty counseling case workflow.",
    values: [
      { name: "PENDING", description: "Counseling assignment generated; awaiting teacher outreach." },
      { name: "IN_PROGRESS", description: "Active mentorship, remedial quizzes, or consultation ongoing." },
      { name: "RESOLVED", description: "Student reached mastery target accuracy; case closed." },
      { name: "CANCELLED", description: "Intervention waived or superseded." }
    ]
  },
  {
    name: "BadgeCategory",
    description: "Gamification achievement domain categories.",
    values: [
      { name: "QUEST", description: "Arena and chapter node completion milestones." },
      { name: "STREAK", description: "Consecutive daily study session commitments." },
      { name: "BOSS", description: "Comprehensive timed mock board challenge completion." },
      { name: "SUBJECT", description: "Discipline-specific proficiency milestones." },
      { name: "EXAM", description: "Formal mock board examination performance." },
      { name: "PERFORMANCE", description: "Accuracy thresholds (e.g. 90%+ in a clinical discipline)." },
      { name: "SPEED", description: "Rapid question response with high accuracy." },
      { name: "MASTERY", description: "Comprehensive coverage of all subject domains." },
      { name: "SPECIAL", description: "Institutional event, honors, or seasonal achievements." }
    ]
  },
  {
    name: "AccountStatus",
    description: "Identity credential active state in the institutional directory.",
    values: [
      { name: "ACTIVE", description: "Full operational access granted." },
      { name: "DEACTIVATED", description: "Account suspended; authentication tokens immediately invalidated." }
    ]
  },
  {
    name: "LogLevel",
    description: "Audit trail log severity classification.",
    values: [
      { name: "INFO", description: "Standard operational events, user logins, and exports." },
      { name: "WARN", description: "Deprecations, rate-limit warnings, or potential security anomalies." },
      { name: "ERROR", description: "Handled execution failures or external API dispatch errors." },
      { name: "FATAL", description: "Critical database connection or service-halting faults." }
    ]
  },
  {
    name: "NotificationType",
    description: "Real-time dispatch channels and alert types for user notifications.",
    values: [
      { name: "INFO", description: "General system announcement or advisory." },
      { name: "SUCCESS", description: "Positive confirmation of an asynchronous process." },
      { name: "WARNING", description: "Urgent deadline or quota alert." },
      { name: "ERROR", description: "Process failure or security flag." },
      { name: "QUESTION_APPROVED", description: "Notification to faculty author that submitted item was approved." },
      { name: "STUDENT_ASSIGNED", description: "Alert to faculty advisor regarding new student guidance assignment." },
      { name: "SYSTEM_UPDATE", description: "Platform-wide scheduled maintenance or version rollout." }
    ]
  }
];

export const PRISMA_MODELS: SchemaModel[] = [
  // ================= ADMIN & FACULTY =================
  {
    name: "AdminUser",
    category: "Admin & Faculty",
    description: "Institutional faculty and administrative accounts with role-based access control (Superadmin, Dean, Team Lead, Teacher).",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "MongoDB ObjectId unique record identifier" },
      { name: "employeeId", type: "String", isRequired: true, isUnique: true, description: "Institutional staff identification code" },
      { name: "email", type: "String", isRequired: true, isUnique: true, description: "Official institutional email address" },
      { name: "password", type: "String", isRequired: true, description: "Argon2 / BCrypt hashed authentication secret" },
      { name: "name", type: "String", isRequired: true, description: "Full formal name with honorifics" },
      { name: "firstName", type: "String", isRequired: false, description: "Given first name" },
      { name: "lastName", type: "String", isRequired: false, description: "Family surname" },
      { name: "role", type: "Enum: Role", isRequired: true, description: "SUPERADMIN | DEAN | TEAMLEAD | TEACHER" },
      { name: "phoneNumber", type: "String", isRequired: true, description: "Primary contact phone or mobile number" },
      { name: "avatarUrl", type: "String", isRequired: false, description: "Hosted URL of the faculty profile portrait" },
      { name: "handledSubjectIds", type: "String[] (ObjectID)", isRequired: false, description: "Array of Subject ObjectIDs assigned for supervision" },
      { name: "questionPermissions", type: "Json", isRequired: false, description: "Granular CRUD overrides for question bank categories" },
      { name: "notificationPreferences", type: "Json", isRequired: false, description: "Notification channel toggles (email, in-app, SMS)" },
      { name: "location", type: "String", isRequired: false, defaultValue: '"Philippines"', description: "Geographic campus or branch identifier" },
      { name: "accountStatus", type: "Enum: AccountStatus", isRequired: true, defaultValue: "ACTIVE", description: "ACTIVE | DEACTIVATED" },
      { name: "isActive", type: "Boolean", isRequired: true, defaultValue: "true", description: "Quick boolean check for active sessions" },
      { name: "mustChangePassword", type: "Boolean", isRequired: false, defaultValue: "true", description: "Forces mandatory password change on first login" },
      { name: "termsAcceptedAt", type: "DateTime", isRequired: false, description: "Timestamp when institutional policy terms were signed" },
      { name: "lastActiveAt", type: "DateTime", isRequired: false, description: "Heartbeat timestamp of latest portal activity" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Account creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last record modification timestamp" }
    ]
  },
  {
    name: "SchoolYear",
    category: "Admin & Faculty",
    description: "Academic year cohorts for institutional tracking and student partitioning.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Unique school year record identifier" },
      { name: "year", type: "String", isRequired: true, isUnique: true, description: "Academic year label (e.g. 'S.Y. 2025-2026')" },
      { name: "isCurrent", type: "Boolean", isRequired: true, defaultValue: "false", description: "Flag designating the active cohort term" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Record creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last modification timestamp" }
    ]
  },
  {
    name: "Subject",
    category: "Admin & Faculty",
    description: "Medical Technology board exam major discipline areas (Clinical Chemistry, Hematology, Microbiology, etc.).",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Discipline unique identifier" },
      { name: "name", type: "String", isRequired: true, description: "Formal subject name (e.g. Clinical Chemistry)" },
      { name: "icon", type: "String", isRequired: true, description: "Icon key or SVG identifier (e.g. 'flask', 'microscope')" },
      { name: "handlerIds", type: "String[] (ObjectID)", isRequired: false, description: "Faculty AdminUser IDs with authority over this subject" },
      { name: "authorId", type: "String (ObjectID)", isRequired: true, description: "AdminUser who created the subject entry" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "LearningModule",
    category: "Admin & Faculty",
    description: "Instructional modules and curriculum materials linked to board subjects.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Module unique identifier" },
      { name: "title", type: "String", isRequired: true, description: "Module chapter title" },
      { name: "description", type: "String", isRequired: false, description: "Learning objectives and curriculum syllabus" },
      { name: "fileUrls", type: "String[]", isRequired: false, defaultValue: "[]", description: "Array of uploaded PDF, slide, or lab document URLs" },
      { name: "order", type: "Int", isRequired: true, defaultValue: "0", description: "Display sort sequence within subject" },
      { name: "isPublished", type: "Boolean", isRequired: true, defaultValue: "true", description: "Visibility status to enrolled students" },
      { name: "subjectId", type: "String (ObjectID)", isRequired: true, description: "Parent Subject reference (mapped from categoryId)" },
      { name: "authorId", type: "String (ObjectID)", isRequired: false, description: "Faculty AdminUser author" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last modification timestamp" }
    ]
  },
  {
    name: "QuestionQuotaAssignment",
    category: "Admin & Faculty",
    description: "Item contribution targets assigned to faculty members per academic year and discipline.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Quota assignment identifier" },
      { name: "teacherId", type: "String (ObjectID)", isRequired: true, description: "Target faculty member AdminUser ID" },
      { name: "subjectId", type: "String (ObjectID)", isRequired: true, description: "Assigned Subject ID" },
      { name: "assignedById", type: "String (ObjectID)", isRequired: false, description: "Dean or Superadmin who assigned the quota" },
      { name: "schoolYear", type: "String", isRequired: true, defaultValue: '"S.Y. 2025-2026"', description: "Academic year term" },
      { name: "targetCount", type: "Int", isRequired: true, defaultValue: "50", description: "Required quantity of approved questions" },
      { name: "deadline", type: "DateTime", isRequired: false, description: "Due date for completing question creation" },
      { name: "notes", type: "String", isRequired: false, description: "Guidance or syllabus focus instructions" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "SystemSettings",
    category: "Admin & Faculty",
    collectionName: "SystemSettings",
    description: "White-label institutional identity, branding presets, themes, and portal logos.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Settings singleton identifier" },
      { name: "systemName", type: "String", isRequired: true, defaultValue: '"BoardQuest"', description: "Platform branding title" },
      { name: "institutionSubtitle", type: "String", isRequired: true, defaultValue: '"SWU PHINMA"', description: "Institutional unit and university name" },
      { name: "logoUrl", type: "String", isRequired: false, description: "Hosted URL of the university seal or portal logo" },
      { name: "adminThemeId", type: "String", isRequired: true, defaultValue: '"maroon-heritage"', description: "Theme token for faculty & admin portal" },
      { name: "adminCustomColor", type: "String", isRequired: false, description: "Hex override for primary administrative accent" },
      { name: "reviewCenterThemeId", type: "String", isRequired: true, defaultValue: '"monochrome-zinc"', description: "Theme token for review center partner portal" },
      { name: "reviewCenterCustomColor", type: "String", isRequired: false, description: "Hex override for review center primary accent" },
      { name: "updatedBy", type: "String", isRequired: false, description: "Email or identifier of authorizing administrator" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last settings modification timestamp" }
    ]
  },
  {
    name: "SystemLog",
    category: "Admin & Faculty",
    description: "Audit trail log recording administrative actions, role modifications, and system events.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Log record unique identifier" },
      { name: "level", type: "Enum: LogLevel", isRequired: true, defaultValue: "INFO", description: "INFO | WARN | ERROR | FATAL" },
      { name: "action", type: "String", isRequired: true, description: "Event verb (e.g. USER_LOGIN, QUESTION_APPROVED, SETTINGS_UPDATED)" },
      { name: "message", type: "String", isRequired: true, description: "Human-readable description of the event" },
      { name: "source", type: "String", isRequired: false, defaultValue: '"System"', description: "Originating service or controller" },
      { name: "userEmail", type: "String", isRequired: false, description: "Email of actor triggering the action" },
      { name: "ipAddress", type: "String", isRequired: false, description: "Client IP address for security audit" },
      { name: "metadata", type: "String", isRequired: false, description: "Serialized JSON metadata payload" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Timestamp event occurred" }
    ]
  },
  {
    name: "Notification",
    category: "Admin & Faculty",
    description: "Real-time alerts, review updates, and automated guidance dispatches.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Notification unique identifier" },
      { name: "recipientId", type: "String", isRequired: false, description: "Target User or AdminUser ID (null for broadcast)" },
      { name: "recipientRole", type: "String", isRequired: false, description: "Target role filter (e.g. TEACHER, DEAN)" },
      { name: "title", type: "String", isRequired: true, description: "Headline text of the alert" },
      { name: "message", type: "String", isRequired: true, description: "Detailed alert body text" },
      { name: "type", type: "Enum: NotificationType", isRequired: true, defaultValue: "INFO", description: "INFO | SUCCESS | WARNING | ERROR | QUESTION_APPROVED | STUDENT_ASSIGNED | SYSTEM_UPDATE" },
      { name: "link", type: "String", isRequired: false, description: "Actionable navigation deep link URL" },
      { name: "isRead", type: "Boolean", isRequired: true, defaultValue: "false", description: "Direct read status for targeted notifications" },
      { name: "readUserIds", type: "String[]", isRequired: true, defaultValue: "[]", description: "User IDs that have acknowledged this broadcast" },
      { name: "deletedUserIds", type: "String[]", isRequired: true, defaultValue: "[]", description: "User IDs that dismissed this broadcast" },
      { name: "metadata", type: "String", isRequired: false, description: "Serialized JSON context payload" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Dispatch timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last state update" }
    ]
  },
  {
    name: "EmailVerification",
    category: "Admin & Faculty",
    description: "One-time verification tokens and PIN codes for account activation and password recovery.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Verification record identifier" },
      { name: "email", type: "String", isRequired: true, isUnique: true, description: "Email address pending verification" },
      { name: "code", type: "String", isRequired: true, description: "6-digit OTP or alphanumeric confirmation token" },
      { name: "expiresAt", type: "DateTime", isRequired: true, description: "Token validity cutoff timestamp" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Generation timestamp" }
    ]
  },

  // ================= QUESTION BANK & AI =================
  {
    name: "Question",
    category: "Question Bank & AI",
    description: "Standardized Medical Technology board exam review item with choices, rationale, and psychometrics.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Question unique identifier" },
      { name: "question", type: "String", isRequired: true, description: "Clinical vignette or question stem" },
      { name: "imageUrl", type: "String", isRequired: false, description: "Photomicrograph, chart, or clinical laboratory slide URL" },
      { name: "choices", type: "String[]", isRequired: true, description: "List of multiple choice options (A, B, C, D)" },
      { name: "choiceImages", type: "String[]", isRequired: true, defaultValue: "[]", description: "Visual options for image-based choices" },
      { name: "correctAnswer", type: "String", isRequired: true, description: "Exact string matching the correct option" },
      { name: "status", type: "Enum: QuestionStatus", isRequired: true, defaultValue: "APPROVED", description: "APPROVED | PENDING_REVIEW | PENDING_REVISION" },
      { name: "subjectId", type: "String (ObjectID)", isRequired: true, description: "Foreign key linking to Board Subject discipline" },
      { name: "topic", type: "String", isRequired: true, description: "Specific sub-specialty or chapter topic" },
      { name: "difficulty", type: "Enum: QuestionDifficulty", isRequired: true, description: "EASY | MEDIUM | HARD" },
      { name: "cognitiveLevel", type: "Enum: CognitiveLevel", isRequired: true, defaultValue: "LOTS", description: "LOTS (Lower Order) | HOTS (Higher Order)" },
      { name: "type", type: "Enum: QuestionType", isRequired: true, description: "MCQ | TRUE_FALSE | SHORT_ANSWER" },
      { name: "authorId", type: "String (ObjectID)", isRequired: true, description: "Faculty AdminUser author who created the item" },
      { name: "schoolYear", type: "String", isRequired: false, defaultValue: '"S.Y. 2025-2026"', description: "Academic year of submission" },
      { name: "feedback", type: "String", isRequired: false, defaultValue: '""', description: "Reviewer critique or editorial guidance notes" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last modification timestamp" }
    ]
  },
  {
    name: "QuestionExplanation",
    category: "Question Bank & AI",
    description: "Deep pedagogical explanation and clinical rationale for question solutions.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Explanation unique identifier" },
      { name: "questionId", type: "String (ObjectID)", isRequired: true, isUnique: true, description: "One-to-one foreign key linking to Question" },
      { name: "explanation", type: "String", isRequired: true, description: "Comprehensive evidence-based clinical reasoning" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "QuestionComment",
    category: "Question Bank & AI",
    description: "Peer-review critique and collaborative dialogue thread between teachers and team leads on a question.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Comment identifier" },
      { name: "questionId", type: "String (ObjectID)", isRequired: true, description: "Target Question ID" },
      { name: "authorId", type: "String (ObjectID)", isRequired: true, description: "Faculty AdminUser commenter" },
      { name: "content", type: "String", isRequired: true, description: "Feedback or suggested correction text" },
      { name: "isResolved", type: "Boolean", isRequired: true, defaultValue: "false", description: "Whether the critique has been addressed" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Comment timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last edit timestamp" }
    ]
  },
  {
    name: "AiAnalysis",
    category: "Question Bank & AI",
    description: "Machine learning diagnostic evaluation of student learning weaknesses and predicted board pass probability.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Analysis record identifier" },
      { name: "userId", type: "String (ObjectID)", isRequired: true, isUnique: true, description: "Student User ID" },
      { name: "analysis", type: "String (JSON)", isRequired: true, description: "JSON string containing weak topics, mastery radar, and study recommendations" },
      { name: "hash", type: "String", isRequired: true, description: "Content hash of underlying quiz attempts to detect when re-evaluation is needed" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last analysis timestamp" }
    ]
  },

  // ================= REVIEW CENTER =================
  {
    name: "ReviewCenter",
    category: "Review Center",
    description: "External partner review center corporate entity with multi-tenant isolation.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Review center tenant identifier" },
      { name: "name", type: "String", isRequired: true, isUnique: true, description: "Corporate name (e.g. Pioneer Review Center)" },
      { name: "code", type: "String", isRequired: false, isUnique: true, description: "Short alphanumeric institutional code" },
      { name: "description", type: "String", isRequired: false, description: "Company profile and accreditation details" },
      { name: "logoUrl", type: "String", isRequired: false, description: "Hosted URL of the partner corporate logo" },
      { name: "address", type: "String", isRequired: false, description: "Physical head office address" },
      { name: "location", type: "String", isRequired: false, defaultValue: '"Philippines"', description: "Regional headquarters" },
      { name: "contactEmail", type: "String", isRequired: false, description: "Official liaison email" },
      { name: "contactPhone", type: "String", isRequired: false, description: "Official contact hotline" },
      { name: "website", type: "String", isRequired: false, description: "Official website URL" },
      { name: "isActive", type: "Boolean", isRequired: true, defaultValue: "true", description: "Multi-tenant tenant status" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Registration timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last record update" }
    ]
  },
  {
    name: "ReviewCenterRepresentativeUser",
    category: "Review Center",
    description: "Review center staff and partner administrators managing candidate rosters and mock board uploads.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Representative user identifier" },
      { name: "employeeId", type: "String", isRequired: true, description: "Partner staff badge / employee code" },
      { name: "name", type: "String", isRequired: true, description: "Full representative name" },
      { name: "firstName", type: "String", isRequired: false, description: "First name" },
      { name: "lastName", type: "String", isRequired: false, description: "Last name" },
      { name: "email", type: "String", isRequired: true, isUnique: true, description: "Review center login email" },
      { name: "companyName", type: "String", isRequired: true, description: "Review center company title" },
      { name: "phonenumber", type: "String", isRequired: true, description: "Contact phone number" },
      { name: "password", type: "String", isRequired: true, description: "Hashed authentication password" },
      { name: "location", type: "String", isRequired: false, defaultValue: '"Philippines"', description: "Branch location" },
      { name: "avatarUrl", type: "String", isRequired: false, description: "Profile photo URL" },
      { name: "accountStatus", type: "Enum: AccountStatus", isRequired: true, defaultValue: "ACTIVE", description: "ACTIVE | DEACTIVATED" },
      { name: "isActive", type: "Boolean", isRequired: true, defaultValue: "true", description: "Active session flag" },
      { name: "mustChangePassword", type: "Boolean", isRequired: false, defaultValue: "true", description: "Forces password reset on onboarding" },
      { name: "termsAcceptedAt", type: "DateTime", isRequired: false, description: "Terms of service acceptance timestamp" },
      { name: "lastActiveAt", type: "DateTime", isRequired: false, description: "Last active session timestamp" },
      { name: "reviewCenterId", type: "String (ObjectID)", isRequired: false, description: "Multi-tenant foreign key linking to ReviewCenter" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "ReviewCenterProgram",
    category: "Review Center",
    description: "Training programs and intensive review cohorts offered by partner review centers.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Program identifier" },
      { name: "title", type: "String", isRequired: true, description: "Course title (e.g. Comprehensive MedTech Board Booster)" },
      { name: "description", type: "String", isRequired: false, description: "Course description and scope" },
      { name: "companyName", type: "String", isRequired: false, description: "Provider company name" },
      { name: "category", type: "String", isRequired: false, description: "Program discipline track" },
      { name: "reviewCenterId", type: "String (ObjectID)", isRequired: false, description: "Parent ReviewCenter foreign key" },
      { name: "startDate", type: "DateTime", isRequired: false, description: "Cohort kickoff date" },
      { name: "endDate", type: "DateTime", isRequired: false, description: "Course conclusion date" },
      { name: "status", type: "String", isRequired: true, defaultValue: '"ACTIVE"', description: "ACTIVE | ARCHIVED | UPCOMING" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "ReviewCenterSchoolYear",
    category: "Review Center",
    description: "Review center academic terms and candidate cohort cycles.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Review cycle identifier" },
      { name: "schoolYear", type: "String", isRequired: true, description: "Cycle label (e.g. 2026-2027)" },
      { name: "isCurrent", type: "Boolean", isRequired: true, defaultValue: "false", description: "Designates currently active cohort cycle" },
      { name: "status", type: "String", isRequired: true, defaultValue: '"ACTIVE"', description: "ACTIVE | CLOSED" },
      { name: "companyName", type: "String", isRequired: true, description: "Review center name" },
      { name: "reviewCenterId", type: "String (ObjectID)", isRequired: false, description: "Parent ReviewCenter foreign key" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "ReviewCenterCandidate",
    category: "Review Center",
    description: "Student examinees enrolled in a partner review center cohort with optional link to SWU PHINMA student accounts.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Candidate identifier" },
      { name: "reviewCenterId", type: "String (ObjectID)", isRequired: false, description: "Parent ReviewCenter foreign key" },
      { name: "companyName", type: "String", isRequired: true, description: "Review center company name" },
      { name: "name", type: "String", isRequired: true, description: "Full candidate name" },
      { name: "email", type: "String", isRequired: true, description: "Candidate institutional or contact email" },
      { name: "schoolId", type: "String", isRequired: false, description: "Institutional Student ID number" },
      { name: "schoolYear", type: "String", isRequired: true, defaultValue: '"2026-2027"', description: "Cohort year" },
      { name: "batch", type: "String", isRequired: true, defaultValue: '"Batch 1"', description: "Intake batch identifier" },
      { name: "status", type: "String", isRequired: true, defaultValue: '"ENROLLED"', description: "ENROLLED | COMPLETED | DROPPED" },
      { name: "studentId", type: "String (ObjectID)", isRequired: false, description: "Foreign key linking to core User student account" },
      { name: "enrolledAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Enrollment timestamp" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "ReviewCenterAssessment",
    category: "Review Center",
    description: "Mock board examination instance administered by an external partner review center.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Assessment unique identifier" },
      { name: "reviewCenterId", type: "String (ObjectID)", isRequired: false, description: "Multi-tenant tenant foreign key" },
      { name: "companyName", type: "String", isRequired: true, description: "Review center corporate name" },
      { name: "title", type: "String", isRequired: true, description: "Assessment title (e.g. Diagnostic Mock Board 1)" },
      { name: "customLabel", type: "String", isRequired: false, description: "Display sub-header or test code" },
      { name: "subject", type: "String", isRequired: true, description: "Normalized MedTech discipline name" },
      { name: "schoolYear", type: "String", isRequired: true, defaultValue: '"2026-2027"', description: "Academic year cohort" },
      { name: "batch", type: "String", isRequired: true, defaultValue: '"Batch 1"', description: "Cohort intake batch" },
      { name: "maxScore", type: "Float", isRequired: true, defaultValue: "100", description: "Total possible score" },
      { name: "passingScore", type: "Float", isRequired: true, defaultValue: "75", description: "Raw passing score cutoff" },
      { name: "passingRate", type: "Float", isRequired: true, defaultValue: "75", description: "Passing cutoff percentage" },
      { name: "assessmentDate", type: "DateTime", isRequired: false, description: "Date when the exam was administered" },
      { name: "isPublished", type: "Boolean", isRequired: true, defaultValue: "false", description: "True when scores are verified and visible to students" },
      { name: "meanScore", type: "Float", isRequired: false, description: "Calculated cohort arithmetic average" },
      { name: "medianScore", type: "Float", isRequired: false, description: "Calculated cohort 50th percentile score" },
      { name: "modeScore", type: "Float[]", isRequired: true, defaultValue: "[]", description: "Calculated most frequent scores" },
      { name: "highestScore", type: "Float", isRequired: false, description: "Cohort top score" },
      { name: "lowestScore", type: "Float", isRequired: false, description: "Cohort lowest recorded score" },
      { name: "passCount", type: "Int", isRequired: true, defaultValue: "0", description: "Total examinees passing cutoff" },
      { name: "failCount", type: "Int", isRequired: true, defaultValue: "0", description: "Total examinees failing cutoff" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last calculation timestamp" }
    ]
  },
  {
    name: "ReviewCenterScore",
    category: "Review Center",
    description: "Individual student candidate result for a specific mock board assessment.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Score entry identifier" },
      { name: "reviewCenterId", type: "String (ObjectID)", isRequired: false, description: "Parent ReviewCenter foreign key" },
      { name: "companyName", type: "String", isRequired: false, description: "Review center provider name" },
      { name: "assessmentId", type: "String (ObjectID)", isRequired: true, description: "Reference to parent ReviewCenterAssessment" },
      { name: "candidateId", type: "String (ObjectID)", isRequired: true, description: "Reference to enrolled ReviewCenterCandidate" },
      { name: "score", type: "Float", isRequired: false, description: "Raw numeric score earned" },
      { name: "percentage", type: "Float", isRequired: false, description: "Calculated percentage score" },
      { name: "percentile", type: "Float", isRequired: false, description: "Calculated cohort rank percentile" },
      { name: "status", type: "String", isRequired: true, defaultValue: '"PRESENT"', description: "PRESENT | ABSENT | EXCUSED | INCOMPLETE" },
      { name: "emailStatus", type: "String", isRequired: true, defaultValue: '"NOT_SENT"', description: "NOT_SENT | PENDING | SENT | FAILED" },
      { name: "emailSentAt", type: "DateTime", isRequired: false, description: "Timestamp when scorecard email was dispatched" },
      { name: "remarks", type: "String", isRequired: false, description: "Proctor observations or diagnostic notes" },
      { name: "recordedBy", type: "String", isRequired: false, description: "Representative user who recorded the score" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },

  // ================= STUDENT & LEARNING =================
  {
    name: "User",
    category: "Student & Learning",
    description: "Medical Technology student examinee account powering the mobile app, gamification arena, and diagnostic reports.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Student unique identifier" },
      { name: "email", type: "String", isRequired: true, isUnique: true, description: "Student university or personal email" },
      { name: "password", type: "String", isRequired: true, description: "Hashed authentication secret" },
      { name: "name", type: "String", isRequired: true, description: "Full student name" },
      { name: "firstName", type: "String", isRequired: false, description: "First name" },
      { name: "lastName", type: "String", isRequired: false, description: "Surname" },
      { name: "verified", type: "Boolean", isRequired: true, defaultValue: "false", description: "Email verification status" },
      { name: "level", type: "Int", isRequired: true, defaultValue: "1", description: "Gamification progression level (1 to 50)" },
      { name: "xp", type: "Int", isRequired: true, defaultValue: "0", description: "Cumulative experience points earned" },
      { name: "streak", type: "Int", isRequired: true, defaultValue: "0", description: "Consecutive daily active study streak count" },
      { name: "inventory", type: "String", isRequired: false, defaultValue: '"{}"', description: "Serialized JSON map of acquired virtual items" },
      { name: "equippedItem", type: "String", isRequired: false, defaultValue: '"none"', description: "Currently active avatar cosmetic / booster item" },
      { name: "location", type: "String", isRequired: false, defaultValue: '"Philippines"', description: "Campus location" },
      { name: "avatarUrl", type: "String", isRequired: false, description: "Student avatar picture URL" },
      { name: "lastContactedAt", type: "DateTime", isRequired: false, description: "Last faculty outreach timestamp" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Registration timestamp" }
    ]
  },
  {
    name: "SubjectMastery",
    category: "Student & Learning",
    description: "Live calculated mastery percentage and proficiency score for a student across each board subject.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Mastery entry identifier" },
      { name: "userId", type: "String (ObjectID)", isRequired: true, description: "Foreign key linking to student User" },
      { name: "subject", type: "String", isRequired: true, description: "Discipline name (Clinical Chemistry, Hematology, etc.)" },
      { name: "proficiency", type: "Int", isRequired: true, defaultValue: "0", description: "Mastery percentage score (0-100)" },
      { name: "minScore", type: "Int", isRequired: true, defaultValue: "0", description: "Lowest score baseline recorded" },
      { name: "status", type: "String", isRequired: true, defaultValue: '"In Training"', description: "Mastery badge ('Mastered' | 'Proficient' | 'In Training')" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Calculated upon each quiz completion" }
    ]
  },
  {
    name: "LessonCompletion",
    category: "Student & Learning",
    description: "Student progress tracking for individual instructional chapters and learning modules.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Completion record identifier" },
      { name: "userId", type: "String (ObjectID)", isRequired: true, description: "Student User ID" },
      { name: "subject", type: "String", isRequired: true, description: "Subject category (e.g. Clinical Chemistry)" },
      { name: "lessonId", type: "String", isRequired: true, description: "Unique lesson code or node ID (e.g. 'cc1')" },
      { name: "status", type: "String", isRequired: true, description: "completed | in-progress | not-started" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Started timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last activity timestamp" }
    ]
  },
  {
    name: "StudyPlan",
    category: "Student & Learning",
    description: "Personalized or faculty-guided study schedules with goal deadlines and target question quotas.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Study plan identifier" },
      { name: "userId", type: "String (ObjectID)", isRequired: true, description: "Student User ID" },
      { name: "subject", type: "String", isRequired: true, description: "Target subject discipline" },
      { name: "startDate", type: "DateTime", isRequired: false, defaultValue: "now()", description: "Plan start date" },
      { name: "endDate", type: "DateTime", isRequired: false, description: "Target completion milestone deadline" },
      { name: "priority", type: "String", isRequired: false, defaultValue: '"MEDIUM"', description: "LOW | MEDIUM | HIGH | URGENT" },
      { name: "goal", type: "String", isRequired: false, description: "Student self-stated learning goal" },
      { name: "targetQuestions", type: "Int", isRequired: false, defaultValue: "50", description: "Target drill questions to complete" },
      { name: "targetAccuracy", type: "Float", isRequired: false, defaultValue: "75", description: "Desired passing threshold percentage" },
      { name: "notes", type: "String", isRequired: false, description: "Faculty advice or student review notes" },
      { name: "status", type: "String", isRequired: false, defaultValue: '"IN_PROGRESS"', description: "IN_PROGRESS | COMPLETED | ABANDONED" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "Achievement",
    category: "Student & Learning",
    description: "Milestone events and awards unlocked through arena challenges and high-accuracy quiz streaks.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Achievement event identifier" },
      { name: "userId", type: "String (ObjectID)", isRequired: true, description: "Student User ID" },
      { name: "task", type: "String", isRequired: true, description: "Objective completed (e.g. Completed Chapter 1 Arena)" },
      { name: "type", type: "String", isRequired: true, description: "'quest' | 'exam'" },
      { name: "badge", type: "String", isRequired: false, description: "Associated badge code (e.g. 'gold', 'speed')" },
      { name: "xp", type: "Int", isRequired: true, description: "XP rewarded for this milestone" },
      { name: "confidenceLevel", type: "String", isRequired: false, description: "'Shaky' | 'Steady' | 'Unyielding'" },
      { name: "accuracy", type: "Float", isRequired: false, description: "Percentage accuracy attained (0-100)" },
      { name: "questMode", type: "String", isRequired: false, description: "'learning' | 'test'" },
      { name: "subject", type: "String", isRequired: false, description: "Subject discipline category" },
      { name: "timestamp", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Event timestamp" }
    ]
  },
  {
    name: "ExamResult",
    category: "Student & Learning",
    description: "Comprehensive mock exam score history for students.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Exam result identifier" },
      { name: "userId", type: "String (ObjectID)", isRequired: true, description: "Student User ID" },
      { name: "score", type: "Int", isRequired: true, description: "Raw points earned" },
      { name: "total", type: "Int", isRequired: true, description: "Total possible questions" },
      { name: "accuracy", type: "Float", isRequired: true, description: "Calculated percentage score" },
      { name: "subject", type: "String", isRequired: false, description: "Exam subject domain" },
      { name: "timestamp", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Submission timestamp" }
    ]
  },
  {
    name: "GuidanceAssignment",
    category: "Student & Learning",
    description: "Faculty mentoring intervention pairing an at-risk student with an assigned academic advisor.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Guidance case identifier" },
      { name: "studentId", type: "String (ObjectID)", isRequired: true, description: "Student User ID receiving intervention" },
      { name: "advisorId", type: "String (ObjectID)", isRequired: true, description: "Faculty AdminUser advisor assigned" },
      { name: "assignedById", type: "String (ObjectID)", isRequired: true, description: "Dean or Superadmin authorizing the referral" },
      { name: "status", type: "Enum: GuidanceStatus", isRequired: true, defaultValue: "PENDING", description: "PENDING | IN_PROGRESS | RESOLVED | CANCELLED" },
      { name: "subjectCategory", type: "String", isRequired: false, description: "Target subject where student is underperforming" },
      { name: "reason", type: "String", isRequired: true, description: "Trigger reason (e.g. low mock board score, anti-cheat strikes)" },
      { name: "guidanceNotes", type: "String", isRequired: false, defaultValue: '""', description: "Advisor consultation log and action plan" },
      { name: "resolutionNotes", type: "String", isRequired: false, defaultValue: '""', description: "Final outcome documentation upon case closure" },
      { name: "drillQuota", type: "Int", isRequired: false, defaultValue: "30", description: "Mandatory practice questions to complete" },
      { name: "targetAccuracy", type: "Float", isRequired: false, defaultValue: "75.0", description: "Required benchmark accuracy to resolve intervention" },
      { name: "deadline", type: "DateTime", isRequired: false, description: "Remediation target date" },
      { name: "lastOutreachAt", type: "DateTime", isRequired: false, description: "Timestamp of latest student communication" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Case opened timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last case update" }
    ]
  },
  {
    name: "OutreachLog",
    category: "Student & Learning",
    collectionName: "OutreachLogs",
    description: "Detailed communication logs between faculty advisors and students (emails, consultation invites, warning notices).",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Outreach log identifier" },
      { name: "studentId", type: "String (ObjectID)", isRequired: true, description: "Target student User ID" },
      { name: "advisorId", type: "String (ObjectID)", isRequired: true, description: "Sender faculty AdminUser ID" },
      { name: "guidanceId", type: "String (ObjectID)", isRequired: false, description: "Optional link to GuidanceAssignment" },
      { name: "channel", type: "String", isRequired: true, defaultValue: '"EMAIL"', description: "EMAIL | IN_APP | SYSTEM_ALERT" },
      { name: "subject", type: "String", isRequired: true, description: "Message subject headline" },
      { name: "message", type: "String", isRequired: true, description: "Communication message body" },
      { name: "templateType", type: "String", isRequired: false, description: "CHECKIN | REMEDIAL | CONSULTATION | COMMENDATION | CUSTOM" },
      { name: "focusSubject", type: "String", isRequired: false, description: "Relevant discipline focus area" },
      { name: "meetingLink", type: "String", isRequired: false, description: "Virtual meeting URL (Google Meet / Zoom)" },
      { name: "deliveryStatus", type: "String", isRequired: true, defaultValue: '"SENT"', description: "SENT | DELIVERED | FAILED" },
      { name: "readAt", type: "DateTime", isRequired: false, description: "Student read timestamp" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Dispatch timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last status update" }
    ]
  },
  {
    name: "QuestNodeCompletion",
    category: "Student & Learning",
    description: "Gamified learning path chapter map node progress records for students.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Node completion identifier" },
      { name: "userId", type: "String (ObjectID)", isRequired: true, description: "Student User ID" },
      { name: "subject", type: "String", isRequired: true, description: "Subject category (e.g. Clinical Chemistry)" },
      { name: "nodeId", type: "String", isRequired: true, description: "Chapter node code (e.g. 'cc-1')" },
      { name: "difficulty", type: "String", isRequired: true, description: "'EASY' | 'MEDIUM' | 'HARD'" },
      { name: "status", type: "String", isRequired: true, defaultValue: '"completed"', description: "Completion state" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Completion timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update" }
    ]
  },
  {
    name: "UserQuestionAttempt",
    category: "Student & Learning",
    description: "Item response psychometric tally of how many times a student has attempted a specific question.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Attempt tally identifier" },
      { name: "userId", type: "String (ObjectID)", isRequired: true, description: "Student User ID" },
      { name: "questionId", type: "String (ObjectID)", isRequired: true, description: "Question ID" },
      { name: "attempts", type: "Int", isRequired: true, defaultValue: "0", description: "Total number of times answered" },
      { name: "correct", type: "Int", isRequired: true, defaultValue: "0", description: "Total correct answers given" },
      { name: "lastAttempt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Most recent attempt timestamp" }
    ]
  },

  // ================= GAMIFICATION & INTEGRITY =================
  {
    name: "Badge",
    category: "Gamification & Integrity",
    description: "Defines collectible badges, unlock criteria, XP rewards, and cosmetic icons in the gamified arena.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Badge record identifier" },
      { name: "badgeId", type: "String", isRequired: true, isUnique: true, description: "Unique slug identifier (e.g. 'gold', 'speed', 'streak-7')" },
      { name: "title", type: "String", isRequired: true, description: "Honorary title bestowed (e.g. 'Master', 'Swift Solver')" },
      { name: "name", type: "String", isRequired: true, description: "Display name (e.g. 'Gold Quest Badge')" },
      { name: "description", type: "String", isRequired: true, description: "Detailed unlock requirement explanation" },
      { name: "category", type: "String", isRequired: true, defaultValue: '"QUEST"', description: "QUEST | STREAK | BOSS | SUBJECT | EXAM | SPEED | MASTERY" },
      { name: "tier", type: "String", isRequired: false, defaultValue: '"STANDARD"', description: "BRONZE | SILVER | GOLD | PLATINUM | DIAMOND" },
      { name: "icon", type: "String", isRequired: true, description: "Icon key ('trophy', 'flame', 'zap', 'shield', 'crown')" },
      { name: "spriteUrl", type: "String", isRequired: false, description: "High-resolution sprite image asset URL" },
      { name: "color", type: "String", isRequired: true, description: "Theme hex color code ('#FFD700', '#C0C0C0', '#CD7F32')" },
      { name: "unlockCondition", type: "String", isRequired: true, description: "Rule criteria (e.g. '100% accuracy in Quest Arena')" },
      { name: "xpReward", type: "Int", isRequired: true, defaultValue: "50", description: "Experience points awarded upon unlock" },
      { name: "confidenceFactor", type: "Float", isRequired: true, defaultValue: "1.0", description: "Weighting multiplier for confidence metrics" },
      { name: "isActive", type: "Boolean", isRequired: true, defaultValue: "true", description: "Whether badge is currently claimable" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "UserBadge",
    category: "Gamification & Integrity",
    description: "Instance of a badge unlocked by an individual student examinee.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Unlocked badge instance identifier" },
      { name: "userId", type: "String (ObjectID)", isRequired: true, description: "Student User ID who unlocked the badge" },
      { name: "badgeId", type: "String (ObjectID)", isRequired: false, description: "Reference to Badge template" },
      { name: "badgeSlug", type: "String", isRequired: true, description: "Badge slug string matching Badge.badgeId" },
      { name: "subject", type: "String", isRequired: false, description: "Discipline context in which it was earned" },
      { name: "questMode", type: "String", isRequired: false, description: "'learning' | 'test' | 'boss'" },
      { name: "accuracy", type: "Float", isRequired: false, description: "Accuracy percentage achieved during unlock" },
      { name: "confidenceLevel", type: "String", isRequired: false, description: "'Shaky' | 'Steady' | 'Unyielding'" },
      { name: "xpEarned", type: "Int", isRequired: true, defaultValue: "0", description: "XP claimed from unlock" },
      { name: "unlockedAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Unlock timestamp" }
    ]
  },
  {
    name: "GameConfig",
    category: "Gamification & Integrity",
    description: "Global balancing parameters for experience gain, streak bonuses, and level caps.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Configuration identifier" },
      { name: "key", type: "String", isRequired: true, isUnique: true, defaultValue: '"default"', description: "Config preset key" },
      { name: "baseXP", type: "Int", isRequired: true, defaultValue: "10", description: "Base XP awarded per correct answer" },
      { name: "xpMultiplier", type: "Float", isRequired: true, defaultValue: "1.5", description: "Multiplier applied on hard or HOTS items" },
      { name: "streakBonusPercentage", type: "Int", isRequired: true, defaultValue: "10", description: "Percentage boost per day of active streak" },
      { name: "accuracyThreshold", type: "Int", isRequired: true, defaultValue: "70", description: "Minimum accuracy percentage for bonus XP" },
      { name: "levelUpXpBase", type: "Int", isRequired: true, defaultValue: "100", description: "Base XP required for level 2 transition" },
      { name: "maxLevelCap", type: "Int", isRequired: true, defaultValue: "50", description: "Ceiling level attainable" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last modified timestamp" }
    ]
  },
  {
    name: "RankTier",
    category: "Gamification & Integrity",
    description: "Hierarchical player rank divisions (Novice, Aspirant, Adept, Scholar, Vanguard, Paragon).",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Rank tier identifier" },
      { name: "rankId", type: "String", isRequired: true, isUnique: true, description: "Unique rank identifier code" },
      { name: "title", type: "String", isRequired: true, description: "Rank division title (e.g. Senior Aspirant)" },
      { name: "name", type: "String", isRequired: true, description: "Display name" },
      { name: "description", type: "String", isRequired: true, defaultValue: '""', description: "Lore and qualification requirements" },
      { name: "minLevel", type: "Int", isRequired: true, defaultValue: "1", description: "Minimum level required to achieve this rank" },
      { name: "maxLevel", type: "Int", isRequired: false, description: "Upper level boundary for tier" },
      { name: "minXp", type: "Int", isRequired: true, defaultValue: "0", description: "Minimum cumulative XP needed" },
      { name: "icon", type: "String", isRequired: true, defaultValue: '"Award"', description: "Lucide icon or crest name" },
      { name: "color", type: "String", isRequired: true, defaultValue: '"#3B82F6"', description: "Badge hex color" },
      { name: "spriteUrl", type: "String", isRequired: false, description: "Rank insignia sprite URL" },
      { name: "perks", type: "String[]", isRequired: true, defaultValue: "[]", description: "Unlocked platform privileges and cosmetics" },
      { name: "isActive", type: "Boolean", isRequired: true, defaultValue: "true", description: "Tier active status" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "StudentWarningIncident",
    category: "Gamification & Integrity",
    collectionName: "StudentWarningIncidents",
    description: "Proctoring anomaly and anti-cheat event log (fullscreen exits, tab switches, screenshot captures, clipboard copy).",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Incident event identifier" },
      { name: "userId", type: "String", isRequired: false, description: "Student User ID flagged" },
      { name: "userName", type: "String", isRequired: true, description: "Student examinee name" },
      { name: "userEmail", type: "String", isRequired: true, description: "Student email" },
      { name: "subject", type: "String", isRequired: true, description: "Discipline exam being taken" },
      { name: "nodeId", type: "String", isRequired: true, description: "Node or quiz session code" },
      { name: "quizMode", type: "String", isRequired: true, defaultValue: '"quest"', description: "Arena mode (quest | mock_board | timed_exam)" },
      { name: "incidentType", type: "String", isRequired: true, description: "FULLSCREEN_EXIT | SCREENSHOT_ATTEMPT | TAB_SWITCH | COPY_ATTEMPT" },
      { name: "strikeCount", type: "Int", isRequired: true, defaultValue: "1", description: "Strike increment count for this occurrence" },
      { name: "details", type: "String", isRequired: true, defaultValue: '""', description: "Browser window state or clipboard event details" },
      { name: "weekKey", type: "String", isRequired: false, description: "ISO week identifier (e.g. '2026-W41')" },
      { name: "timestamp", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Precise instant violation occurred" },
      { name: "createdAt", type: "DateTime", isRequired: true, defaultValue: "now()", description: "Creation timestamp" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last update timestamp" }
    ]
  },
  {
    name: "StudentWarningSummary",
    category: "Gamification & Integrity",
    collectionName: "StudentWarningSummaries",
    description: "Aggregated proctoring risk scorecard tracking weekly rolling strikes and lifetime anti-cheat metrics per student.",
    fields: [
      { name: "id", type: "String (ObjectID)", isRequired: true, isId: true, description: "Scorecard identifier" },
      { name: "userId", type: "String", isRequired: true, isUnique: true, description: "Student User ID" },
      { name: "userName", type: "String", isRequired: true, description: "Student examinee name" },
      { name: "userEmail", type: "String", isRequired: true, description: "Student email" },
      { name: "currentWeekKey", type: "String", isRequired: true, defaultValue: '""', description: "Current tracking week (e.g. '2026-W41')" },
      { name: "weekStartDate", type: "DateTime", isRequired: false, description: "Monday start date of current tracking week" },
      { name: "weeklyWarnings", type: "Int", isRequired: true, defaultValue: "0", description: "Active strikes incurred in current week" },
      { name: "weeklyFullscreenExits", type: "Int", isRequired: true, defaultValue: "0", description: "Current week fullscreen escape attempts" },
      { name: "weeklyScreenshots", type: "Int", isRequired: true, defaultValue: "0", description: "Current week screenshot key triggers" },
      { name: "weeklyTabSwitches", type: "Int", isRequired: true, defaultValue: "0", description: "Current week browser tab unfocus count" },
      { name: "weeklyCopyAttempts", type: "Int", isRequired: true, defaultValue: "0", description: "Current week clipboard copy attempts" },
      { name: "weeklyRiskLevel", type: "String", isRequired: true, defaultValue: '"LOW"', description: "'LOW' (0-2) | 'MEDIUM' (3-4) | 'HIGH' (5+)" },
      { name: "allTimeWarnings", type: "Int", isRequired: true, defaultValue: "0", description: "Cumulative lifetime strikes across all terms" },
      { name: "totalWarnings", type: "Int", isRequired: true, defaultValue: "0", description: "Legacy alias for allTimeWarnings" },
      { name: "fullscreenExits", type: "Int", isRequired: true, defaultValue: "0", description: "Lifetime fullscreen exits" },
      { name: "screenshots", type: "Int", isRequired: true, defaultValue: "0", description: "Lifetime screenshot attempts" },
      { name: "tabSwitches", type: "Int", isRequired: true, defaultValue: "0", description: "Lifetime tab switches" },
      { name: "copyAttempts", type: "Int", isRequired: true, defaultValue: "0", description: "Lifetime copy attempts" },
      { name: "riskLevel", type: "String", isRequired: true, defaultValue: '"LOW"', description: "Overall all-time risk status ('LOW' | 'MEDIUM' | 'HIGH')" },
      { name: "lastIncidentType", type: "String", isRequired: false, description: "Most recent infraction classification" },
      { name: "lastIncidentAt", type: "DateTime", isRequired: false, description: "Timestamp of latest infraction" },
      { name: "subjectsAffected", type: "String[]", isRequired: true, defaultValue: "[]", description: "Array of subject disciplines where violations occurred" },
      { name: "updatedAt", type: "DateTime", isRequired: true, description: "Last recalculation timestamp" }
    ]
  }
];
