# 09 — Diagrame PlantUML

> **Referință vizuală** — poate fi consultată oricând în timpul implementării.
> Diagramele sunt în format PlantUML. Le poți vizualiza cu extensia PlantUML din VS Code,
> sau pe https://www.plantuml.com/plantuml/uml/

---

## 12.1. Arhitectura Generală a Sistemului

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE
skinparam componentStyle rectangle

title InfoLiceu v3 — Arhitectura Sistemului

' ===== Users =====
actor "Elev" as Student
actor "Profesor" as Teacher
actor "Admin" as Admin

' ===== External =====
cloud "Google\nOAuth 2.0" as Google
cloud "Stripe\nPayments" as Stripe
cloud "Azure\nBlob Storage" as Blob
cloud "Docker\nC++ Sandbox" as Docker

' ===== Frontend =====
package "InfoLiceu.Web (Razor Pages + HTMX)" {
    [Pages/Chapters] as ChaptersUI
    [Pages/Exercises] as ExercisesUI
    [Pages/Messages] as MessagesUI
    [Pages/Admin] as AdminUI
    [ViewComponents\n(Demo-uri)] as Demos
    [SignalR Client] as SigClient
}

' ===== Backend =====
package "ASP.NET Core 9" {
    [Controllers/\nPageModels] as Controllers
    [SignalR Hubs\n(Message/Progress)] as Hubs
    [Middleware\n(Audit/Auth/Error)] as Middleware
}

' ===== Services =====
package "Service Layer" {
    [ChapterService] as ChSvc
    [ExerciseService] as ExSvc
    [QuizService] as QzSvc
    [MessageService] as MsgSvc
    [AuditService] as AudSvc
    [EncryptionService] as EncSvc
    [CppTestRunner] as CppTest
    [StripeService] as StrSvc
}

' ===== Data =====
database "SQL Server\n(EF Core)" as SQL
database "Redis\nCache" as Redis
database "Azure Key\nVault" as KV

' ===== Connections =====
Student --> ChaptersUI
Student --> ExercisesUI
Student --> MessagesUI
Teacher --> AdminUI
Admin --> AdminUI

ChaptersUI --> Controllers
ExercisesUI --> Controllers
MessagesUI --> Hubs
AdminUI --> Controllers

Controllers --> ChSvc
Controllers --> ExSvc
Controllers --> QzSvc
Controllers --> StrSvc
Hubs --> MsgSvc

ChSvc --> SQL
ExSvc --> SQL
ExSvc --> Redis
QzSvc --> SQL
MsgSvc --> SQL
AudSvc --> SQL
StrSvc --> Stripe
EncSvc --> KV
CppTest --> Docker

Google --> Controllers : OAuth callback
Blob --> ExSvc : PDF upload
SigClient --> Hubs : WebSocket

Middleware --> AudSvc : log every request
@enduml
```

---

## 12.2. Database ERD (Entity-Relationship Diagram)

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE
skinparam linetype ortho

title InfoLiceu v3 — Database Schema

entity "Users" as users {
    * Id : UUID <<PK>>
    --
    Email : string (unique)
    GoogleId : string (nullable)
    DisplayName : string
    Role : enum (Student/Teacher/Admin)
    XP : int
    StreakDays : int
    StripeCustomerId : string
    SubscriptionTier : enum (Free/Basic/Premium)
    LastLoginAt : datetime
    CreatedAt : datetime
}

entity "Chapters" as chapters {
    * Id : int <<PK>>
    --
    Slug : string (unique)
    Title : string
    ContentJson : string
    OrderIndex : int
    EstimatedMin : int
    IsPublished : bool
}

entity "Exercises" as exercises {
    * Id : int <<PK>>
    --
    * ChapterId : int <<FK>>
    Type : enum (MC/CodeSubmit/FreeText)
    Question : string
    Difficulty : enum
    CppTestCode : string
    TimesAttempted : int
    TimesSolved : int
}

entity "UserProgress" as progress {
    * UserId : UUID <<PK,FK>>
    * ChapterId : int <<PK,FK>>
    --
    ProgressPercent : int
    CompletedAt : datetime
    QuizBestScore : int
}

entity "QuizAttempts" as attempts {
    * Id : bigint <<PK>>
    --
    * UserId : UUID <<FK>>
    * ExerciseId : int <<FK>>
    UserAnswer : string
    IsCorrect : bool
    AttemptedAt : datetime
}

entity "Submissions" as submissions {
    * Id : bigint <<PK>>
    --
    * UserId : UUID <<FK>>
    * ExerciseId : int <<FK>>
    SourceCode : varbinary (encrypted)
    PassedAllTests : bool
    ExecutionTimeMs : int
}

entity "AuditLogs" as audit {
    * Id : bigint <<PK>>
    --
    UserId : UUID (FK)
    Action : string
    EntityType : string
    MetadataJson : string
    Timestamp : datetime
}

entity "Conversations" as conversations {
    * Id : bigint <<PK>>
    --
    StartedBy : UUID <<FK>>
    Subject : string
    LastMessageAt : datetime
}

entity "Messages" as messages {
    * Id : bigint <<PK>>
    --
    * ConversationId : bigint <<FK>>
    * SenderId : UUID <<FK>>
    Body : string
    SentAt : datetime
}

entity "Subscriptions" as subs {
    * Id : bigint <<PK>>
    --
    * UserId : UUID <<FK>>
    StripeSubscriptionId : string
    Tier : enum
    Status : enum (Active/Canceled/PastDue)
    CurrentPeriodEnd : datetime
    CreatedAt : datetime
}

entity "Payments" as payments {
    * Id : bigint <<PK>>
    --
    * UserId : UUID <<FK>>
    StripePaymentIntentId : string
    Amount : decimal
    Currency : string
    Status : enum
    PaidAt : datetime
}

users ||--o{ progress
users ||--o{ attempts
users ||--o{ submissions
users ||--o{ audit
users ||--o{ conversations : started
users ||--o{ messages : sent
users ||--o{ subs
users ||--o{ payments

chapters ||--o{ exercises
chapters ||--o{ progress

exercises ||--o{ attempts
exercises ||--o{ submissions

conversations ||--o{ messages

subs ||--o{ payments

@enduml
```

