import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center bg-background px-4 py-12">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#A3501E",
            colorBackground: "#FFFFFF",
            colorInputBackground: "#FFFFFF",
            colorText: "#2D241C",
            borderRadius: "0.5rem",
            fontFamily: "Georgia, serif",
          },
        }}
      />
    </div>
  );
}
