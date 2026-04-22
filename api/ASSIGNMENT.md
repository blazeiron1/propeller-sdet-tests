# 🚀 Propeller Junior SDET Assignment

Our company has developed a headless GraphQL API to serve product data to web and mobile applications. As a Junior
Software Engineer In Test, your job goes beyond writing tests — when you find a bug, you fix it.

This assignment tests that dual responsibility. You'll receive a small NestJS GraphQL service that has **intentional
bugs** planted in the codebase. Your job is to write automated tests, discover the bugs through those tests, and then
fix them directly in the source code.

Feel free to use AI assistants (Claude Code, Cursor, etc.) throughout. In fact, we **expect** you to. But every line of
code must be reviewed, validated, and understood by you — we will ask you to explain your decisions.

---

## Setup

1. Clone this repository
2. Run the service locally:

```bash
docker-compose up --build
```

3. In a separate terminal, seed the database:

```bash
docker-compose run --rm seed
```

4. The GraphQL playground will be available at **http://localhost:3000/graphql**
5. All requests require an `x-tenant-id` header (e.g. `tenant-a` or `tenant-b`)

Refer to the project `README.md` for the full data model documentation, available queries/mutations, and tech stack
details.

---

## Task 1: Automated API Testing

Create a separate project with automated test cases to verify the functionality of the GraphQL API running locally (to
be clear, the API and test project should be 2 separate applications)

Use any JS/TS testing framework you're comfortable with (Jest/Supertest, Playwright, Cypress — not Postman, we want to
see coding).

### What to test

Write tests covering **queries**, **mutations**, and **error handling** for **Products** and **Images**, including:

- CRUD operations for both models
- Filtering and pagination on product queries
- Relationships between products and images
- Multi-tenant data isolation (a tenant should only see their own data)
- Input validation and edge cases
- Error handling for invalid operations

### What we're looking for

- Clean, well-structured test code — treat it like production code
- Meaningful test case selection (not just happy paths)
- Proper assertions and error handling
- Clear naming conventions

Push your tests to a separate repository and include a link to it in your submission.

---

## Bonus Subtask: CI/CD Pipeline

Set up a CI/CD pipeline that runs your tests automatically.

1. Create a pipeline with at least:
    - **Build** — install dependencies and compile
    - **Test** — run your automated tests (spin up the service with Docker if needed)
2. Configure it to run on every commit

---

## Task 2: Find the Bug, Fix the Bug

This API has several **intentional bugs** hidden across the codebase. Your tests from Task 1 should expose them.

### Your job

1. **Identify bugs** — some will be obvious through test failures, others require careful exploration
2. **Fix the bugs** directly in the backend source code
3. **Submit your fixes** as commits with clear messages explaining what was broken and why your fix is correct

### What we're looking for

- Ability to trace a failing test to its root cause in the code
- Clean, minimal fixes (don't rewrite the whole service)
- Commit hygiene — each fix should be a separate, well-described commit
- Tests that prove the bug existed and is now resolved
-

Create a pull request to this repository with your fixes.

---

## Submission

- Create a new branch of this repository and make a pull request to master
- Share a link to your test project code via any online Git repository
    - Include a `README.md` in your test project with:
        - Instructions on how to install dependencies and run the tests
        - A brief summary of the bugs you found and how you fixed them
        - Any assumptions you made
- Please deliver this as you would code that's ready for review — clean, well-organized, and following best practices