---

## 12.3. Flow Autentificare (Google OAuth)

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

title InfoLiceu — Google OAuth 2.0 Flow

actor "Utilizator" as U
participant "Browser\n(Razor Page)" as B
participant "InfoLiceu.Web\n(ASP.NET Core)" as S
participant "Google\nOAuth Server" as G
database "SQL Server\n(Users)" as DB

U -> B : Click "Conectează-te cu Google"
B -> S : GET /Auth/Login?handler=GoogleLogin
S -> G : Redirect cu client_id + redirect_uri + scope
G -> U : "InfoLiceu vrea acces la\nnume, email, avatar"
U -> G : Aprobă
G -> S : GET /Auth/ExternalLogin?code=xxx
S -> G : POST /token (exchange code)
G -> S : access_token + id_token
S -> S : Validează JWT signature
S -> S : Extrage claims: sub, email, name, picture

S -> DB : Caută user după GoogleId
alt User nou (nu există)
    S -> DB : INSERT Users (GoogleId, Email, DisplayName, Role=Student)
    S -> Stripe : Creează StripeCustomer
    S -> DB : UPDATE Users SET StripeCustomerId
else User existent
    S -> DB : UPDATE LastLoginAt
end

S -> S : Generează JWT (sub, email, role, name)
S -> S : Setează cookie .AspNetCore.Identity
S -> B : Redirect către pagina de profil
B -> U : "Bine ai venit, [Nume]!"
@enduml
```

---

## 12.4. Flow Mesagerie (SignalR)

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

title InfoLiceu — Mesagerie Real-time

actor "Elev" as E
actor "Profesor" as P
participant "Browser Elev\n(Razor + SignalR)" as BE
participant "Browser Prof.\n(Razor + SignalR)" as BP
participant "MessageHub\n(SignalR)" as Hub
participant "MessageService" as Svc
database "SQL Server" as DB

== Elevul trimite mesaj ==
E -> BE : Scrie mesaj, apasă Send
BE -> Hub : SendMessage(convId, body)

Hub -> Svc : SendAsync(convId, senderId, body)
Svc -> DB : INSERT Messages
Svc -> DB : UPDATE Conversations SET LastMessageAt
Svc --> Hub : message saved

Hub -> BP : SendAsync("NewMessage", {id, senderName, body, sentAt})
BP -> P : Toast: "Mesaj nou de la [Elev]"
BP -> BP : Badge pe iconița de mesaje +1

Hub --> BE : OK (mesaj trimis)
BE -> E : Mesajul apare în conversație

== Profesorul deschide conversația ==
P -> BP : Click pe conversație
BP -> Svc : GET /Messages/Conversation?id=5
Svc -> DB : SELECT Messages WHERE ConvId=5
Svc -> DB : UPDATE ConversationParticipants SET LastReadAt
Svc --> BP : Lista de mesaje (marcate citite)
BP -> P : Conversația cu badge eliminat

== Elevul vede că mesajul a fost citit ==
Hub -> BE : SendAsync("MessageRead", {convId, readBy})
BE -> E : "✓ Văzut la 14:32"
@enduml
```

---

## 12.5. Flow Plată Stripe (Subscription)

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

title InfoLiceu — Stripe Subscription Flow

