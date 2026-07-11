# 01 — Database Schema (SQL Server)

> **Faza implementare**: Faza 0 — Setup DB
> **Dependențe**: EF Core 9, SQL Server

---

## Schema completă

```sql
-- ═══ Users & Auth ═══
CREATE TABLE Users (
    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email           NVARCHAR(256) NOT NULL,
    NormalizedEmail NVARCHAR(256) NOT NULL,
    GoogleId        NVARCHAR(128) NULL,
    DisplayName     NVARCHAR(100) NOT NULL,
    AvatarUrl       NVARCHAR(512) NULL,
    Role            TINYINT NOT NULL DEFAULT 1,  -- 1=Student, 2=Teacher, 3=Admin
    XP              INT NOT NULL DEFAULT 0,
    StreakDays      INT NOT NULL DEFAULT 0,
    StripeCustomerId NVARCHAR(100) NULL,
    SubscriptionTier TINYINT NOT NULL DEFAULT 0, -- 0=Free, 1=Basic, 2=Premium
    LastLoginAt     DATETIME2 NULL,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsActive        BIT NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IX_Users_Email ON Users(NormalizedEmail);
CREATE UNIQUE INDEX IX_Users_GoogleId ON Users(GoogleId) WHERE GoogleId IS NOT NULL;

-- ═══ Chapters ═══
CREATE TABLE Chapters (
    Id              INT PRIMARY KEY IDENTITY,
    Slug            NVARCHAR(100) NOT NULL UNIQUE,
    Title           NVARCHAR(200) NOT NULL,
    Subtitle        NVARCHAR(500) NULL,
    Icon            NVARCHAR(10) NULL,
    OrderIndex      INT NOT NULL,
    ContentJson     NVARCHAR(MAX) NOT NULL,      -- JSON cu slides
    Tags            NVARCHAR(500) NULL,
    EstimatedMin    INT NOT NULL DEFAULT 30,
    IsPublished     BIT NOT NULL DEFAULT 1
);

-- ═══ Exercises ═══
CREATE TABLE Exercises (
    Id              INT PRIMARY KEY IDENTITY,
    ChapterId       INT NOT NULL REFERENCES Chapters(Id),
    Type            TINYINT NOT NULL,            -- 1=MultipleChoice, 2=CodeSubmit, 3=FreeText
    Question        NVARCHAR(MAX) NOT NULL,
    OptionsJson     NVARCHAR(MAX) NULL,
    CorrectAnswer   NVARCHAR(500) NOT NULL,
    Explanation     NVARCHAR(MAX) NULL,
    Difficulty      TINYINT NOT NULL DEFAULT 1,
    CppTestCode     NVARCHAR(MAX) NULL,
    ExpectedOutput  NVARCHAR(MAX) NULL,
    TimeLimitMs     INT NOT NULL DEFAULT 1000,
    MemoryLimitKb   INT NOT NULL DEFAULT 65536,
    TimesAttempted  INT NOT NULL DEFAULT 0,      -- denormalizat pt performanță
    TimesSolved     INT NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsPublished     BIT NOT NULL DEFAULT 1
);

-- ═══ User Progress ═══
CREATE TABLE UserProgress (
    UserId          UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
    ChapterId       INT NOT NULL REFERENCES Chapters(Id),
    ProgressPercent TINYINT NOT NULL DEFAULT 0,
    CompletedAt     DATETIME2 NULL,
    QuizBestScore   INT NULL,
    TimeSpentMin    INT NOT NULL DEFAULT 0,
    LastVisitedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_UserProgress PRIMARY KEY (UserId, ChapterId)
);

-- ═══ Quiz Attempts ═══
CREATE TABLE QuizAttempts (
    Id              BIGINT PRIMARY KEY IDENTITY,
    UserId          UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
    ExerciseId      INT NOT NULL REFERENCES Exercises(Id),
    UserAnswer      NVARCHAR(MAX) NOT NULL,
    IsCorrect       BIT NOT NULL,
    AttemptedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- ═══ Code Submissions ═══
CREATE TABLE Submissions (
    Id              BIGINT PRIMARY KEY IDENTITY,
    UserId          UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
    ExerciseId      INT NOT NULL REFERENCES Exercises(Id),
    SourceCode      VARBINARY(MAX) NOT NULL,     -- ENCRYPTED cu AES-256
    CompilerOutput  NVARCHAR(MAX) NULL,
    TestResultsJson NVARCHAR(MAX) NULL,
    PassedAllTests  BIT NOT NULL,
    ExecutionTimeMs INT NULL,
    MemoryUsedKb    INT NULL,
    SubmittedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- ═══ Audit Trail ═══
CREATE TABLE AuditLogs (
    Id              BIGINT PRIMARY KEY IDENTITY,
    UserId          UNIQUEIDENTIFIER NULL REFERENCES Users(Id),
    Action          NVARCHAR(50) NOT NULL,        -- 'Login','ViewChapter','SubmitAnswer','SendMessage'
    EntityType      NVARCHAR(100) NULL,
    EntityId        NVARCHAR(100) NULL,
    MetadataJson    NVARCHAR(MAX) NULL,           -- IP, UserAgent, detalii
    Timestamp       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- ═══ Mesagerie ═══
CREATE TABLE Conversations (
    Id              BIGINT PRIMARY KEY IDENTITY,
    Subject         NVARCHAR(200) NULL,
    StartedBy       UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
    StartedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    LastMessageAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE ConversationParticipants (
    ConversationId  BIGINT NOT NULL REFERENCES Conversations(Id) ON DELETE CASCADE,
    UserId          UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
    LastReadAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsArchived      BIT NOT NULL DEFAULT 0,
    CONSTRAINT PK_ConvParticipants PRIMARY KEY (ConversationId, UserId)
);

CREATE TABLE Messages (
    Id              BIGINT PRIMARY KEY IDENTITY,
    ConversationId  BIGINT NOT NULL REFERENCES Conversations(Id) ON DELETE CASCADE,
    SenderId        UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
    Body            NVARCHAR(4000) NOT NULL,
    SentAt          DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsEdited        BIT NOT NULL DEFAULT 0,
    EditedAt        DATETIME2 NULL
);

-- ═══ Stripe ═══
CREATE TABLE Subscriptions (
    Id                  BIGINT PRIMARY KEY IDENTITY,
    UserId              UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
    StripeSubscriptionId NVARCHAR(100) NOT NULL,
    Tier                TINYINT NOT NULL,       -- 0=Free, 1=Basic, 2=Premium
    Status              TINYINT NOT NULL,       -- 0=Active, 1=Canceled, 2=PastDue
    CurrentPeriodEnd    DATETIME2 NOT NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Payments (
    Id                      BIGINT PRIMARY KEY IDENTITY,
    UserId                  UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
    StripePaymentIntentId   NVARCHAR(100) NOT NULL,
    Amount                  DECIMAL(10,2) NOT NULL,
    Currency                NVARCHAR(3) NOT NULL DEFAULT 'RON',
    Status                  TINYINT NOT NULL,   -- 0=Paid, 1=Failed, 2=Refunded
    PaidAt                  DATETIME2 NULL
);

-- ═══ Indecși de performanță ═══
CREATE INDEX IX_AuditLogs_Timestamp ON AuditLogs(Timestamp DESC);
CREATE INDEX IX_AuditLogs_UserId_Action ON AuditLogs(UserId, Action);

CREATE INDEX IX_QuizAttempts_UserId_ExerciseId ON QuizAttempts(UserId, ExerciseId)
    INCLUDE (IsCorrect, AttemptedAt);

CREATE INDEX IX_UserProgress_UserId ON UserProgress(UserId)
    INCLUDE (ChapterId, ProgressPercent, CompletedAt);
CREATE INDEX IX_UserProgress_ChapterId ON UserProgress(ChapterId, ProgressPercent DESC);

CREATE INDEX IX_Messages_ConversationId ON Messages(ConversationId, SentAt DESC);

CREATE INDEX IX_ConversationParticipants_UserId ON ConversationParticipants(UserId, LastReadAt DESC)
    INCLUDE (ConversationId, IsArchived);

CREATE INDEX IX_Exercises_ChapterId_Difficulty ON Exercises(ChapterId, Difficulty)
    INCLUDE (Type, Question, TimesAttempted);

CREATE INDEX IX_Submissions_UserId_ExerciseId ON Submissions(UserId, ExerciseId)
    INCLUDE (PassedAllTests, SubmittedAt);
```

