import LoginForm from "@/components/login-form";
import { Logo } from "@/components/icons";
import Image from 'next/image';
import placeholderImage from '@/lib/placeholder-images.json';

export default function Home() {
  return (
    <main className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[380px] gap-8">
          <div className="grid gap-4 text-center">
            <div className="flex items-center justify-center gap-4">
              <Logo className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold tracking-tighter">
                FEEDBACK - JCE
              </h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="https://picsum.photos/seed/1/1200/1800"
          alt="Abstract art representing feedback and loops"
          data-ai-hint="abstract feedback"
          width={1200}
          height={1800}
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
        <div className="absolute bottom-10 left-10 text-white max-w-lg">
          <h2 className="text-3xl font-bold">Comprehensive Feedback, Simplified.</h2>
          <p className="text-lg mt-2 text-white/80">Gain valuable insights and foster continuous improvement across your institution with our intuitive feedback platform.</p>
        </div>
      </div>
    </main>
  );
}
