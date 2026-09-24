import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return <main className="narrow"><a href="/">← Event page</a><h1>Admin sign in</h1><SignIn routing="path" path="/admin/sign-in" forceRedirectUrl="/admin" /></main>;
}
