import SignupPage from "./SignupPage";

export default function Page({ searchParams }: { searchParams: { redirect?: string } }) {
  return <SignupPage redirectUrl={searchParams.redirect || ""} />;
}