actor "Elev" as U
participant "Browser" as B
participant "InfoLiceu.Web" as S
participant "StripeService" as StrSvc
participant "Stripe\nAPI" as Stripe
database "SQL Server" as DB
participant "Stripe\nWebhook" as WH

== Creare checkout ==
U -> B : Click "Upgrade la Premium"
B -> S : POST /Billing/Checkout?tier=Premium
S -> StrSvc : CreateCheckoutSession(userId, tier)
StrSvc -> Stripe : POST /checkout/sessions\n(price_id, customer_id, success_url)
Stripe --> StrSvc : session.url
StrSvc --> S : checkout_url

S -> B : Redirect la Stripe Checkout
B -> Stripe : Pagina de plată Stripe
U -> Stripe : Completează cardul, confirmă

== Plată reușită ==
Stripe -> S : POST /api/webhooks/stripe\n(event: checkout.session.completed)
S -> S : Verifică Stripe-Signature (webhook secret)
S -> StrSvc : ProcessCompletedCheckout(session)

StrSvc -> DB : INSERT Subscriptions\n(userId, stripeSubId, tier, status=Active)
StrSvc -> DB : INSERT Payments\n(userId, paymentIntentId, amount, status=Paid)
StrSvc -> DB : UPDATE Users SET SubscriptionTier = Premium

S --> Stripe : 200 OK

== Notificare utilizator ==
S -> B : SignalR: "SubscriptionActivated"
B -> U : "🎉 Cont Premium activat!\nAcces la toate capitolele și analiza BAC AI"

== Webhook-uri recurente ==
Stripe -> WH : invoice.paid (lunar)
WH -> StrSvc : ProcessInvoicePaid(invoice)
StrSvc -> DB : INSERT Payments (plată recurentă)
StrSvc -> DB : UPDATE Subscriptions SET CurrentPeriodEnd

Stripe -> WH : customer.subscription.deleted
WH -> StrSvc : ProcessSubscriptionCanceled
StrSvc -> DB : UPDATE Subscriptions SET Status = Canceled
StrSvc -> DB : UPDATE Users SET SubscriptionTier = Free
@enduml
```

---

## 12.6. Flow Execuție C++ (Docker Sandbox)

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

title InfoLiceu — C++ Code Testing Pipeline

actor "Elev" as U
participant "Monaco Editor\n(Razor Page)" as Editor
participant "ExerciseService" as Svc
participant "CppTestRunner" as Runner
participant "Docker\nSandbox" as Docker
database "SQL Server" as DB

U -> Editor : Scrie cod C++, apasă "Testează"
Editor -> Svc : SubmitCode(exerciseId, sourceCode)

Svc -> DB : Caută exercițiul (CppTestCode, ExpectedOutput)
Svc -> Runner : RunTestsAsync(sourceCode, testCode, timeLimit, memLimit)

Runner -> Runner : Criptează codul sursă (AES-256)
Runner -> DB : INSERT Submissions (SourceCode criptat)

Runner -> Docker : docker run --rm --network=none\n--memory=64m --cpus=0.5\n-v /tmp/xyz:/work sandbox:latest\n/bin/sh -c "g++ sol.cpp -o sol && ./sol"

Docker -> Docker : Compilează cu g++
alt Eroare compilare
    Docker --> Runner : stderr: "error: expected ';'..."
    Runner --> Svc : CompilationFailed(errors)
else Compilare OK
    Docker -> Docker : Rulează ./sol cu input
    alt Timeout (>1s)
        Docker -> Docker : SIGKILL (timeout)
        Docker --> Runner : TimedOut
        Runner --> Svc : Timeout(1000ms)
    else Memory exceeded
        Docker --> Runner : OutOfMemory
        Runner --> Svc : OutOfMemory(64MB)
    else Succes
        Docker --> Runner : stdout: "42"
        Runner -> Runner : Compară stdout cu expected
        Runner --> Svc : Passed / WrongOutput
    end
end

Svc -> DB : UPDATE Submissions SET\n(CompilerOutput, PassedAllTests,\nExecutionTime, MemoryUsed)

Svc --> Editor : TestResult { Passed, Output, Time, Memory }
Editor -> U : ✅ Toate testele trecute! (sau ❌ cu eroarea)

@enduml
```

---

## 🔗 Documente conexe

- [00-overview.md](./00-overview.md) — Arhitectura generală (text)
- [01-database-schema.md](./01-database-schema.md) — Schema SQL (text)
- [03-messaging.md](./03-messaging.md) — Mesagerie SignalR
- [04-authentication.md](./04-authentication.md) — Google OAuth
- [06-cpp-testing.md](./06-cpp-testing.md) — C++ Docker sandbox
- [10-stripe-integration.md](./10-stripe-integration.md) — Stripe
