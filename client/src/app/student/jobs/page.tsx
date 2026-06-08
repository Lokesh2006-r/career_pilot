"use client";

import { Briefcase, Building, MapPin, DollarSign, BrainCircuit, Star, Search, CheckCircle2, Loader2, ArrowUpRight, ExternalLink, Lightbulb, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  stipend: string;
  matchScore: number;
  tags: string[];
  logo: string;
  description: string;
  isHot: boolean;
  applyUrl: string;
  aiRationale: string;
  responsibilities: string[];
}

export default function InternshipJobMatcher() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [minMatchScore, setMinMatchScore] = useState(0);
  
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const initialJobs: Job[] = [
    {
      id: "google-swe",
      company: "Google",
      role: "Software Engineering Intern",
      location: "Bangalore, India",
      stipend: "₹80k - ₹100k / mo",
      matchScore: 98,
      tags: ["React", "TypeScript", "Node.js"],
      logo: "from-blue-500 via-indigo-600 to-indigo-700",
      description: "Join the Google Cloud team in Bangalore to construct scalable high-end frontend microservices, components, and fluid visual systems.",
      isHot: true,
      applyUrl: "https://careers.google.com/jobs/results/?location=India&q=Software%20Engineering%20Intern",
      aiRationale: "Your React and TypeScript skills perfectly match Google's Cloud console stack. Adding Node.js backend integration details to your resume will consolidate this match.",
      responsibilities: [
        "Develop and optimize cloud-native frontend micro-frontends.",
        "Write clean, accessible TypeScript code complying with web standards.",
        "Participate in code reviews and write comprehensive unit tests."
      ]
    },
    {
      id: "microsoft-frontend",
      company: "Microsoft",
      role: "Frontend Developer Intern",
      location: "Hyderabad, India",
      stipend: "₹70k - ₹90k / mo",
      matchScore: 92,
      tags: ["React", "Redux", "Tailwind CSS"],
      logo: "from-emerald-500 to-teal-650",
      description: "Work with the Office 365 core layout team in Hyderabad to craft accessible, highly responsive, and beautiful dashboard layouts.",
      isHot: false,
      applyUrl: "https://careers.microsoft.com/us/en/search-results?location=India&q=Frontend%20Intern",
      aiRationale: "Microsoft's Office UI fabric relies heavily on React/Redux. Your state management experience is a strong fit, but mastering accessibility (a11y) is recommended.",
      responsibilities: [
        "Craft responsive layout dashboards for Office 365 core products.",
        "Optimize bundle loading sizes and browser rendering speeds.",
        "Ensure cross-browser compatibility and accessible interfaces."
      ]
    },
    {
      id: "amazon-sde",
      company: "Amazon",
      role: "SDE Intern",
      location: "Chennai, India",
      stipend: "₹80k - ₹95k / mo",
      matchScore: 85,
      tags: ["Java", "AWS", "System Design"],
      logo: "from-orange-500 to-amber-600",
      description: "Design and implement robust microservice APIs, message streams, and database configurations for Chennai-based Prime Video teams.",
      isHot: false,
      applyUrl: "https://www.amazon.jobs/en/search?base_query=SDE%20Intern&loc_query=India",
      aiRationale: "Amazon SDE roles prioritize Java and AWS cloud patterns. Your system design fundamentals match well, but adding AWS database experience will fill the primary gap.",
      responsibilities: [
        "Implement scalable REST APIs using Java / Spring Boot frameworks.",
        "Deploy microservices on AWS container instances (ECS/Fargate).",
        "Optimize SQL queries and configure PostgreSQL database schemas."
      ]
    },
    {
      id: "stripe-fullstack",
      company: "Stripe",
      role: "Fullstack Intern",
      location: "Remote",
      stipend: "₹90k - ₹110k / mo",
      matchScore: 78,
      tags: ["React", "Ruby on Rails", "PostgreSQL"],
      logo: "from-indigo-500 to-purple-655",
      description: "Scale payment gateways, subscription pipelines, and financial ledger databases for global internet merchants as part of remote teams.",
      isHot: true,
      applyUrl: "https://stripe.com/jobs/search?query=Software%20Engineer",
      aiRationale: "Stripe values clean API design. Your Ruby/PostgreSQL interest fits their billing systems stack, but practicing message queue patterns (like Redis/Kafka) is advised.",
      responsibilities: [
        "Scale subscription management pipelines and checkout gateways.",
        "Maintain secure financial ledger transaction tables.",
        "Build intuitive dashboard settings and telemetry controls for merchants."
      ]
    },
    {
      id: "flipkart-backend",
      company: "Flipkart",
      role: "Backend Engineer Intern",
      location: "Bangalore, India",
      stipend: "₹50k - ₹65k / mo",
      matchScore: 94,
      tags: ["Java", "Spring Boot", "MySQL", "Redis"],
      logo: "from-blue-400 to-yellow-500",
      description: "Architect core transaction flows, cache clusters, and catalog query index engines for India's leading e-commerce platform.",
      isHot: true,
      applyUrl: "https://www.flipkartcareers.com/",
      aiRationale: "Flipkart backend systems handle high concurrent traffic. Your Spring Boot skills match their catalog indexers, but practicing Redis caching is key.",
      responsibilities: [
        "Develop high-throughput e-commerce catalog query engines.",
        "Manage caching layers using Redis clusters to reduce DB load.",
        "Deploy messaging systems using Apache Kafka for order notifications."
      ]
    },
    {
      id: "razorpay-fullstack",
      company: "Razorpay",
      role: "Fullstack Developer Intern",
      location: "Pune, India",
      stipend: "₹40k - ₹55k / mo",
      matchScore: 89,
      tags: ["React.js", "Node.js", "MongoDB", "Express"],
      logo: "from-blue-600 to-cyan-550",
      description: "Optimize payment checkout interfaces, merchant portals, and transaction analytics widgets in the Pune product engineering hub.",
      isHot: false,
      applyUrl: "https://razorpay.com/jobs/",
      aiRationale: "Razorpay builds finance portals on MERN stack. Your React/Node.js skills are a direct fit; adding MongoDB replication models will boost your index.",
      responsibilities: [
        "Develop secure payment checkout controls and partner dashboard views.",
        "Build backend API routers handling transaction validation webhooks.",
        "Write integration tests simulating complex transaction states."
      ]
    },
    {
      id: "cred-frontend",
      company: "CRED",
      role: "Frontend Engineer Intern",
      location: "Bangalore, India",
      stipend: "₹60k - ₹80k / mo",
      matchScore: 91,
      tags: ["Next.js", "Framer Motion", "Tailwind CSS", "TypeScript"],
      logo: "from-zinc-800 to-zinc-950 border border-zinc-800",
      description: "Craft ultra-premium, interactive glassmorphism UI components, fluid animations, and custom dashboard layouts for CRED's design system.",
      isHot: true,
      applyUrl: "https://careers.cred.club/",
      aiRationale: "CRED demands outstanding visual aesthetics. Your Next.js/Tailwind skills match their core UI. Adding Framer Motion animations makes you a hot candidate.",
      responsibilities: [
        "Engineer premium, interactive card payment layouts and user routes.",
        "Implement fluid animations and screen transition hooks.",
        "Benchmark client-side paint times and bundle sizes."
      ]
    },
    {
      id: "zomato-mobile",
      company: "Zomato",
      role: "Mobile Developer Intern",
      location: "Delhi NCR, India",
      stipend: "₹45k - ₹60k / mo",
      matchScore: 82,
      tags: ["React Native", "Flutter", "iOS", "Android"],
      logo: "from-red-500 to-rose-650",
      description: "Implement live delivery map trackers, local search filters, and smooth cart transitions inside Zomato's Gurgaon headquarters.",
      isHot: false,
      applyUrl: "https://www.zomato.com/careers",
      aiRationale: "Zomato's app processes thousands of delivery routes. Your mobile interests match, but you should practice real-time geographic map hooks.",
      responsibilities: [
        "Integrate live map tracking vectors and route calculators.",
        "Design responsive order checkout lists and cart summary layouts.",
        "Ensure smooth 60fps transitions across screen layouts."
      ]
    },
    {
      id: "tcs-systems",
      company: "TCS",
      role: "Systems Engineer Intern",
      location: "Mumbai, India",
      stipend: "₹25k - ₹35k / mo",
      matchScore: 72,
      tags: ["Python", "Linux", "SQL", "Git"],
      logo: "from-blue-700 to-sky-600",
      description: "Deploy internal database backups, server telemetry monitoring grids, and script custom command pipeline utilities.",
      isHot: false,
      applyUrl: "https://www.tcs.com/careers",
      aiRationale: "TCS systems roles cover enterprise cloud setup. Adding script automation (Python/Bash) and SQL database queries to your profile is recommended.",
      responsibilities: [
        "Deploy database backups and maintain database integrity.",
        "Develop custom Python utilities to automate server telemetry alerts.",
        "Provide client system setup support and Nginx routing configs."
      ]
    },
    {
      id: "paytm-devops",
      company: "Paytm",
      role: "DevOps Intern",
      location: "Delhi NCR, India",
      stipend: "₹35k - ₹45k / mo",
      matchScore: 86,
      tags: ["Docker", "Kubernetes", "AWS", "Nginx"],
      logo: "from-sky-500 to-blue-800",
      description: "Configure container clusters, setup CI/CD validation checks, and scale reverse-proxies for wallet transactions under peak load.",
      isHot: false,
      applyUrl: "https://careers.paytm.com/",
      aiRationale: "Paytm handles millions of active sessions. Your AWS interest fits, but learning Docker and Kubernetes container deployment is essential.",
      responsibilities: [
        "Orchestrate Docker containers on AWS Kubernetes clusters.",
        "Set up automated CI/CD pipeline tests and deployments.",
        "Configure Nginx load balancers to route API traffic under peak hours."
      ]
    },
    {
      id: "ola-backend",
      company: "Ola Cabs",
      role: "Backend Engineer Intern",
      location: "Bangalore, India",
      stipend: "₹45k - ₹55k / mo",
      matchScore: 87,
      tags: ["Python", "FastAPI", "PostgreSQL", "Kafka"],
      logo: "from-lime-500 to-zinc-850",
      description: "Work on geographic partitioning pipelines, real-time driver allocation message brokers, and ride logging routers.",
      isHot: false,
      applyUrl: "https://www.olacabs.com/careers",
      aiRationale: "Ola rides allocation requires fast real-time pipelines. Practicing Kafka message streams and PostgreSQL geospatial query optimization fits this role.",
      responsibilities: [
        "Write ride allocation logic using asynchronous Python scripts.",
        "Query geospatial indexes in PostgreSQL to locate closest drivers.",
        "Stream booking events to Kafka message buses."
      ]
    },
    {
      id: "swiggy-frontend",
      company: "Swiggy",
      role: "Frontend Developer Intern",
      location: "Hyderabad, India",
      stipend: "₹45k - ₹55k / mo",
      matchScore: 88,
      tags: ["React", "Redux Toolkit", "Webpack", "Tailwind CSS"],
      logo: "from-orange-400 to-rose-500",
      description: "Scale high-frequency merchant and delivery panels, optimizing state syncs and browser render cycle latency in Hyderabad offices.",
      isHot: false,
      applyUrl: "https://careers.swiggy.com/",
      aiRationale: "Swiggy's merchant panels operate under high state updates. Your React/Redux skills are a strong match; optimize bundle assets to improve score.",
      responsibilities: [
        "Build real-time delivery management dashboards for restaurant partners.",
        "Optimize state management pipelines using Redux Toolkit.",
        "Implement lazy-loading and dynamic imports to improve load times."
      ]
    },
    {
      id: "phonepe-fullstack",
      company: "PhonePe",
      role: "Fullstack Intern",
      location: "Pune, India",
      stipend: "₹55k - ₹70k / mo",
      matchScore: 90,
      tags: ["React", "Java", "Spring Boot", "Cassandra"],
      logo: "from-purple-650 to-indigo-800",
      description: "Integrate Unified Payments Interface (UPI) transaction endpoints and build secure transaction ledger control panels in Pune.",
      isHot: true,
      applyUrl: "https://www.phonepe.com/careers/",
      aiRationale: "PhonePe transactions require strict consistency. Your Java/React skills align; understanding Cassandra column family distribution is a plus.",
      responsibilities: [
        "Integrate Unified Payments Interface (UPI) transaction gateways.",
        "Build real-time settlement dashboards for retail merchants.",
        "Configure Cassandra data models representing transaction logs."
      ]
    },
    {
      id: "jio-aiml",
      company: "Jio Platforms",
      role: "AI/ML Engineer Intern",
      location: "Mumbai, India",
      stipend: "₹50k - ₹70k / mo",
      matchScore: 93,
      tags: ["PyTorch", "TensorFlow", "Python", "Docker"],
      logo: "from-blue-600 to-rose-600",
      description: "Train customer recommendation language models and deploy containerized translation endpoints in Reliance Corporate Park.",
      isHot: true,
      applyUrl: "https://careers.jio.com/",
      aiRationale: "Jio platforms train large recommendation systems. Your PyTorch skills align; learning containerized deployment models will bridge the DevOps gap.",
      responsibilities: [
        "Train customer recommendation models on massive telecom user logs.",
        "Deploy PyTorch inference models using FastAPI and Docker endpoints.",
        "Optimize model processing times for live streaming suggestions."
      ]
    },
    {
      id: "wipro-swe",
      company: "Wipro",
      role: "Software Engineer Intern",
      location: "Hyderabad, India",
      stipend: "₹20k - ₹28k / mo",
      matchScore: 68,
      tags: ["Java", "SQL", "JavaScript", "CSS"],
      logo: "from-purple-500 via-pink-500 to-blue-500",
      description: "Develop diagnostic test scripts, execute database updates, and configure client business systems.",
      isHot: false,
      applyUrl: "https://careers.wipro.com/",
      aiRationale: "Wipro software engineers configure diverse enterprise packages. Your JavaScript/Java skills fit well; focus on SQL relational joins.",
      responsibilities: [
        "Configure custom software updates for corporate clients.",
        "Write transactional SQL queries to generate database report logs.",
        "Perform code diagnostic tests and bug logging operations."
      ]
    },
    {
      id: "infosys-cloud",
      company: "Infosys",
      role: "Cloud Support Intern",
      location: "Chennai, India",
      stipend: "₹20k - ₹28k / mo",
      matchScore: 65,
      tags: ["AWS", "Linux", "Nginx", "Python"],
      logo: "from-blue-500 to-sky-400",
      description: "Monitor server load metrics, resolve network connection drops, and assist with migrating client sites to AWS setups.",
      isHot: false,
      applyUrl: "https://www.infosys.com/careers.html",
      aiRationale: "Infosys cloud supports large site migrations. Adding AWS EC2 configuration and Linux routing credentials is recommended.",
      responsibilities: [
        "Monitor cloud server memory and CPU utilization rates.",
        "Setup Nginx reverse proxies on remote Linux server instances.",
        "Assist with client website migrations to AWS Cloud infrastructure."
      ]
    }
  ];

  // Set the default selected job on load
  useEffect(() => {
    if (initialJobs.length > 0) {
      setSelectedJob(initialJobs[0]);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`applied_internships_${user.uid}`);
    if (saved) {
      try {
        setAppliedJobs(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  const handleApply = (id: string, redirectUrl: string) => {
    setApplyingJobId(id);
    
    // Open the respective job listing target link immediately
    if (typeof window !== "undefined") {
      window.open(redirectUrl, "_blank", "noopener,noreferrer");
    }

    // Set applied status in our app
    setTimeout(() => {
      const updated = { ...appliedJobs, [id]: true };
      setAppliedJobs(updated);
      if (user) {
        localStorage.setItem(`applied_internships_${user.uid}`, JSON.stringify(updated));
      }
      setApplyingJobId(null);
    }, 1000);
  };

  const handleResetApplyStatus = (id: string) => {
    const updated = { ...appliedJobs, [id]: false };
    setAppliedJobs(updated);
    if (user) {
      localStorage.setItem(`applied_internships_${user.uid}`, JSON.stringify(updated));
    }
  };

  const filteredJobs = initialJobs.filter(job => {
    const matchesSearch = 
      job.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation = 
      selectedLocation === "All Locations" || 
      (selectedLocation === "Remote" && job.location.toLowerCase().includes("remote")) ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesRole = 
      selectedRole === "All Roles" ||
      (selectedRole === "Software Engineer / SDE" && (job.role.toLowerCase().includes("software") || job.role.toLowerCase().includes("sde"))) ||
      (selectedRole === "Frontend Developer" && job.role.toLowerCase().includes("frontend")) ||
      (selectedRole === "Backend Developer" && job.role.toLowerCase().includes("backend")) ||
      (selectedRole === "Fullstack Developer" && job.role.toLowerCase().includes("fullstack")) ||
      (selectedRole === "AI/ML Engineer" && (job.role.toLowerCase().includes("ai") || job.role.toLowerCase().includes("ml") || job.role.toLowerCase().includes("machine"))) ||
      (selectedRole === "DevOps Engineer" && job.role.toLowerCase().includes("devops"));

    const matchesScore = job.matchScore >= minMatchScore;

    return matchesSearch && matchesLocation && matchesRole && matchesScore;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans text-zinc-900 dark:text-zinc-100">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Internship/Job Offers Feed</h1>
        <p className="text-zinc-555 dark:text-zinc-400 mt-1 font-medium">
          Search and apply to tech roles across India. Click an offer to view complete details.
        </p>
      </header>

      {/* Search and Filters Bar */}
      <div className="flex flex-col xl:flex-row gap-4 items-center">
        {/* Keyword Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, job title, or skill tags..." 
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs font-semibold placeholder-zinc-450 shadow-sm"
          />
        </div>

        {/* Role Category Dropdown */}
        <div className="w-full xl:w-auto relative shrink-0">
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full xl:w-56 pl-4 pr-10 py-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none shadow-sm"
          >
            <option value="All Roles">All Roles</option>
            <option value="Software Engineer / SDE">Software Engineer / SDE</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Fullstack Developer">Fullstack Developer</option>
            <option value="AI/ML Engineer">AI/ML Engineer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</span>
        </div>

        {/* Location Dropdown */}
        <div className="w-full xl:w-auto relative shrink-0">
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full xl:w-48 pl-4 pr-10 py-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none shadow-sm"
          >
            <option value="All Locations">All Locations</option>
            <option value="Remote">Remote</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chennai">Chennai</option>
            <option value="Delhi NCR">Delhi NCR</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</span>
        </div>

        {/* Match Index Dropdown */}
        <div className="w-full xl:w-auto relative shrink-0">
          <select 
            value={minMatchScore} 
            onChange={(e) => setMinMatchScore(Number(e.target.value))}
            className="w-full xl:w-48 pl-4 pr-10 py-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none shadow-sm"
          >
            <option value={0}>Any Match Score</option>
            <option value={80}>80%+ Match</option>
            <option value={90}>90%+ Match</option>
            <option value={95}>95%+ Match</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</span>
        </div>
      </div>

      {/* Main Split Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Job Listings */}
        <div className="lg:col-span-5 space-y-3 max-h-[75vh] overflow-y-auto pr-1">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              
              return (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job)}
                  className={`glass-panel p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group/card border ${
                    isSelected
                      ? "border-indigo-550/40 bg-indigo-500/5 shadow-[0_4px_25px_rgba(99,102,241,0.1)]"
                      : "border-zinc-200/50 dark:border-zinc-800/40 hover:border-zinc-350 dark:hover:border-zinc-700 bg-white/20 dark:bg-zinc-950/20"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        job.isHot 
                          ? "text-rose-500 bg-rose-500/10 border-rose-550/15" 
                          : "text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800"
                      }`}>
                        {job.isHot ? "Hot" : "Standard"}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">{job.matchScore}% Match</span>
                  </div>

                  <div className="flex items-center gap-3.5 mb-2.5">
                    <div className={`w-9 h-9 rounded-lg flex-shrink-0 bg-gradient-to-tr ${job.logo} text-white flex items-center justify-center font-black text-sm shadow-sm`}>
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white group-hover/card:text-indigo-500 dark:group-hover/card:text-indigo-400 transition-colors leading-tight">
                        {job.role}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">{job.company} • {job.location.split(",")[0]}</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-550 dark:text-zinc-400 line-clamp-2 leading-relaxed font-semibold">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {job.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400">
                        {tag}
                      </span>
                    ))}
                    {job.tags.length > 3 && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 text-zinc-400">+{job.tags.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-panel rounded-3xl p-16 text-center text-zinc-550 border border-zinc-200/50 dark:border-zinc-800/40">
              No matching jobs found. Adjust your search or filters.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Selected Job Details */}
        <div className="lg:col-span-7">
          {selectedJob ? (
            <div className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Job Header */}
              <div className="space-y-3 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/25 rounded-md">
                      {selectedJob.company}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-zinc-150 dark:bg-zinc-900 text-zinc-500 border border-zinc-200/60 dark:border-zinc-800 rounded-md">
                      {selectedJob.location}
                    </span>
                  </div>

                  <span className="text-xs font-black text-emerald-500 dark:text-emerald-400 tracking-wide flex items-center gap-1">
                    <Target className="w-4 h-4 text-emerald-500" />
                    {selectedJob.matchScore}% Matching Index
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                  {selectedJob.role}
                </h2>
                <div className="flex items-center justify-between text-xs text-zinc-450 font-bold">
                  <span>Stipend: {selectedJob.stipend}</span>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Role Overview
                </h3>
                <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed font-semibold">
                  {selectedJob.description}
                </p>
              </div>

              {/* AI Alignment Rationale */}
              {selectedJob.aiRationale && (
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex gap-3 text-xs text-indigo-700 dark:text-indigo-300">
                  <BrainCircuit className="w-5 h-5 shrink-0 text-indigo-500 animate-pulse" />
                  <div>
                    <span className="font-extrabold uppercase tracking-wide">AI Match Analysis:</span>
                    <p className="mt-1 leading-relaxed font-semibold">{selectedJob.aiRationale}</p>
                  </div>
                </div>
              )}

              {/* Responsibilities Section */}
              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" /> Key Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {selectedJob.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-550 dark:text-zinc-450 font-semibold leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Required Skill Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-xs font-bold rounded-xl text-zinc-650 dark:text-zinc-350"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Apply Section */}
              <div className="border-t border-zinc-200/50 dark:border-zinc-800/40 pt-5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Building className="w-4.5 h-4.5 text-emerald-500" />
                  <span className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider">Hiring Directly in India</span>
                </div>

                {appliedJobs[selectedJob.id] ? (
                  <div className="flex items-center gap-2">
                    <span 
                      className="flex items-center gap-1.5 px-6 py-3 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-500/20 shrink-0"
                    >
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      Applied to Position
                    </span>
                    <button 
                      onClick={() => handleResetApplyStatus(selectedJob.id)}
                      className="px-3.5 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 rounded-xl text-xs font-bold transition-all border border-zinc-200/50 dark:border-zinc-800/40 cursor-pointer"
                      title="Reset applied status"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleApply(selectedJob.id, selectedJob.applyUrl)}
                    disabled={applyingJobId === selectedJob.id}
                    className="px-6 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 border border-transparent dark:border-white/10"
                  >
                    {applyingJobId === selectedJob.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Redirecting to Apply...
                      </>
                    ) : (
                      <>
                        Apply to Position
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel p-20 rounded-3xl text-center border-dashed border-zinc-300 dark:border-zinc-850 flex flex-col items-center justify-center">
              <Briefcase className="w-12 h-12 text-zinc-400 animate-bounce mb-4" />
              <h3 className="font-extrabold text-zinc-900 dark:text-white mb-2">No Job Selected</h3>
              <p className="text-sm text-zinc-550 dark:text-zinc-400 max-w-sm leading-relaxed">
                Select an internship/job offer listing from the feed on the left to view complete details, AI analysis, and submit your application.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
