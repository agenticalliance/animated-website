import { AILOGO } from "@/components/AILOGO";
import { EmailSignupForm } from "@/components/EmailSignupForm";
import { Header } from "@/components/Header";
import skillsData from "@/data/skills.json";

/**
 * Represents the main index/home page of the website.
 * Features a hero section with the AILOGO visualization,
 * an email signup form, and a standard footer.
 */
const Index = () => {
  // Load skills from JSON file
  const skills = skillsData.scope;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Header />
      
      {/* Hero section with AILOGO */}
      <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
        {/* AILOGO container */}
        <div className="absolute inset-0 z-0">
          <AILOGO skills={skills} />
        </div>
        
        {/* Content overlay */}
        <div className="container relative z-10 mt-16 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-[#00e6ff] to-[#008b99] inline-block text-transparent bg-clip-text animate-text-shimmer bg-300% max-w-3xl">
            AGENTIC ALLIANCE
          </h1>
          <p className="text-lg md:text-xl text-[#e1e1e1] max-w-2xl mb-12 animate-fade-in">
          Creating the Future of Agentic AI
          </p>
        </div>
      </section>
      
      {/* Email signup section */}
      <section className="relative py-20 bg-[#0a1419]/50">
        <div className="container flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center text-[#00e6ff]">
            Join Our Network
          </h2>
          <EmailSignupForm />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-[#0a1419]">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-[#00e6ff]/20 pt-8">
            <p className="text-sm text-[#e1e1e1]">
              &copy; {new Date().getFullYear()} Agentic Alliance. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="https://x.com/flossverse" target="_blank" rel="noopener noreferrer" className="text-[#e1e1e1] hover:text-[#00e6ff] transition-colors">
                Flossverse
              </a>
              <a href="#" className="text-[#e1e1e1] hover:text-[#00e6ff] transition-colors">
                Instagram
              </a>
              <a href="https://www.linkedin.com/company/Agentic Allianceinstitute/?" target="_blank" rel="noopener noreferrer" className="text-[#e1e1e1] hover:text-[#00e6ff] transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