---

## Enum-uri (valori TINYINT)

| Coloană | 0 | 1 | 2 | 3 |
|---------|---|---|---|---|
| `Users.Role` | — | Student | Teacher | Admin |
| `Users.SubscriptionTier` | Free | Basic | Premium | — |
| `Exercises.Type` | — | MultipleChoice | CodeSubmit | FreeText |
| `Exercises.Difficulty` | — | Ușor | Mediu | Dificil |
| `Subscriptions.Status` | Active | Canceled | PastDue | — |
| `Payments.Status` | Paid | Failed | Refunded | — |

---

## Relații cheie

```
Users 1──N UserProgress
Users 1──N QuizAttempts
Users 1──N Submissions
Users 1──N AuditLogs
Users 1──N Conversations (started)
Users 1──N Messages (sent)
Users 1──N Subscriptions
Users 1──N Payments

Chapters 1──N Exercises
Chapters 1──N UserProgress

Exercises 1──N QuizAttempts
Exercises 1──N Submissions

Conversations 1──N Messages
Conversations 1──N ConversationParticipants

Subscriptions 1──N Payments
```

---

## 🔗 Documente conexe

- [02-database-performance.md](./02-database-performance.md) — EF Core: pooling, query patterns, caching
- [11-efcore-best-practices.md](./11-efcore-best-practices.md) — Fluent API, migrații, seed data
- [09-diagrams.md](./09-diagrams.md) — Database ERD (diagrama PlantUML)
