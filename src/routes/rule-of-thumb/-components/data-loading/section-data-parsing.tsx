import { cx } from "@/stylex";
import { ShieldCheckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { BestPractice, SectionHeading, TabbedCodeExample } from "../index";
import { DataParsingDemo } from "./data-parsing-demo";

export function DataParsingSection() {
  return (
    <>
{/* ================================================================== */}
      {/* SECTION 8: Parsing Data from External Source */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="Parsing Data from External Source"
          description="Always validate and parse data from APIs or databases to catch issues early."
        />

        <DataParsingDemo />

        <div className={cx("mt-8 grid sm:grid-cols-2 gap-4 mb-8")}>
          <div className={cx("p-6 rounded-xl border border-negative/30 bg-negative/10")}>
            <div className={cx("flex items-center gap-2 mb-3")}>
              <WarningCircleIcon size={18} className={cx("text-negative-foreground")} />
              <h3 className={cx("font-semibold text-negative-foreground")}>Without Parsing</h3>
            </div>
            <p className={cx("text-sm text-muted-foreground mb-4")}>What can go wrong:</p>
            <ul className={cx("text-sm text-muted-foreground space-y-2")}>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground")}>✗</span>
                <span>
                  <strong className={cx("text-foreground")}>Runtime crashes</strong> — Accessing{" "}
                  <code className={cx("text-xs bg-background px-1 rounded")}>
                    user.name.toUpperCase()
                  </code>{" "}
                  when name is undefined
                </span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground")}>✗</span>
                <span>
                  <strong className={cx("text-foreground")}>Type mismatches</strong> — Expecting number,
                  getting string like{" "}
                  <code className={cx("text-xs bg-background px-1 rounded")}>"42"</code>
                </span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground")}>✗</span>
                <span>
                  <strong className={cx("text-foreground")}>Silent failures</strong> — Missing fields that
                  cause subtle bugs later
                </span>
              </li>
            </ul>
          </div>

          <div className={cx("p-6 rounded-xl border border-positive/30 bg-positive/10")}>
            <div className={cx("flex items-center gap-2 mb-3")}>
              <ShieldCheckIcon size={18} className={cx("text-positive-foreground")} />
              <h3 className={cx("font-semibold text-positive-foreground")}>With Parsing</h3>
            </div>
            <p className={cx("text-sm text-muted-foreground mb-4")}>Benefits:</p>
            <ul className={cx("text-sm text-muted-foreground space-y-2")}>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground")}>✓</span>
                <span>
                  <strong className={cx("text-foreground")}>Early error detection</strong> — Catch invalid
                  data at the boundary
                </span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground")}>✓</span>
                <span>
                  <strong className={cx("text-foreground")}>Type safety</strong> — TypeScript knows the
                  exact shape after parsing
                </span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground")}>✓</span>
                <span>
                  <strong className={cx("text-foreground")}>Graceful handling</strong> — Use fallbacks or
                  show meaningful errors
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className={cx("space-y-4 mb-8")}>
          <BestPractice
            emoji="🛡️"
            title="Parse at the boundary"
            description="Validate data as soon as it enters your application — right after fetch() or database query. Don't let invalid data propagate."
          />
          <BestPractice
            emoji="🔄"
            title="Use fallback values"
            description="For optional fields, provide sensible defaults. role: 'User' is better than role: undefined crashing your UI."
          />
          <BestPractice
            emoji="📝"
            title="Show meaningful errors"
            description="When parsing fails, display a user-friendly message. Log the technical details to your observability tools."
          />
          <BestPractice
            emoji="🎯"
            title="Keep schemas in sync"
            description="When your API changes, update your validation schemas. Zod/Yup schemas are living documentation of your data contracts."
          />
        </div>

        <div className={cx("mt-8")}>
          <TabbedCodeExample
            title="Data Validation with Zod"
            tabs={[
              {
                label: "Basic Parsing",
                code: `import { z } from 'zod';

// Define the expected shape
const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Admin', 'User', 'Editor']).default('User'),
  avatar: z.string().url().optional(),
});

type User = z.infer<typeof UserSchema>;

// Parse API response
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  
  // Parse and validate - throws if invalid
  return UserSchema.parse(data);
}`,
              },
              {
                label: "Safe Parsing",
                code: `import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Admin', 'User', 'Editor']).default('User'),
});

async function fetchUser(id: string) {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  
  // safeParse doesn't throw - returns success/error
  const result = UserSchema.safeParse(data);
  
  if (!result.success) {
    // Handle validation errors gracefully
    console.error('Validation failed:', result.error.issues);
    
    // Report to observability
    captureException(result.error, { context: 'fetchUser' });
    
    // Return null or throw custom error
    return null;
  }
  
  // TypeScript knows result.data is User
  return result.data;
}`,
              },
              {
                label: "With TanStack Query",
                code: `import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

const UsersSchema = z.array(z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
}));

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      const data = await res.json();
      
      // Parse in queryFn - errors trigger error state
      return UsersSchema.parse(data);
    },
  });
}

function UserList() {
  const { data: users, error, isLoading } = useUsers();
  
  if (error instanceof z.ZodError) {
    // Specific handling for validation errors
    return <div>Invalid data received from server</div>;
  }
  
  if (error) return <ErrorState error={error} />;
  if (isLoading) return <Skeleton />;
  
  // users is typed correctly as User[]
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
              },
            ]}
            description="Zod provides runtime validation with TypeScript type inference. Parse external data to catch issues early."
          />
        </div>
      </div>
    </>
  );
}
