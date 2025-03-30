
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const EmailSignupForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    // Simulated API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
      toast.success("Thanks for signing up! We'll be in touch soon.");
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md bg-muted/30 border-muted placeholder:text-muted-foreground/70"
          required
        />
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/80 text-white font-medium"
        >
          {isSubmitting ? "Submitting..." : "Sign Up"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center sm:text-left">
        Stay updated on our projects & opportunities
      </p>
    </form>
  );
};
